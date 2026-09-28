import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createClient, startTestServer, type TestServer } from './helpers.ts'

// RN-016 under concurrency. Plain assertions, no snapshot: the characterization suite's
// snapshot must stay untouched by the PostgreSQL migration.

let server: TestServer
let call: ReturnType<typeof createClient>
let adminToken: string

const originalConsoleError = console.error

before(async () => {
  console.error = () => {}
  server = await startTestServer()
  call = createClient(server.baseUrl)
  const { body } = await call('POST', '/auth/login', {
    body: { email: 'admin@autoagenda.local', password: 'Demo@123' },
  })
  adminToken = (body as { token: string }).token
})

after(async () => {
  await server.close()
  console.error = originalConsoleError
})

function nextWeekday(daysAhead: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysAhead)
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function firstFreeSlotFor(studentSearch: string, day: string) {
  const students = await call('GET', `/students?search=${studentSearch}`, { token: adminToken })
  const student = (students.body as { items: Array<{ id: string; category_id: string }> }).items[0]!
  const search = await call(
    'GET',
    `/availability/slots?studentId=${student.id}&categoryId=${student.category_id}&dateFrom=${day}&dateTo=${addDays(day, 1)}`,
    { token: adminToken },
  )
  const slot = (search.body as { items: Array<Record<string, string>> }).items[0]!
  return {
    student,
    slot,
    payload: {
      studentId: student.id,
      instructorId: slot.instructorId,
      vehicleId: slot.vehicleId,
      categoryId: student.category_id,
      startAt: slot.startAt,
    },
  }
}

test('two identical bookings fired at once: exactly one wins, the other is a 409', async () => {
  const { payload } = await firstFreeSlotFor('Bruno', nextWeekday(11))

  const results = await Promise.all([
    call('POST', '/appointments', { token: adminToken, body: payload }),
    call('POST', '/appointments', { token: adminToken, body: payload }),
  ])

  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409])
  const loser = results.find((result) => result.status === 409)!
  assert.match((loser.body as { code: string }).code, /^APPOINTMENT_(STUDENT|INSTRUCTOR|VEHICLE)_CONFLICT$/)
})

test('eight identical bookings fired at once: still exactly one 201', async () => {
  const { payload } = await firstFreeSlotFor('Bruno', nextWeekday(15))

  const results = await Promise.all(
    Array.from({ length: 8 }, () => call('POST', '/appointments', { token: adminToken, body: payload })),
  )

  const statuses = results.map((result) => result.status)
  assert.equal(statuses.filter((status) => status === 201).length, 1)
  assert.equal(statuses.filter((status) => status === 409).length, 7)
})

test('the database itself rejects an overlapping instructor booking that bypasses the app check', async () => {
  const { student, slot, payload } = await firstFreeSlotFor('Diego', nextWeekday(12))
  const booked = await call('POST', '/appointments', { token: adminToken, body: payload })
  assert.equal(booked.status, 201)

  // Raw SQL, skipping appointmentService: a different student and vehicle, same
  // instructor, overlapping range — only the exclusion constraint can stop it.
  const others = await server.db.query<{ student_id: string; vehicle_id: string; created_by: string }>(
    `SELECT s.id AS student_id, v.id AS vehicle_id, u.id AS created_by
     FROM student s, vehicle v, "user" u
     WHERE s.id <> $1 AND v.id <> $2 AND u.role = 'ADMIN'
     LIMIT 1`,
    [student.id, slot.vehicleId],
  )
  const other = others.rows[0]!

  await assert.rejects(
    server.db.query(
      `INSERT INTO appointment (id, student_id, instructor_id, vehicle_id, category_id, start_at, end_at, created_by)
       VALUES ('raw-overlap', $1, $2, $3, $4, $5::timestamptz + interval '10 minutes', $5::timestamptz + interval '60 minutes', $6)`,
      [other.student_id, slot.instructorId, other.vehicle_id, student.category_id, slot.startAt, other.created_by],
    ),
    (error: { code?: string; constraint?: string }) =>
      error.code === '23P01' && error.constraint === 'appointment_instructor_no_overlap',
  )
})

test('back-to-back lessons (end = next start) are both accepted', async () => {
  const { slot, payload } = await firstFreeSlotFor('Ana', nextWeekday(13))

  const first = await call('POST', '/appointments', { token: adminToken, body: payload })
  assert.equal(first.status, 201)

  // Same student, instructor and vehicle; the second lesson starts exactly when the
  // first one ends. The half-open range in the exclusion constraints allows it.
  const second = await call('POST', '/appointments', {
    token: adminToken,
    body: { ...payload, startAt: slot.endAt },
  })
  assert.equal(second.status, 201)
})
