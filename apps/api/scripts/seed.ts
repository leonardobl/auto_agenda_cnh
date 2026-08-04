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

const DEMO_STUDENTS = [
  { fullName: 'Ana Beatriz Souza', document: '12345678901', phone: '(11) 91234-5601', categoryCode: 'B' },
  { fullName: 'Bruno Carvalho Lima', document: '12345678902', phone: '(11) 91234-5602', categoryCode: 'A' },
  { fullName: 'Camila Ferreira Dias', document: '12345678903', phone: '(11) 91234-5603', categoryCode: 'AB' },
  { fullName: 'Diego Martins Rocha', document: '12345678904', phone: '(11) 91234-5604', categoryCode: 'B' },
  { fullName: 'Elisa Nogueira Pinto', document: '12345678905', phone: '(11) 91234-5605', categoryCode: 'C' },
] as const

export function seedDemoStudents(db: DatabaseSync): void {
  const existing = db.prepare('SELECT id FROM student LIMIT 1').get()
  if (existing) return

  const categoryByCode = new Map(
    (db.prepare('SELECT id, code FROM license_category').all() as { id: string; code: string }[]).map(
      (category) => [category.code, category.id],
    ),
  )

  const insert = db.prepare(
    `INSERT INTO student (id, full_name, document, phone, category_id, status)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
  )

  for (const student of DEMO_STUDENTS) {
    const categoryId = categoryByCode.get(student.categoryCode)
    if (!categoryId) continue
    insert.run(randomUUID(), student.fullName, student.document, student.phone, categoryId)
  }

  console.log(`Seeded ${DEMO_STUDENTS.length} demo students`)
}
