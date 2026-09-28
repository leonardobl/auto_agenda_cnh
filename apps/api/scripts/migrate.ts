import { readdirSync, readFileSync } from 'node:fs'
import type { Database } from '../src/database/connection.ts'

export async function runMigrations(db: Database, migrationsDir: string): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const { rows } = await db.query<{ filename: string }>('SELECT filename FROM _migrations')
  const applied = new Set(rows.map((row) => row.filename))

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue

    const sql = readFileSync(`${migrationsDir}/${file}`, 'utf8')
    // Each file and its bookkeeping row commit together: a migration that fails halfway
    // leaves nothing applied and is retried from scratch next run.
    await db.withTransaction(async (tx) => {
      await tx.query(sql)
      await tx.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
    })
    console.log(`Applied migration: ${file}`)
  }
}
