import type { Queryable } from '../database/connection.ts'
import { bind } from '../database/params.ts'

export interface StudentRecord {
  id: string
  user_id: string | null
  full_name: string
  document: string | null
  phone: string
  birth_date: string | null
  category_id: string
  status: string
  created_at: string
  updated_at: string
}

export interface StudentFilters {
  search?: string
  status?: string
}

export interface FindManyParams extends StudentFilters {
  page: number
  pageSize: number
}

export interface CreateStudentInput {
  id: string
  fullName: string
  document: string | null
  phone: string
  birthDate: string | null
  categoryId: string
}

export interface UpdateStudentInput {
  fullName?: string
  document?: string | null
  phone?: string
  birthDate?: string | null
  categoryId?: string
}

export interface StudentModel {
  findMany(params: FindManyParams): Promise<StudentRecord[]>
  count(filters: StudentFilters): Promise<number>
  findById(id: string): Promise<StudentRecord | undefined>
  findByUserId(userId: string): Promise<StudentRecord | undefined>
  create(input: CreateStudentInput): Promise<StudentRecord>
  update(id: string, input: UpdateStudentInput): Promise<StudentRecord | undefined>
  updateStatus(id: string, status: string): Promise<StudentRecord | undefined>
  linkUserId(id: string, userId: string): Promise<StudentRecord | undefined>
}

function buildFilters({ search, status }: StudentFilters): { where: string; params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (search) {
    // ILIKE: SQLite's LIKE ignored case for ASCII; keep the search case-insensitive.
    const like = bind(params, `%${search}%`)
    clauses.push(`(full_name ILIKE ${like} OR document ILIKE ${like})`)
  }

  if (status) {
    clauses.push(`status = ${bind(params, status)}`)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createStudentModel(db: Queryable): StudentModel {
  async function findById(id: string): Promise<StudentRecord | undefined> {
    const { rows } = await db.query<StudentRecord>('SELECT * FROM student WHERE id = $1', [id])
    return rows[0]
  }

  return {
    async findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const limit = bind(params, pageSize)
      const offset = bind(params, (page - 1) * pageSize)
      const { rows } = await db.query<StudentRecord>(
        `SELECT * FROM student ${where} ORDER BY full_name LIMIT ${limit} OFFSET ${offset}`,
        params,
      )
      return rows
    },

    async count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const { rows } = await db.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM student ${where}`,
        params,
      )
      return rows[0]!.total
    },

    findById,

    async findByUserId(userId) {
      const { rows } = await db.query<StudentRecord>('SELECT * FROM student WHERE user_id = $1', [userId])
      return rows[0]
    },

    async create({ id, fullName, document, phone, birthDate, categoryId }) {
      const { rows } = await db.query<StudentRecord>(
        `INSERT INTO student (id, full_name, document, phone, birth_date, category_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         RETURNING *`,
        [id, fullName, document, phone, birthDate, categoryId],
      )
      return rows[0]!
    },

    async update(id, input) {
      const existing = await findById(id)
      if (!existing) return undefined

      const fullName = input.fullName ?? existing.full_name
      const document = input.document !== undefined ? input.document : existing.document
      const phone = input.phone ?? existing.phone
      const birthDate = input.birthDate !== undefined ? input.birthDate : existing.birth_date
      const categoryId = input.categoryId ?? existing.category_id

      const { rows } = await db.query<StudentRecord>(
        `UPDATE student
         SET full_name = $1, document = $2, phone = $3, birth_date = $4, category_id = $5, updated_at = now()
         WHERE id = $6
         RETURNING *`,
        [fullName, document, phone, birthDate, categoryId, id],
      )
      return rows[0]
    },

    async updateStatus(id, status) {
      const { rows } = await db.query<StudentRecord>(
        `UPDATE student SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [status, id],
      )
      return rows[0]
    },

    async linkUserId(id, userId) {
      const { rows } = await db.query<StudentRecord>(
        `UPDATE student SET user_id = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [userId, id],
      )
      return rows[0]
    },
  }
}
