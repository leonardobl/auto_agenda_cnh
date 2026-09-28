import type { Queryable } from '../database/connection.ts'

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

export interface PasswordResetTokenModel {
  create(input: CreatePasswordResetTokenInput): Promise<void>
  findValidById(id: string): Promise<PasswordResetTokenRecord | undefined>
  markUsed(id: string): Promise<void>
}

export function createPasswordResetTokenModel(db: Queryable): PasswordResetTokenModel {
  return {
    async create({ id, userId, ttlSeconds }) {
      // Expiry uses the database clock, same reasoning as sessionModel.create.
      await db.query(
        `INSERT INTO password_reset_token (id, user_id, expires_at)
         VALUES ($1, $2, now() + make_interval(secs => $3))`,
        [id, userId, ttlSeconds],
      )
    },
    async findValidById(id) {
      const { rows } = await db.query<PasswordResetTokenRecord>(
        'SELECT * FROM password_reset_token WHERE id = $1 AND used_at IS NULL AND expires_at > now()',
        [id],
      )
      return rows[0]
    },
    async markUsed(id) {
      await db.query('UPDATE password_reset_token SET used_at = now() WHERE id = $1', [id])
    },
  }
}
