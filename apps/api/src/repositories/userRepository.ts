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

export interface UserRepository {
  findByEmail(email: string): UserRecord | undefined
  findById(id: string): UserRecord | undefined
}

export function createUserRepository(db: DatabaseSync): UserRepository {
  return {
    findByEmail(email) {
      return db.prepare('SELECT * FROM user WHERE email = ?').get(email) as UserRecord | undefined
    },
    findById(id) {
      return db.prepare('SELECT * FROM user WHERE id = ?').get(id) as UserRecord | undefined
    },
  }
}
