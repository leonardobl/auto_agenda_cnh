import type { DatabaseSync } from 'node:sqlite'

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

export interface SessionRepository {
  create(input: CreateSessionInput): void
  findValidById(id: string): SessionRecord | undefined
  delete(id: string): void
  deleteAllForUser(userId: string): void
}

export function createSessionRepository(db: DatabaseSync): SessionRepository {
  return {
    create({ id, userId, ttlSeconds }) {
      // expires_at is computed via SQLite's own datetime() so it stays in the same
      // format as datetime('now') below — a JS-generated ISO string would compare
      // incorrectly against it (different separators break lexicographic ordering).
      db.prepare(
        `INSERT INTO session (id, user_id, expires_at)
         VALUES (?, ?, datetime('now', '+' || ? || ' seconds'))`,
      ).run(id, userId, ttlSeconds)
    },
    findValidById(id) {
      return db
        .prepare("SELECT * FROM session WHERE id = ? AND expires_at > datetime('now')")
        .get(id) as SessionRecord | undefined
    },
    delete(id) {
      db.prepare('DELETE FROM session WHERE id = ?').run(id)
    },
    deleteAllForUser(userId) {
      db.prepare('DELETE FROM session WHERE user_id = ?').run(userId)
    },
  }
}
