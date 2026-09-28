import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import type { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../src/app.ts'
import { createConnection } from '../src/database/connection.ts'
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
  db: DatabaseSync
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

// Boots the real Express app on an ephemeral port over an in-memory SQLite database
// (real migrations + the same demo seed `yarn db:setup` runs) — no mocks, so a test
// exercises the same route → controller → model path production does.
export async function startTestServer(): Promise<TestServer> {
  const log = console.log
  console.log = () => {}
  const db = createConnection(':memory:')
  runMigrations(db, MIGRATIONS_DIR)
  await seedDemoUser(db)
  await seedDemoStudents(db)
  seedDemoVehicles(db)
  await seedDemoInstructors(db)
  seedDemoAppointments(db)
  console.log = log

  const app = createApp({ appOrigin: 'http://localhost:5173', db })
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening))
  })
  const { port } = server.address() as AddressInfo

  return {
    db,
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          db.close()
          if (error) reject(error)
          else resolve()
        })
      }),
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
