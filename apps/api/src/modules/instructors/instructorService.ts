import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { ApiError } from '../../shared/ApiError.ts'
import { hashPassword } from '../../shared/passwordHash.ts'
import type { InstructorRepository, InstructorRecord } from '../../repositories/instructorRepository.ts'
import type { UserRepository } from '../../repositories/userRepository.ts'

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

export interface InstructorService {
  list(params: ListInstructorsParams): InstructorListResult
  register(params: RegisterInstructorParams): Promise<InstructorRecord>
  getById(id: string): InstructorRecord
  update(id: string, params: UpdateInstructorParams): InstructorRecord
}

interface InstructorServiceDeps {
  db: DatabaseSync
  userRepository: UserRepository
  instructorRepository: InstructorRepository
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

export function createInstructorService({
  db,
  userRepository,
  instructorRepository,
}: InstructorServiceDeps): InstructorService {
  return {
    list({ page, pageSize, search, status }) {
      const parsedPage = parsePage(page)
      const parsedPageSize = parsePageSize(pageSize)
      const filters = { search: parseOptionalString(search), status: parseOptionalString(status) }

      const items = instructorRepository.findMany({ page: parsedPage, pageSize: parsedPageSize, ...filters })
      const total = instructorRepository.count(filters)

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

      db.exec('BEGIN')
      try {
        const user = userRepository.create({
          id: randomUUID(),
          email: email.trim(),
          passwordHash,
          role: 'INSTRUCTOR',
          status: 'ACTIVE',
        })

        const instructor = instructorRepository.create({
          id: randomUUID(),
          userId: user.id,
          fullName: fullName.trim(),
          document: normalizedDocument,
          credentialNumber: credentialNumber.trim(),
          phone: phone.trim(),
        })

        db.exec('COMMIT')
        return instructor
      } catch (error) {
        db.exec('ROLLBACK')

        if (isUniqueConstraintError(error, 'user', 'email')) {
          throw new ApiError(409, 'INSTRUCTOR_EMAIL_CONFLICT', 'Já existe uma conta com este e-mail.')
        }
        if (isUniqueConstraintError(error, 'instructor', 'credential_number')) {
          throw new ApiError(
            409,
            'INSTRUCTOR_CREDENTIAL_CONFLICT',
            'Já existe um instrutor com este registro profissional.',
          )
        }
        if (isUniqueConstraintError(error, 'instructor', 'document')) {
          throw new ApiError(409, 'INSTRUCTOR_DOCUMENT_CONFLICT', 'Já existe um instrutor com este documento.')
        }
        throw error
      }
    },

    getById(id) {
      const instructor = instructorRepository.findById(id)
      if (!instructor) {
        throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
      }
      return instructor
    },

    update(id, { fullName, document, credentialNumber, phone, status }) {
      try {
        const updated = instructorRepository.update(id, {
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
        if (isUniqueConstraintError(error, 'instructor', 'credential_number')) {
          throw new ApiError(
            409,
            'INSTRUCTOR_CREDENTIAL_CONFLICT',
            'Já existe um instrutor com este registro profissional.',
          )
        }
        if (isUniqueConstraintError(error, 'instructor', 'document')) {
          throw new ApiError(409, 'INSTRUCTOR_DOCUMENT_CONFLICT', 'Já existe um instrutor com este documento.')
        }
        throw error
      }
    },
  }
}
