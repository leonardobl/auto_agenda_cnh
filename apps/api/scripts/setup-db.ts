import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runMigrations } from './migrate.ts'
import { seedDemoUser } from './seed.ts'

const DB_PATH = process.env.DB_PATH || 'data/app.db'
const MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/database/migrations',
)

const alreadyExisted = existsSync(DB_PATH)

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL;')

runMigrations(db, MIGRATIONS_DIR)
await seedDemoUser(db)

db.close()

console.log(
  alreadyExisted
    ? `SQLite database already set up at ${DB_PATH}`
    : `SQLite database created at ${DB_PATH}`,
)
