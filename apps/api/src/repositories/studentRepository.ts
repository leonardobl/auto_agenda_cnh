import type { DatabaseSync } from 'node:sqlite'

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

export interface StudentRepository {
  findMany(params: FindManyParams): StudentRecord[]
  count(filters: StudentFilters): number
  findById(id: string): StudentRecord | undefined
  create(input: CreateStudentInput): StudentRecord
  update(id: string, input: UpdateStudentInput): StudentRecord | undefined
  updateStatus(id: string, status: string): StudentRecord | undefined
}

function buildFilters({ search, status }: StudentFilters): { where: string; params: string[] } {
  const clauses: string[] = []
  const params: string[] = []

  if (search) {
    clauses.push('(full_name LIKE ? OR document LIKE ?)')
    const like = `%${search}%`
    params.push(like, like)
  }

  if (status) {
    clauses.push('status = ?')
    params.push(status)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export function createStudentRepository(db: DatabaseSync): StudentRepository {
  function findById(id: string): StudentRecord | undefined {
    return db.prepare('SELECT * FROM student WHERE id = ?').get(id) as StudentRecord | undefined
  }

  return {
    findMany({ page, pageSize, search, status }) {
      const { where, params } = buildFilters({ search, status })
      const offset = (page - 1) * pageSize
      return db
        .prepare(`SELECT * FROM student ${where} ORDER BY full_name LIMIT ? OFFSET ?`)
        .all(...params, pageSize, offset) as unknown as StudentRecord[]
    },

    count({ search, status }) {
      const { where, params } = buildFilters({ search, status })
      const row = db.prepare(`SELECT COUNT(*) as total FROM student ${where}`).get(...params) as {
        total: number
      }
      return row.total
    },

    findById,

    create({ id, fullName, document, phone, birthDate, categoryId }) {
      db.prepare(
        `INSERT INTO student (id, full_name, document, phone, birth_date, category_id, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      ).run(id, fullName, document, phone, birthDate, categoryId)
      return findById(id)!
    },

    update(id, input) {
      const existing = findById(id)
      if (!existing) return undefined

      const fullName = input.fullName ?? existing.full_name
      const document = input.document !== undefined ? input.document : existing.document
      const phone = input.phone ?? existing.phone
      const birthDate = input.birthDate !== undefined ? input.birthDate : existing.birth_date
      const categoryId = input.categoryId ?? existing.category_id

      db.prepare(
        `UPDATE student
         SET full_name = ?, document = ?, phone = ?, birth_date = ?, category_id = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).run(fullName, document, phone, birthDate, categoryId, id)

      return findById(id)
    },

    updateStatus(id, status) {
      db.prepare(`UPDATE student SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id)
      return findById(id)
    },
  }
}
