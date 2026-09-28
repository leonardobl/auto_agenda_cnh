import type { Queryable } from '../database/connection.ts'
import { bind } from '../database/params.ts'

export interface InstructorRecord {
  id: string
  user_id: string
  full_name: string
  document: string | null
  credential_number: string
  phone: string
  status: string
  created_at: string
  updated_at: string
  email: string
}

export interface InstructorFilters {
  search?: string
  status?: string
}

export interface FindManyParams extends InstructorFilters {
  page: number
  pageSize: number
}

export interface CreateInstructorInput {
  id: string
  userId: string
  fullName: string
  document: string | null
  credentialNumber: string
  phone: string
}

export interface UpdateInstructorInput {
  fullName?: string
  document?: string | null
  credentialNumber?: string
  phone?: string
  status?: string
}

export interface InstructorModel {
  findMany(params: FindManyParams): Promise<InstructorRecord[]>
  count(filters: InstructorFilters): Promise<number>
  findById(id: string): Promise<InstructorRecord | undefined>
  findByUserId(userId: string): Promise<InstructorRecord | undefined>
  create(input: CreateInstructorInput): Promise<InstructorRecord>
  update(id: string, input: UpdateInstructorInput): Promise<InstructorRecord | undefined>
}

const SELECT_WITH_EMAIL = `
  SELECT instructor.*, "user".email AS email
  FROM instructor
  JOIN "user" ON "user".id = instructor.user_id
`

function buildFilters({ search, status }: InstructorFilters): { where: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (search) {
    const like = bind(params, `%${search}%`)
    clauses.push(
      `(instructor.full_name ILIKE ${like} OR instructor.document ILIKE ${like} OR instructor.credential_number ILIKE ${like})`,
    )
  }

  if (status) {
    clauses.push(`instructor.status = ${bind(params, status)}`)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createInstructorModel(db: Queryable): InstructorModel {
  async function findById(id: string): Promise<InstructorRecord | undefined> {
    const { rows } = await db.query<InstructorRecord>(`${SELECT_WITH_EMAIL} WHERE instructor.id = $1`, [id])
    return rows[0]
  }

  return {
    async findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const limit = bind(params, pageSize)
      const offset = bind(params, (page - 1) * pageSize)
      const { rows } = await db.query<InstructorRecord>(
        `${SELECT_WITH_EMAIL} ${where} ORDER BY instructor.full_name LIMIT ${limit} OFFSET ${offset}`,
        params,
      )
      return rows
    },

    async count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const { rows } = await db.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM instructor ${where}`,
        params,
      )
      return rows[0]!.total
    },

    findById,

    async findByUserId(userId) {
      const { rows } = await db.query<InstructorRecord>(`${SELECT_WITH_EMAIL} WHERE instructor.user_id = $1`, [
        userId,
      ])
      return rows[0]
    },

    async create({ id, userId, fullName, document, credentialNumber, phone }) {
      await db.query(
        `INSERT INTO instructor (id, user_id, full_name, document, credential_number, phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')`,
        [id, userId, fullName, document, credentialNumber, phone],
      )
      return (await findById(id))!
    },

    async update(id, input) {
      const existing = await findById(id)
      if (!existing) return undefined

      const fullName = input.fullName ?? existing.full_name
      const document = input.document !== undefined ? input.document : existing.document
      const credentialNumber = input.credentialNumber ?? existing.credential_number
      const phone = input.phone ?? existing.phone
      const status = input.status ?? existing.status

      await db.query(
        `UPDATE instructor
         SET full_name = $1, document = $2, credential_number = $3, phone = $4, status = $5, updated_at = now()
         WHERE id = $6`,
        [fullName, document, credentialNumber, phone, status, id],
      )

      // Re-read (not RETURNING *): the record includes the joined login e-mail.
      return findById(id)
    },
  }
}
