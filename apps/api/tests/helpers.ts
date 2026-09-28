import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { randomBytes } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../src/app.ts'
import { createDatabase, type Database } from '../src/database/connection.ts'
import { runMigrations } from '../scripts/migrate.ts'
import {
  seedDemoUser,
  seedDemoStudents,
  seedDemoVehicles,
  seedDemoInstructors,
  seedDemoAppointments,
} from '../scripts/seed.ts'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/database/migrations')

export interface TestServer {
  db: Database
  baseUrl: string
  close(): Promise<void>
}

export interface CallOptions {
  token?: string
  body?: unknown
}

export interface CallResult {
  status: number
  body: unknown
}

// Boots the real Express app on an ephemeral port over a throwaway PostgreSQL schema
// (real migrations + the same demo seed `yarn db:setup` runs) — no mocks, so a test
// exercises the same route → controller → model path production does.
//
// Isolation: the schema (`t_<random>`) is created in the database DATABASE_URL points to
// and dropped at the end; every test connection has `search_path = <schema>, public`, so
// unqualified table names resolve to the test schema's own tables and the development
// schema is never touched. `public` stays in the path only so the btree_gist extension
// (created there by migration 0007) is found.
export async function startTestServer(): Promise<TestServer> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the tests (see apps/api/.env.example).')
  }

  const schema = `t_${randomBytes(6).toString('hex')}`
  const admin = createDatabase(databaseUrl)
  await admin.query(`CREATE SCHEMA ${schema}`)
  const db = createDatabase(databaseUrl, { searchPath: `${schema},public` })

  const log = console.log
  console.log = () => {}
  try {
    await runMigrations(db, MIGRATIONS_DIR)
    await seedDemoUser(db)
    await seedDemoStudents(db)
    await seedDemoVehicles(db)
    await seedDemoInstructors(db)
    await seedDemoAppointments(db)
  } finally {
    console.log = log
  }

  const app = createApp({ appOrigin: 'http://localhost:5173', db })
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening))
  })
  const { port } = server.address() as AddressInfo

  return {
    db,
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      })
      await db.close()
      await admin.query(`DROP SCHEMA ${schema} CASCADE`)
      await admin.close()
    },
  }
}

export function createClient(baseUrl: string) {
  return async function call(method: string, path: string, options: CallOptions = {}): Promise<CallResult> {
    const headers: Record<string, string> = {}
    if (options.token) headers.authorization = `Bearer ${options.token}`
    if (options.body !== undefined) headers['content-type'] = 'application/json'

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    const text = await response.text()
    return { status: response.status, body: text ? JSON.parse(text) : null }
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z?$/

// Makes a response deterministic without erasing its shape: random UUIDs become
// `<id:N>` (N = order of first appearance, so relationships between records stay
// visible) and timestamps become `<timestamp>`. Every key and every other value is
// kept as-is, which is what makes the snapshot a real behavior lock.
export function createNormalizer() {
  const ids = new Map<string, number>()

  function normalize(value: unknown): unknown {
    if (typeof value === 'string') {
      if (UUID_PATTERN.test(value)) {
        if (!ids.has(value)) ids.set(value, ids.size + 1)
        return `<id:${ids.get(value)}>`
      }
      if (TIMESTAMP_PATTERN.test(value)) return '<timestamp>'
      return value
    }
    if (Array.isArray(value)) return value.map(normalize)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]))
    }
    return value
  }

  return normalize
}
