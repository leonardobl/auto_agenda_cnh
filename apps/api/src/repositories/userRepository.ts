import type { DatabaseSync } from 'node:sqlite'

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

export interface UserRepository {
  findByEmail(email: string): UserRecord | undefined
  findById(id: string): UserRecord | undefined
  create(input: CreateUserInput): UserRecord
  updatePasswordHash(id: string, passwordHash: string): void
}

export function createUserRepository(db: DatabaseSync): UserRepository {
  function findById(id: string): UserRecord | undefined {
    return db.prepare('SELECT * FROM user WHERE id = ?').get(id) as UserRecord | undefined
  }

  return {
    findByEmail(email) {
      return db.prepare('SELECT * FROM user WHERE email = ?').get(email) as UserRecord | undefined
    },
    findById,
    create({ id, email, passwordHash, role, status }) {
      db.prepare(
        `INSERT INTO user (id, email, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(id, email, passwordHash, role, status)
      return findById(id)!
    },
    updatePasswordHash(id, passwordHash) {
      db.prepare(
        `UPDATE user SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
      ).run(passwordHash, id)
    },
  }
}
