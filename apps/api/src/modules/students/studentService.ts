import { randomUUID } from 'node:crypto'
import { ApiError } from '../../shared/ApiError.ts'
import type { StudentRepository, StudentRecord } from '../../repositories/studentRepository.ts'
import type { LicenseCategoryRepository } from '../../repositories/licenseCategoryRepository.ts'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

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

export interface StudentService {
  list(params: ListStudentsParams): StudentListResult
  register(params: CreateStudentParams): StudentRecord
  getById(id: string): StudentRecord
  update(id: string, params: UpdateStudentParams): StudentRecord
  deactivate(id: string): StudentRecord
}

interface StudentServiceDeps {
  studentRepository: StudentRepository
  licenseCategoryRepository: LicenseCategoryRepository
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

function isUniqueConstraintError(error: unknown, column: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code?: string }).code === 'ERR_SQLITE_ERROR' &&
    error.message.includes(`UNIQUE constraint failed: student.${column}`)
  )
}

export function createStudentService({
  studentRepository,
  licenseCategoryRepository,
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
        if (isUniqueConstraintError(error, 'document')) {
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
        if (isUniqueConstraintError(error, 'document')) {
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
  }
}
