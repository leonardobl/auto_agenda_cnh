import type { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'

export function runMigrations(db: DatabaseSync, migrationsDir: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const applied = new Set(
    db
      .prepare('SELECT filename FROM _migrations')
      .all()
      .map((row) => (row as { filename: string }).filename),
  )

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue

    const sql = readFileSync(`${migrationsDir}/${file}`, 'utf8')
    db.exec(sql)
    db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file)
    console.log(`Applied migration: ${file}`)
  }
}
