import { randomUUID } from 'node:crypto'
import type { Database } from '../database/connection.ts'
import { isUniqueViolation } from '../database/errors.ts'
import { ApiError } from '../shared/ApiError.ts'
import { hashPassword } from '../shared/passwordHash.ts'
import { createInstructorModel } from './instructorModel.ts'
import type { InstructorModel, InstructorRecord } from './instructorModel.ts'
import { createUserModel } from './userModel.ts'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const MIN_PASSWORD_LENGTH = 8

export interface InstructorListResult {
  items: InstructorRecord[]
  page: number
  pageSize: number
  total: number
}

export interface ListInstructorsParams {
  page?: unknown
  pageSize?: unknown
  search?: unknown
  status?: unknown
}

export interface RegisterInstructorParams {
  email?: unknown
  password?: unknown
  fullName?: unknown
  document?: unknown
  credentialNumber?: unknown
  phone?: unknown
}

export interface UpdateInstructorParams {
  fullName?: unknown
  document?: unknown
  credentialNumber?: unknown
  phone?: unknown
  status?: unknown
}

export interface UpdateOwnProfileParams {
  phone?: unknown
}

export interface InstructorService {
  list(params: ListInstructorsParams): Promise<InstructorListResult>
  register(params: RegisterInstructorParams): Promise<InstructorRecord>
  getById(id: string): Promise<InstructorRecord>
  update(id: string, params: UpdateInstructorParams): Promise<InstructorRecord>
  getOwnProfile(userId: string): Promise<InstructorRecord>
  updateOwnProfile(userId: string, params: UpdateOwnProfileParams): Promise<InstructorRecord>
}

interface InstructorServiceDeps {
  database: Database
  instructorModel: InstructorModel
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

export function createInstructorService({
  database,
  instructorModel,
}: InstructorServiceDeps): InstructorService {
  return {
    async list({ page, pageSize, search, status }) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)
      const filters = { search: parseOptionalString(search), status: parseOptionalString(status) }

      const items = await instructorModel.findMany({ page: parsedPage, pageSize: parsedPageSize, ...filters })
      const total = await instructorModel.count(filters)

      return { items, page: parsedPage, pageSize: parsedPageSize, total }
    },

    async register({ email, password, fullName, document, credentialNumber, phone }) {
      if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        password.length < MIN_PASSWORD_LENGTH ||
        typeof fullName !== 'string' ||
        !fullName.trim() ||
        typeof credentialNumber !== 'string' ||
        !credentialNumber.trim() ||
        typeof phone !== 'string' ||
        !phone.trim()
      ) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'E-mail, senha (mínimo 8 caracteres), nome completo, registro profissional e telefone são obrigatórios.',
        )
      }

      const passwordHash = await hashPassword(password)
      const normalizedDocument = parseOptionalString(document) ?? null

      try {
        // user + instructor rows commit together (or not at all); the models are rebuilt
        // on the transaction's client so both inserts share it.
        return await database.withTransaction(async (tx) => {
          const user = await createUserModel(tx).create({
            id: randomUUID(),
            email: email.trim(),
            passwordHash,
            role: 'INSTRUCTOR',
            status: 'ACTIVE',
          })

          return createInstructorModel(tx).create({
            id: randomUUID(),
            userId: user.id,
            fullName: fullName.trim(),
            document: normalizedDocument,
            credentialNumber: credentialNumber.trim(),
            phone: phone.trim(),
          })
        })
      } catch (error) {
        if (isUniqueViolation(error, 'user_email_key')) {
          throw new ApiError(409, 'INSTRUCTOR_EMAIL_CONFLICT', 'Já existe uma conta com este e-mail.')
        }
        if (isUniqueViolation(error, 'instructor_credential_number_key')) {
          throw new ApiError(
            409,
            'INSTRUCTOR_CREDENTIAL_CONFLICT',
            'Já existe um instrutor com este registro profissional.',
          )
        }
        if (isUniqueViolation(error, 'instructor_document_key')) {
          throw new ApiError(409, 'INSTRUCTOR_DOCUMENT_CONFLICT', 'Já existe um instrutor com este documento.')
        }
        throw error
      }
    },

    async getById(id) {
      const instructor = await instructorModel.findById(id)
      if (!instructor) {
        throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
      }
      return instructor
    },

    async update(id, { fullName, document, credentialNumber, phone, status }) {
      try {
        const updated = await instructorModel.update(id, {
          fullName: typeof fullName === 'string' ? fullName.trim() : undefined,
          document: document === undefined ? undefined : (parseOptionalString(document) ?? null),
          credentialNumber: typeof credentialNumber === 'string' ? credentialNumber.trim() : undefined,
          phone: typeof phone === 'string' ? phone.trim() : undefined,
          status: typeof status === 'string' ? status : undefined,
        })

        if (!updated) {
          throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
        }

        return updated
      } catch (error) {
        if (isUniqueViolation(error, 'instructor_credential_number_key')) {
          throw new ApiError(
            409,
            'INSTRUCTOR_CREDENTIAL_CONFLICT',
            'Já existe um instrutor com este registro profissional.',
          )
        }
        if (isUniqueViolation(error, 'instructor_document_key')) {
          throw new ApiError(409, 'INSTRUCTOR_DOCUMENT_CONFLICT', 'Já existe um instrutor com este documento.')
        }
        throw error
      }
    },

    async getOwnProfile(userId) {
      const instructor = await instructorModel.findByUserId(userId)
      if (!instructor) {
        throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
      }
      return instructor
    },

    async updateOwnProfile(userId, { phone }) {
      const instructor = await instructorModel.findByUserId(userId)
      if (!instructor) {
        throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
      }

      const updated = await instructorModel.update(instructor.id, {
        phone: typeof phone === 'string' ? phone.trim() : undefined,
      })

      return updated!
    },
  }
}
