import type { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { hashPassword } from '../src/shared/passwordHash.ts'
import { createStudentRepository } from '../src/repositories/studentRepository.ts'
import { createInstructorRepository } from '../src/repositories/instructorRepository.ts'
import { createInstructorAvailabilityRepository } from '../src/repositories/instructorAvailabilityRepository.ts'
import { createInstructorBlockRepository } from '../src/repositories/instructorBlockRepository.ts'
import { createVehicleRepository } from '../src/repositories/vehicleRepository.ts'
import { createAppointmentRepository } from '../src/repositories/appointmentRepository.ts'
import { createAppointmentService } from '../src/modules/appointments/appointmentService.ts'

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

export const DEMO_STUDENT_EMAIL = 'aluno1@autoagenda.local'
export const DEMO_STUDENT_PASSWORD = 'Demo@123'

const DEMO_STUDENTS = [
  {
    fullName: 'Ana Beatriz Souza',
    document: '12345678901',
    phone: '(11) 91234-5601',
    categoryCode: 'B',
    email: DEMO_STUDENT_EMAIL,
  },
  { fullName: 'Bruno Carvalho Lima', document: '12345678902', phone: '(11) 91234-5602', categoryCode: 'A' },
  { fullName: 'Camila Ferreira Dias', document: '12345678903', phone: '(11) 91234-5603', categoryCode: 'AB' },
  { fullName: 'Diego Martins Rocha', document: '12345678904', phone: '(11) 91234-5604', categoryCode: 'B' },
  { fullName: 'Elisa Nogueira Pinto', document: '12345678905', phone: '(11) 91234-5605', categoryCode: 'C' },
] as const

export async function seedDemoStudents(db: DatabaseSync): Promise<void> {
  const existing = db.prepare('SELECT id FROM student LIMIT 1').get()
  if (existing) return

  const categoryByCode = new Map(
    (db.prepare('SELECT id, code FROM license_category').all() as { id: string; code: string }[]).map(
      (category) => [category.code, category.id],
    ),
  )

  const insert = db.prepare(
    `INSERT INTO student (id, user_id, full_name, document, phone, category_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
  )

  let linkedAccounts = 0
  for (const student of DEMO_STUDENTS) {
    const categoryId = categoryByCode.get(student.categoryCode)
    if (!categoryId) continue

    let userId: string | null = null
    if ('email' in student && student.email) {
      const passwordHash = await hashPassword(DEMO_STUDENT_PASSWORD)
      userId = randomUUID()
      db.prepare(
        `INSERT INTO user (id, email, password_hash, role, status)
         VALUES (?, ?, ?, 'STUDENT', 'ACTIVE')`,
      ).run(userId, student.email, passwordHash)
      linkedAccounts += 1
    }

    insert.run(randomUUID(), userId, student.fullName, student.document, student.phone, categoryId)
  }

  console.log(`Seeded ${DEMO_STUDENTS.length} demo students (${linkedAccounts} with login account)`)
}

const DEMO_VEHICLES = [
  { plate: 'ABC1D23', brand: 'Volkswagen', model: 'Gol', year: 2020, categoryCode: 'B', status: 'ACTIVE' },
  { plate: 'DEF4E56', brand: 'Honda', model: 'CG 160', year: 2022, categoryCode: 'A', status: 'ACTIVE' },
  {
    plate: 'GHI7F89',
    brand: 'Chevrolet',
    model: 'Onix',
    year: 2019,
    categoryCode: 'B',
    status: 'MAINTENANCE',
  },
] as const

export function seedDemoVehicles(db: DatabaseSync): void {
  const existing = db.prepare('SELECT id FROM vehicle LIMIT 1').get()
  if (existing) return

  const categoryByCode = new Map(
    (db.prepare('SELECT id, code FROM license_category').all() as { id: string; code: string }[]).map(
      (category) => [category.code, category.id],
    ),
  )

  const insert = db.prepare(
    `INSERT INTO vehicle (id, plate, brand, model, year, category_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )

  for (const vehicle of DEMO_VEHICLES) {
    const categoryId = categoryByCode.get(vehicle.categoryCode)
    if (!categoryId) continue
    insert.run(randomUUID(), vehicle.plate, vehicle.brand, vehicle.model, vehicle.year, categoryId, vehicle.status)
  }

  console.log(`Seeded ${DEMO_VEHICLES.length} demo vehicles`)
}

export const DEMO_INSTRUCTOR_PASSWORD = 'Demo@123'

const DEMO_INSTRUCTORS = [
  {
    email: 'instrutor1@autoagenda.local',
    fullName: 'Fábio Ramos Teixeira',
    document: '98765432101',
    credentialNumber: 'CRED-0001',
    phone: '(11) 93456-7801',
  },
  {
    email: 'instrutor2@autoagenda.local',
    fullName: 'Juliana Castro Mendes',
    document: '98765432102',
    credentialNumber: 'CRED-0002',
    phone: '(11) 93456-7802',
  },
] as const

// Monday-Friday, matching appointmentService.ts's BUSINESS_HOURS_START/END_HOUR —
// keeps the existing scheduling demo working now that "no declared availability"
// means "never available" instead of "always available" (instructor-availability).
const DEMO_AVAILABILITY_WEEKDAYS = [1, 2, 3, 4, 5]
const DEMO_AVAILABILITY_START_TIME = '08:00'
const DEMO_AVAILABILITY_END_TIME = '18:00'

export async function seedDemoInstructors(db: DatabaseSync): Promise<void> {
  const existing = db.prepare('SELECT id FROM instructor LIMIT 1').get()
  if (existing) return

  const instructorAvailabilityRepository = createInstructorAvailabilityRepository(db)

  for (const instructor of DEMO_INSTRUCTORS) {
    const passwordHash = await hashPassword(DEMO_INSTRUCTOR_PASSWORD)
    const userId = randomUUID()

    db.prepare(
      `INSERT INTO user (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'INSTRUCTOR', 'ACTIVE')`,
    ).run(userId, instructor.email, passwordHash)

    const instructorId = randomUUID()
    db.prepare(
      `INSERT INTO instructor (id, user_id, full_name, document, credential_number, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    ).run(
      instructorId,
      userId,
      instructor.fullName,
      instructor.document,
      instructor.credentialNumber,
      instructor.phone,
    )

    for (const weekday of DEMO_AVAILABILITY_WEEKDAYS) {
      instructorAvailabilityRepository.create({
        id: randomUUID(),
        instructorId,
        weekday,
        startTime: DEMO_AVAILABILITY_START_TIME,
        endTime: DEMO_AVAILABILITY_END_TIME,
      })
    }
  }

  console.log(
    `Seeded ${DEMO_INSTRUCTORS.length} demo instructors with weekly availability (Mon-Fri, ${DEMO_AVAILABILITY_START_TIME}-${DEMO_AVAILABILITY_END_TIME})`,
  )
}

export function seedDemoAppointments(db: DatabaseSync): void {
  const existing = db.prepare('SELECT id FROM appointment LIMIT 1').get()
  if (existing) return

  const admin = db.prepare('SELECT id FROM user WHERE email = ?').get(DEMO_USER_EMAIL) as
    | { id: string }
    | undefined
  const student = db.prepare('SELECT id, category_id FROM student WHERE document = ?').get('12345678901') as
    | { id: string; category_id: string }
    | undefined
  const instructor = db
    .prepare('SELECT id FROM instructor WHERE credential_number = ?')
    .get('CRED-0001') as { id: string } | undefined
  const vehicle = db.prepare('SELECT id FROM vehicle WHERE plate = ?').get('ABC1D23') as
    | { id: string }
    | undefined

  if (!admin || !student || !instructor || !vehicle) return

  // Books through the real appointmentService.book() path (same validation as the
  // API), rather than a raw insert — cheap extra confidence that the scheduling
  // algorithm actually works end to end.
  const appointmentService = createAppointmentService({
    db,
    appointmentRepository: createAppointmentRepository(db),
    studentRepository: createStudentRepository(db),
    instructorRepository: createInstructorRepository(db),
    instructorAvailabilityRepository: createInstructorAvailabilityRepository(db),
    instructorBlockRepository: createInstructorBlockRepository(db),
    vehicleRepository: createVehicleRepository(db),
  })

  const startAt = new Date()
  startAt.setUTCDate(startAt.getUTCDate() + 3)
  // Nudge forward to a weekday — the seeded instructor availability (Mon-Fri) no
  // longer covers every day, so "+3 days" alone could land on a weekend.
  while (startAt.getUTCDay() === 0 || startAt.getUTCDay() === 6) {
    startAt.setUTCDate(startAt.getUTCDate() + 1)
  }
  startAt.setUTCHours(10, 0, 0, 0)

  try {
    appointmentService.book(
      {
        studentId: student.id,
        instructorId: instructor.id,
        vehicleId: vehicle.id,
        categoryId: student.category_id,
        startAt: startAt.toISOString(),
        durationMinutes: 50,
      },
      { role: 'ADMIN', userId: admin.id },
    )
    console.log('Seeded 1 demo appointment')
  } catch (error) {
    console.error('Failed to seed demo appointment:', error)
  }
}
