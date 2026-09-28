import { randomUUID } from 'node:crypto'
import type { Database } from '../database/connection.ts'
import { isUniqueViolation } from '../database/errors.ts'
import { ApiError } from '../shared/ApiError.ts'
import { hashPassword } from '../shared/passwordHash.ts'
import { createStudentModel } from './studentModel.ts'
import type { StudentModel, StudentRecord } from './studentModel.ts'
import type { LicenseCategoryModel } from './licenseCategoryModel.ts'
import { createUserModel } from './userModel.ts'

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
  list(params: ListStudentsParams): Promise<StudentListResult>
  register(params: CreateStudentParams): Promise<StudentRecord>
  getById(id: string): Promise<StudentRecord>
  update(id: string, params: UpdateStudentParams): Promise<StudentRecord>
  deactivate(id: string): Promise<StudentRecord>
  createAccount(id: string, params: CreateAccountParams): Promise<StudentRecord>
  getOwnProfile(userId: string): Promise<StudentRecord>
  updateOwnProfile(userId: string, params: UpdateOwnProfileParams): Promise<StudentRecord>
}

interface StudentServiceDeps {
  database: Database
  studentModel: StudentModel
  licenseCategoryModel: LicenseCategoryModel
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

export function createStudentService({
  database,
  studentModel,
  licenseCategoryModel,
}: StudentServiceDeps): StudentService {
  async function assertCategoryExists(categoryId: string): Promise<void> {
    const categories = await licenseCategoryModel.findAll()
    if (!categories.some((category) => category.id === categoryId)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Categoria de CNH inválida.')
    }
  }

  return {
    async list({ page, pageSize, search, status }) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)
      const filters = { search: parseOptionalString(search), status: parseOptionalString(status) }

      const items = await studentModel.findMany({ page: parsedPage, pageSize: parsedPageSize, ...filters })
      const total = await studentModel.count(filters)

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },

    async register({ fullName, document, phone, birthDate, categoryId }) {
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

      await assertCategoryExists(categoryId)

      const normalizedDocument = parseOptionalString(document) ?? null
      const normalizedBirthDate = parseOptionalString(birthDate) ?? null

      try {
        return await studentModel.create({
          id: randomUUID(),
          fullName: fullName.trim(),
          document: normalizedDocument,
          phone: phone.trim(),
          birthDate: normalizedBirthDate,
          categoryId,
        })
      } catch (error) {
        if (isUniqueViolation(error, 'student_document_key')) {
          throw new ApiError(409, 'STUDENT_DOCUMENT_CONFLICT', 'Já existe um aluno com este documento.')
        }
        throw error
      }
    },

    async getById(id) {
      const student = await studentModel.findById(id)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return student
    },

    async update(id, { fullName, document, phone, birthDate, categoryId }) {
      if (typeof categoryId === 'string' && categoryId) {
        await assertCategoryExists(categoryId)
      }

      try {
        const updated = await studentModel.update(id, {
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
        if (isUniqueViolation(error, 'student_document_key')) {
          throw new ApiError(409, 'STUDENT_DOCUMENT_CONFLICT', 'Já existe um aluno com este documento.')
        }
        throw error
      }
    },

    async deactivate(id) {
      const student = await studentModel.findById(id)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return (await studentModel.updateStatus(id, 'INACTIVE'))!
    },

    async createAccount(id, { email, password }) {
      const student = await studentModel.findById(id)
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

      try {
        // user insert + student link commit together; the models are rebuilt on the
        // transaction's client so both statements share it.
        return await database.withTransaction(async (tx) => {
          const user = await createUserModel(tx).create({
            id: randomUUID(),
            email: email.trim(),
            passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE',
          })

          return (await createStudentModel(tx).linkUserId(id, user.id))!
        })
      } catch (error) {
        if (isUniqueViolation(error, 'user_email_key')) {
          throw new ApiError(409, 'STUDENT_EMAIL_CONFLICT', 'Já existe uma conta com este e-mail.')
        }
        throw error
      }
    },

    async getOwnProfile(userId) {
      const student = await studentModel.findByUserId(userId)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }
      return student
    },

    async updateOwnProfile(userId, { phone }) {
      const student = await studentModel.findByUserId(userId)
      if (!student) {
        throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
      }

      const updated = await studentModel.update(student.id, {
        phone: typeof phone === 'string' ? phone.trim() : undefined,
      })

      return updated!
    },
  }
}
