import type { Queryable } from '../database/connection.ts'

export interface UserRecord {
  id: string
  email: string
  password_hash: string
  role: string
  status: string
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  id: string
  email: string
  passwordHash: string
  role: string
  status: string
}

export interface UserModel {
  findByEmail(email: string): Promise<UserRecord | undefined>
  findById(id: string): Promise<UserRecord | undefined>
  create(input: CreateUserInput): Promise<UserRecord>
  updatePasswordHash(id: string, passwordHash: string): Promise<void>
}

// "user" is a reserved word in PostgreSQL — always quoted.
export function createUserModel(db: Queryable): UserModel {
  return {
    async findByEmail(email) {
      const { rows } = await db.query<UserRecord>('SELECT * FROM "user" WHERE email = $1', [email])
      return rows[0]
    },
    async findById(id) {
      const { rows } = await db.query<UserRecord>('SELECT * FROM "user" WHERE id = $1', [id])
      return rows[0]
    },
    async create({ id, email, passwordHash, role, status }) {
      const { rows } = await db.query<UserRecord>(
        `INSERT INTO "user" (id, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, email, passwordHash, role, status],
      )
      return rows[0]!
    },
    async updatePasswordHash(id, passwordHash) {
      await db.query(`UPDATE "user" SET password_hash = $1, updated_at = now() WHERE id = $2`, [
        passwordHash,
        id,
      ])
    },
  }
}
