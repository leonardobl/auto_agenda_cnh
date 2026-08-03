import type { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { hashPassword } from '../src/shared/passwordHash.ts'

export const DEMO_USER_EMAIL = 'admin@autoagenda.local'
export const DEMO_USER_PASSWORD = 'Demo@123'

export async function seedDemoUser(db: DatabaseSync): Promise<void> {
  const existing = db.prepare('SELECT id FROM user LIMIT 1').get()
  if (existing) return

  const passwordHash = await hashPassword(DEMO_USER_PASSWORD)

  db.prepare(
    `INSERT INTO user (id, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), DEMO_USER_EMAIL, passwordHash, 'ADMIN', 'ACTIVE')

  console.log(`Seeded demo user: ${DEMO_USER_EMAIL}`)
}
