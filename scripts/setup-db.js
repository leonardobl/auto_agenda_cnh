import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const DB_PATH = process.env.DB_PATH || 'data/app.db'

const alreadyExisted = existsSync(DB_PATH)

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL;')
db.close()

console.log(
  alreadyExisted
    ? `SQLite database already set up at ${DB_PATH}`
    : `SQLite database created at ${DB_PATH}`,
)
