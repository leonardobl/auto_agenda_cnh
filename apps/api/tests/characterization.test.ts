import { after, before, test, type TestContext } from 'node:test'
import { createClient, createNormalizer, startTestServer, type TestServer } from './helpers.ts'

// Characterization suite: records what every endpoint returns TODAY (status + full
// normalized body) in tests/characterization.test.ts.snapshot, and fails if it ever
// changes. Written before the MVC migration (migrate-api-to-mvc) as its safety net —
// the snapshot must stay byte-identical after moving files around.
// Regenerate deliberately with `yarn test:update-snapshots`, never to "fix" a failure.

let server: TestServer
let call: ReturnType<typeof createClient>
let normalize: ReturnType<typeof createNormalizer>

const tokens: Record<string, string> = {}
const ids: Record<string, string> = {}

const originalConsoleError = console.error
const originalConsoleLog = console.log

before(async () => {
  console.error = () => {}
  console.log = () => {}
  server = await startTestServer()
  call = createClient(server.baseUrl)
  normalize = createNormalizer()

  for (const [role, email] of [
    ['admin', 'admin@autoagenda.local'],
    ['student', 'aluno1@autoagenda.local'],
    ['instructor', 'instrutor1@autoagenda.local'],
    ['instructor2', 'instrutor2@autoagenda.local'],
  ] as const) {
    const { body } = await call('POST', '/auth/login', { body: { email, password: 'Demo@123' } })
    tokens[role] = (body as { token: string }).token
  }
})

after(async () => {
  await server.close()
  console.error = originalConsoleError
  console.log = originalConsoleLog
})

