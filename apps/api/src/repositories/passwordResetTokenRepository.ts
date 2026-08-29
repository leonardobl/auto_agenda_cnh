import type { DatabaseSync } from 'node:sqlite'

export interface PasswordResetTokenRecord {
  id: string
  user_id: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface CreatePasswordResetTokenInput {
  id: string
  userId: string
  ttlSeconds: number
}

export interface PasswordResetTokenRepository {
  create(input: CreatePasswordResetTokenInput): void
  findValidById(id: string): PasswordResetTokenRecord | undefined
  markUsed(id: string): void
}

export function createPasswordResetTokenRepository(db: DatabaseSync): PasswordResetTokenRepository {
  return {
    create({ id, userId, ttlSeconds }) {
      // expires_at is computed via SQLite's own datetime(), same reasoning as sessionRepository.create.
      db.prepare(
        `INSERT INTO password_reset_token (id, user_id, expires_at)
         VALUES (?, ?, datetime('now', '+' || ? || ' seconds'))`,
      ).run(id, userId, ttlSeconds)
    },
    findValidById(id) {
      return db
        .prepare(
          "SELECT * FROM password_reset_token WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')",
        )
        .get(id) as PasswordResetTokenRecord | undefined
    },
    markUsed(id) {
      db.prepare("UPDATE password_reset_token SET used_at = datetime('now') WHERE id = ?").run(id)
    },
  }
}
