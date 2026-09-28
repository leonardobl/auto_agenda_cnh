import type { Queryable } from '../database/connection.ts'

export interface SessionRecord {
  id: string
  user_id: string
  expires_at: string
  created_at: string
}

export interface CreateSessionInput {
  id: string
  userId: string
  ttlSeconds: number
}

export interface SessionModel {
  create(input: CreateSessionInput): Promise<void>
  findValidById(id: string): Promise<SessionRecord | undefined>
  delete(id: string): Promise<void>
  deleteAllForUser(userId: string): Promise<void>
}

export function createSessionModel(db: Queryable): SessionModel {
  return {
    async create({ id, userId, ttlSeconds }) {
      // Expiry is computed by the database clock (now()), the same clock findValidById
      // compares against, so app-server clock skew can't make a fresh session look expired.
      await db.query(
        `INSERT INTO session (id, user_id, expires_at)
         VALUES ($1, $2, now() + make_interval(secs => $3))`,
        [id, userId, ttlSeconds],
      )
    },
    async findValidById(id) {
      const { rows } = await db.query<SessionRecord>(
        'SELECT * FROM session WHERE id = $1 AND expires_at > now()',
        [id],
      )
      return rows[0]
    },
    async delete(id) {
      await db.query('DELETE FROM session WHERE id = $1', [id])
    },
    async deleteAllForUser(userId) {
      await db.query('DELETE FROM session WHERE user_id = $1', [userId])
    },
  }
}