async function record(t: TestContext, requests: Array<() => ReturnType<typeof call>>) {
  const results = []
  for (const request of requests) results.push(await request())
  t.assert.snapshot(normalize(results))
  return results
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function nextWeekday(daysAhead: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysAhead)
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------- health

test('health', async (t) => {
  await record(t, [() => call('GET', '/health'), () => call('GET', '/health/db')])
})

test('404 for an unknown route', async (t) => {
  await record(t, [() => call('GET', '/nope')])
})

// ---------------------------------------------------------------- auth

test('auth: login failures share one generic message', async (t) => {
  await record(t, [
    () => call('POST', '/auth/login', { body: { email: 'admin@autoagenda.local', password: 'wrong' } }),
    () => call('POST', '/auth/login', { body: { email: 'ghost@autoagenda.local', password: 'Demo@123' } }),
    () => call('POST', '/auth/login', { body: {} }),
  ])
})

test('auth: GET /me and unauthenticated access', async (t) => {
  await record(t, [
    () => call('GET', '/me', { token: tokens.admin }),
    () => call('GET', '/me', { token: tokens.student }),
    () => call('GET', '/me'),
    () => call('GET', '/me', { token: 'not-a-session' }),
  ])
})

test('auth: forgot-password answers identically for known and unknown e-mails', async (t) => {
  await record(t, [
    () => call('POST', '/auth/forgot-password', { body: { email: 'aluno1@autoagenda.local' } }),
    () => call('POST', '/auth/forgot-password', { body: { email: 'ghost@autoagenda.local' } }),
  ])
})

test('auth: reset-password rejects a bad token, accepts a real one and revokes sessions', async (t) => {
  const row = server.db.prepare('SELECT id FROM password_reset_token LIMIT 1').get() as { id: string }
  const before = await call('POST', '/auth/login', {
    body: { email: 'aluno1@autoagenda.local', password: 'Demo@123' },
  })
  const oldStudentToken = (before.body as { token: string }).token
  const results = await record(t, [
    () => call('POST', '/auth/reset-password', { body: { token: 'bad', password: 'Novo@1234' } }),
    () => call('POST', '/auth/reset-password', { body: { token: row.id, password: 'Novo@1234' } }),
    () => call('GET', '/me', { token: oldStudentToken }),
    () => call('POST', '/auth/login', { body: { email: 'aluno1@autoagenda.local', password: 'Demo@123' } }),
    () => call('POST', '/auth/login', { body: { email: 'aluno1@autoagenda.local', password: 'Novo@1234' } }),
  ])
  tokens.student = (results[4]!.body as { token: string }).token
})

// ---------------------------------------------------------------- students

test('students: license categories (Admin and Student, not Instructor)', async (t) => {
  const results = await record(t, [
    () => call('GET', '/license-categories', { token: tokens.admin }),
    () => call('GET', '/license-categories', { token: tokens.student }),
    () => call('GET', '/license-categories', { token: tokens.instructor }),
    () => call('GET', '/license-categories'),
  ])
  const categories = (results[0]!.body as Array<{ id: string; code: string }>) ?? []
  for (const category of categories) ids[`category${category.code}`] = category.id
})

test('students: list, pagination, search and status filter', async (t) => {
  await record(t, [
    () => call('GET', '/students', { token: tokens.admin }),
    () => call('GET', '/students?page=2&pageSize=2', { token: tokens.admin }),
    () => call('GET', '/students?search=Ana', { token: tokens.admin }),
    () => call('GET', '/students?status=INACTIVE', { token: tokens.admin }),
    () => call('GET', '/students', { token: tokens.student }),
    () => call('GET', '/students'),
  ])
})

test('students: register, duplicate document, validation', async (t) => {
  const results = await record(t, [
    () =>
      call('POST', '/students', {
        token: tokens.admin,
        body: {
          fullName: 'Fernanda Lopes',
          document: '11122233344',
          phone: '(11) 90000-0001',
          birthDate: '2000-05-10',
          categoryId: ids.categoryB,
        },
      }),
    () =>
      call('POST', '/students', {
        token: tokens.admin,
        body: {
          fullName: 'Outra Pessoa',
          document: '11122233344',
          phone: '(11) 90000-0002',
          categoryId: ids.categoryB,
        },
      }),
    () => call('POST', '/students', { token: tokens.admin, body: {} }),
    () =>
      call('POST', '/students', {
        token: tokens.admin,
        body: { fullName: 'Sem Categoria', phone: '(11) 90000-0003', categoryId: 'does-not-exist' },
      }),
  ])
  ids.newStudent = (results[0]!.body as { id: string }).id
})

test('students: get, update, not found', async (t) => {
  await record(t, [
    () => call('GET', `/students/${ids.newStudent}`, { token: tokens.admin }),
    () =>
      call('PATCH', `/students/${ids.newStudent}`, {
        token: tokens.admin,
        body: { fullName: 'Fernanda Lopes Silva', phone: '(11) 90000-9999' },
      }),
    () => call('GET', '/students/does-not-exist', { token: tokens.admin }),
    () => call('PATCH', '/students/does-not-exist', { token: tokens.admin, body: { phone: '1' } }),
  ])
})

test('students: create login account, second attempt conflicts', async (t) => {
  await record(t, [
    () =>
      call('POST', `/students/${ids.newStudent}/create-account`, {
        token: tokens.admin,
        body: { email: 'fernanda@autoagenda.local', password: 'Senha@1234' },
      }),
    () =>
      call('POST', `/students/${ids.newStudent}/create-account`, {
        token: tokens.admin,
        body: { email: 'fernanda2@autoagenda.local', password: 'Senha@1234' },
      }),
    () =>
      call('POST', '/auth/login', { body: { email: 'fernanda@autoagenda.local', password: 'Senha@1234' } }),
  ])
})

test('students: deactivate', async (t) => {
  await record(t, [
    () => call('POST', `/students/${ids.newStudent}/deactivate`, { token: tokens.admin }),
    () => call('GET', '/students?status=INACTIVE', { token: tokens.admin }),
  ])
})

test('students: self-service /students/me (only phone is editable)', async (t) => {
  await record(t, [
    () => call('GET', '/students/me', { token: tokens.student }),
    () =>
      call('PATCH', '/students/me', {
        token: tokens.student,
        body: { phone: '(11) 98888-0000', fullName: 'Ignored Name' },
      }),
    () => call('GET', '/students/me', { token: tokens.admin }),
    () => call('GET', '/students/me', { token: tokens.instructor }),
  ])
})

// ---------------------------------------------------------------- vehicles

test('vehicles: list, register, duplicate, get, update, permissions', async (t) => {
  const results = await record(t, [
    () => call('GET', '/vehicles', { token: tokens.admin }),
    () => call('GET', '/vehicles?status=MAINTENANCE', { token: tokens.admin }),
    () =>
      call('POST', '/vehicles', {
        token: tokens.admin,
        body: { plate: 'JKL1M23', brand: 'Fiat', model: 'Argo', year: 2021, categoryId: ids.categoryB },
      }),
    () =>
      call('POST', '/vehicles', {
        token: tokens.admin,
        body: { plate: 'JKL1M23', brand: 'Fiat', model: 'Argo', year: 2021, categoryId: ids.categoryB },
      }),
    () => call('POST', '/vehicles', { token: tokens.admin, body: {} }),
    () => call('GET', '/vehicles', { token: tokens.student }),
    () => call('GET', '/vehicles/does-not-exist', { token: tokens.admin }),
  ])
  ids.newVehicle = (results[2]!.body as { id: string }).id
  await record(t, [
    () => call('GET', `/vehicles/${ids.newVehicle}`, { token: tokens.admin }),
    () =>
      call('PATCH', `/vehicles/${ids.newVehicle}`, { token: tokens.admin, body: { status: 'MAINTENANCE' } }),
  ])
})

// ---------------------------------------------------------------- instructors

test('instructors: list, register, duplicate, get, update, permissions', async (t) => {
  const results = await record(t, [
    () => call('GET', '/instructors', { token: tokens.admin }),
    () =>
      call('POST', '/instructors', {
        token: tokens.admin,
        body: {
          email: 'instrutor3@autoagenda.local',
          password: 'Senha@1234',
          fullName: 'Marcos Vieira',
          document: '55566677788',
          credentialNumber: 'CRED-0003',
          phone: '(11) 93456-7803',
        },
      }),
    () =>
      call('POST', '/instructors', {
        token: tokens.admin,
        body: {
          email: 'instrutor3@autoagenda.local',
          password: 'Senha@1234',
          fullName: 'Marcos Vieira',
          document: '55566677788',
          credentialNumber: 'CRED-0003',
          phone: '(11) 93456-7803',
        },
      }),
    () => call('POST', '/instructors', { token: tokens.admin, body: {} }),
    () => call('GET', '/instructors', { token: tokens.instructor }),
    () => call('GET', '/instructors/does-not-exist', { token: tokens.admin }),
  ])
  ids.newInstructor = (results[1]!.body as { id: string }).id
  await record(t, [
    () => call('GET', `/instructors/${ids.newInstructor}`, { token: tokens.admin }),
    () =>
      call('PATCH', `/instructors/${ids.newInstructor}`, {
        token: tokens.admin,
        body: { phone: '(11) 90000-1111', status: 'INACTIVE', email: 'ignored@x.com' },
      }),
  ])
})

test('instructors: self-service /instructors/me (only phone is editable)', async (t) => {
  const results = await record(t, [
    () => call('GET', '/instructors/me', { token: tokens.instructor }),
    () =>
      call('PATCH', '/instructors/me', {
        token: tokens.instructor,
        body: { phone: '(11) 97777-0000', fullName: 'Ignored Name' },
      }),
    () => call('GET', '/instructors/me', { token: tokens.admin }),
    () => call('GET', '/instructors/me', { token: tokens.student }),
  ])
  ids.instructor1 = (results[0]!.body as { id: string }).id
  const other = await call('GET', '/instructors/me', { token: tokens.instructor2 })
  ids.instructor2 = (other.body as { id: string }).id
})

test('instructors: availability windows and blocks (Admin, owner, other instructor)', async (t) => {
  const day = nextWeekday(20)
  await record(t, [
    () => call('GET', `/instructors/${ids.instructor1}/availability`, { token: tokens.admin }),
    () => call('GET', `/instructors/${ids.instructor1}/availability`, { token: tokens.instructor }),
    () => call('GET', `/instructors/${ids.instructor1}/availability`, { token: tokens.instructor2 }),
    () => call('GET', `/instructors/${ids.instructor1}/availability`, { token: tokens.student }),
    () =>
      call('POST', `/instructors/${ids.instructor1}/availability`, {
        token: tokens.instructor,
        body: { weekday: 6, startTime: '08:00', endTime: '12:00' },
      }),
    () =>
      call('POST', `/instructors/${ids.instructor1}/availability`, {
        token: tokens.instructor2,
        body: { weekday: 6, startTime: '08:00', endTime: '12:00' },
      }),
    () =>
      call('POST', `/instructors/${ids.instructor1}/availability`, {
        token: tokens.admin,
        body: { weekday: 9, startTime: '12:00', endTime: '08:00' },
      }),
    () => call('GET', `/instructors/${ids.instructor1}/blocks`, { token: tokens.admin }),
    () =>
      call('POST', `/instructors/${ids.instructor1}/blocks`, {
        token: tokens.instructor,
        body: { startAt: `${day}T12:00:00.000Z`, endAt: `${day}T14:00:00.000Z`, reason: 'Consulta médica' },
      }),
    () =>
      call('POST', `/instructors/${ids.instructor1}/blocks`, {
        token: tokens.admin,
        body: { startAt: `${day}T14:00:00.000Z`, endAt: `${day}T12:00:00.000Z`, reason: 'Invertido' },
      }),
    () => call('GET', `/instructors/${ids.instructor1}/blocks`, { token: tokens.instructor }),
    () => call('GET', '/instructors/does-not-exist/availability', { token: tokens.admin }),
  ])
})

// ---------------------------------------------------------------- appointments

test('appointments: list is scoped per profile', async (t) => {
  await record(t, [
    () => call('GET', '/appointments', { token: tokens.admin }),
    () => call('GET', '/appointments?page=1&pageSize=1', { token: tokens.admin }),
    () => call('GET', '/appointments', { token: tokens.student }),
    () => call('GET', '/appointments', { token: tokens.instructor }),
    () => call('GET', '/appointments', { token: tokens.instructor2 }),
    () => call('GET', '/appointments'),
  ])
})

test('appointments: slot search validation and permissions', async (t) => {
  await record(t, [
    () => call('GET', '/availability/slots', { token: tokens.admin }),
    () => call('GET', '/availability/slots', { token: tokens.instructor }),
    () => call('GET', '/availability/slots'),
  ])
})

test('appointments: Admin searches and books a slot; the same slot cannot be booked twice', async (t) => {
  const dateFrom = nextWeekday(7)
  const students = await call('GET', '/students?search=Bruno', { token: tokens.admin })
  const bruno = (students.body as { items: Array<{ id: string; category_id: string }> }).items[0]!

  const search = await call(
    'GET',
    `/availability/slots?studentId=${bruno.id}&categoryId=${bruno.category_id}&dateFrom=${dateFrom}&dateTo=${addDays(dateFrom, 1)}`,
    { token: tokens.admin },
  )
  const slot = (search.body as { items: Array<Record<string, string>> }).items[0]!
  const payload = {
    studentId: bruno.id,
    instructorId: slot.instructorId,
    vehicleId: slot.vehicleId,
    categoryId: bruno.category_id,
    startAt: slot.startAt,
  }

  await record(t, [
    async () => search,
    () => call('POST', '/appointments', { token: tokens.admin, body: payload }),
    () => call('POST', '/appointments', { token: tokens.admin, body: payload }),
    () => call('POST', '/appointments', { token: tokens.admin, body: {} }),
    () => call('POST', '/appointments', { token: tokens.instructor, body: payload }),
    () => call('GET', '/appointments', { token: tokens.admin }),
  ])
})

test('appointments: Student books only for themselves, in their own category', async (t) => {
  const dateFrom = nextWeekday(9)
  const search = await call('GET', `/availability/slots?dateFrom=${dateFrom}&dateTo=${addDays(dateFrom, 1)}`, {
    token: tokens.student,
  })
  const slot = (search.body as { items: Array<Record<string, string>> }).items[0]!
  const other = await call('GET', '/students?search=Diego', { token: tokens.admin })
  const diego = (other.body as { items: Array<{ id: string; category_id: string }> }).items[0]!

  await record(t, [
    async () => search,
    () =>
      call('POST', '/appointments', {
        token: tokens.student,
        body: {
          studentId: diego.id,
          categoryId: diego.category_id,
          instructorId: slot.instructorId,
          vehicleId: slot.vehicleId,
          startAt: slot.startAt,
        },
      }),
    () => call('GET', '/appointments', { token: tokens.student }),
    () => call('GET', '/appointments', { token: tokens.instructor }),
  ])
})

test('appointments: an instructor block removes their slots', async (t) => {
  const day = nextWeekday(20)
  await record(t, [
    () =>
      call('GET', `/availability/slots?dateFrom=${day}&dateTo=${addDays(day, 1)}`, {
        token: tokens.student,
      }),
  ])
})

// ---------------------------------------------------------------- logout

test('auth: logout revokes the session', async (t) => {
  await record(t, [
    () => call('POST', '/auth/logout', { token: tokens.student }),
    () => call('GET', '/me', { token: tokens.student }),
    () => call('POST', '/auth/logout'),
  ])
})
