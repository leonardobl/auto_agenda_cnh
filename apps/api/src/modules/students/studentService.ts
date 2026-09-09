import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { ApiError } from '../../shared/ApiError.ts'
import { hashPassword } from '../../shared/passwordHash.ts'
import type { StudentRepository, StudentRecord } from '../../repositories/studentRepository.ts'
import type { LicenseCategoryRepository } from '../../repositories/licenseCategoryRepository.ts'
import type { UserRepository } from '../../repositories/userRepository.ts'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const MIN_PASSWORD_LENGTH = 8

export interface StudentListResult {
  items: StudentRecord[]
  page: number
  pageSize: number
  total: number
}

export interface ListStudentsParams {
  page?: unknown
  pageSize?: unknown
  search?: unknown
  status?: unknown
}

export interface CreateStudentParams {
  fullName?: unknown
  document?: unknown
  phone?: unknown
  birthDate?: unknown
  categoryId?: unknown
}

export interface UpdateStudentParams {
  fullName?: unknown
  document?: unknown
  phone?: unknown
  birthDate?: unknown
  categoryId?: unknown
}

export interface CreateAccountParams {
  email?: unknown
  password?: unknown
}

export interface UpdateOwnProfileParams {
  phone?: unknown
}

export interface StudentService {
  list(params: ListStudentsParams): StudentListResult
  register(params: CreateStudentParams): StudentRecord
  getById(id: string): StudentRecord
  update(id: string, params: UpdateStudentParams): StudentRecord
  deactivate(id: string): StudentRecord
  createAccount(id: string, params: CreateAccountParams): Promise<StudentRecord>
  getOwnProfile(userId: string): StudentRecord
  updateOwnProfile(userId: string, params: UpdateOwnProfileParams): StudentRecord
}

interface StudentServiceDeps {
  db: DatabaseSync
  studentRepository: StudentRepository
  licenseCategoryRepository: LicenseCategoryRepository
  userRepository: UserRepository
}

function parsePage(value: unknown): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parsePageSize(value: unknown): number {
  const pageSize = Number(value)
  if (!Number.isInteger(pageSize) || pageSize <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(pageSize, MAX_PAGE_SIZE)
}

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function isUniqueConstraintError(error: unknown, table: string, column: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code?: string }).code === 'ERR_SQLITE_ERROR' &&
    error.message.includes(`UNIQUE constraint failed: ${table}.${column}`)
  )
}

export function createStudentService({
  db,
  studentRepository,
  licenseCategoryRepository,
  userRepository,
}: StudentServiceDeps): StudentService {
  function assertCategoryExists(categoryId: string): void {
    const categories = licenseCategoryRepository.findAll()
    if (!categories.some((category) => category.id === categoryId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria de CNH inválida.')
    }
  }

  return {
    list({ page, pageSize, search, status }) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)
      const filters = { search: parseOptionalString(search), status: parseOptionalString(status) }

      const items = studentRepository.findMany({ page: parsedPage, pageSize: parsedPageSize, ...filters })
      const total = studentRepository.count(filters)

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },

    register({ fullName, document, phone, birthDate, categoryId }) {
      if (
        typeof fullName !== 'string' ||
        !fullName.trim() ||
        typeof phone !== 'string' ||
        !phone.trim() ||
        typeof categoryId !== 'string' ||
        !categoryId
      ) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Nome completo, telefone e categoria são obrigatórios.')
      }

      assertCategoryExists(categoryId)

      const normalizedDocument = parseOptionalString(document) ?? null
      const normalizedBirthDate = parseOptionalString(birthDate) ?? null

      try {
        return studentRepository.create({
          id: randomUUID(),
          fullName: fullName.trim(),
          document: normalizedDocument,
          phone: phone.trim(),
          birthDate: normalizedBirthDate,
          categoryId,
        })
      } catch (error) {
        if (isUniqueConstraintError(error, 'student', 'document')) {
          throw new ApiError(409, 'STUDENT_DOCUMENT_CONFLICT', 'Já existe um aluno com este documento.')
        }
        throw error
      }
    },

    getById(id) {
      const student = studentRepository.findById(id)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return student
    },

    update(id, { fullName, document, phone, birthDate, categoryId }) {
      if (typeof categoryId === 'string' && categoryId) {
        assertCategoryExists(categoryId)
      }

      try {
        const updated = studentRepository.update(id, {
          fullName: typeof fullName === 'string' ? fullName.trim() : undefined,
          document: document === undefined ? undefined : (parseOptionalString(document) ?? null),
          phone: typeof phone === 'string' ? phone.trim() : undefined,
          birthDate: birthDate === undefined ? undefined : (parseOptionalString(birthDate) ?? null),
          categoryId: typeof categoryId === 'string' && categoryId ? categoryId : undefined,
        })

        if (!updated) {
          throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
        }

        return updated
      } catch (error) {
        if (isUniqueConstraintError(error, 'student', 'document')) {
          throw new ApiError(409, 'STUDENT_DOCUMENT_CONFLICT', 'Já existe um aluno com este documento.')
        }
        throw error
      }
    },

    deactivate(id) {
      const student = studentRepository.findById(id)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return studentRepository.updateStatus(id, 'INACTIVE')!
    },

    async createAccount(id, { email, password }) {
      const student = studentRepository.findById(id)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      if (student.user_id) {
        throw new ApiError(409, 'STUDENT_ALREADY_HAS_ACCOUNT', 'Este aluno já possui uma conta de login.')
      }
      if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        password.length < MIN_PASSWORD_LENGTH
      ) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'E-mail e senha (mínimo 8 caracteres) são obrigatórios.')
      }

      const passwordHash = await hashPassword(password)

      db.exec('BEGIN')
      try {
        const user = userRepository.create({
          id: randomUUID(),
          email: email.trim(),
          passwordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
        })

        const updated = studentRepository.linkUserId(id, user.id)!

        db.exec('COMMIT')
        return updated
      } catch (error) {
        db.exec('ROLLBACK')

        if (isUniqueConstraintError(error, 'user', 'email')) {
          throw new ApiError(409, 'STUDENT_EMAIL_CONFLICT', 'Já existe uma conta com este e-mail.')
        }
        throw error
      }
    },

    getOwnProfile(userId) {
      const student = studentRepository.findByUserId(userId)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return student
    },

    updateOwnProfile(userId, { phone }) {
      const student = studentRepository.findByUserId(userId)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }

      const updated = studentRepository.update(student.id, {
        phone: typeof phone === 'string' ? phone.trim() : undefined,
      })

      return updated!
    },
  }
}
