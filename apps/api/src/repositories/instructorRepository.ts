import type { DatabaseSync } from 'node:sqlite'

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

export interface InstructorRepository {
  findMany(params: FindManyParams): InstructorRecord[]
  count(filters: InstructorFilters): number
  findById(id: string): InstructorRecord | undefined
  findByUserId(userId: string): InstructorRecord | undefined
  create(input: CreateInstructorInput): InstructorRecord
  update(id: string, input: UpdateInstructorInput): InstructorRecord | undefined
}

const SELECT_WITH_EMAIL = `
  SELECT instructor.*, user.email as email
  FROM instructor
  JOIN user ON user.id = instructor.user_id
`

function buildFilters({ search, status }: InstructorFilters): { where: string; params: string[] } {
  const clauses: string[] = []
  const params: string[] = []

  if (search) {
    clauses.push('(instructor.full_name LIKE ? OR instructor.document LIKE ? OR instructor.credential_number LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }

  if (status) {
    clauses.push('instructor.status = ?')
    params.push(status)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createInstructorRepository(db: DatabaseSync): InstructorRepository {
  function findById(id: string): InstructorRecord | undefined {
    return db
      .prepare(`${SELECT_WITH_EMAIL} WHERE instructor.id = ?`)
      .get(id) as InstructorRecord | undefined
  }

  return {
    findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const offset = (page - 1) * pageSize
      return db
        .prepare(`${SELECT_WITH_EMAIL} ${where} ORDER BY instructor.full_name LIMIT ? OFFSET ?`)
        .all(...params, pageSize, offset) as unknown as InstructorRecord[]
    },

    count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const row = db
        .prepare(`SELECT COUNT(*) as total FROM instructor ${where}`)
        .get(...params) as { total: number }
      return row.total
    },

    findById,

    findByUserId(userId) {
      return db
        .prepare(`${SELECT_WITH_EMAIL} WHERE instructor.user_id = ?`)
        .get(userId) as InstructorRecord | undefined
    },

    create({ id, userId, fullName, document, credentialNumber, phone }) {
      db.prepare(
        `INSERT INTO instructor (id, user_id, full_name, document, credential_number, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ).run(id, userId, fullName, document, credentialNumber, phone)
      return findById(id)!
    },

    update(id, input) {
      const existing = findById(id)
      if (!existing) return undefined

      const fullName = input.fullName ?? existing.full_name
      const document = input.document !== undefined ? input.document : existing.document
      const credentialNumber = input.credentialNumber ?? existing.credential_number
      const phone = input.phone ?? existing.phone
      const status = input.status ?? existing.status

      db.prepare(
        `UPDATE instructor
         SET full_name = ?, document = ?, credential_number = ?, phone = ?, status = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).run(fullName, document, credentialNumber, phone, status, id)

      return findById(id)
    },
  }
}
