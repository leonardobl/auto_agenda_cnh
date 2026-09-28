import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDatabase } from '../src/database/connection.ts'
import { runMigrations } from './migrate.ts'
import {
  seedDemoUser,
  seedDemoStudents,
  seedDemoVehicles,
  seedDemoInstructors,
  seedDemoAppointments,
} from './seed.ts'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/database/migrations')

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('Missing required environment variable: DATABASE_URL. See .env.example.')
  process.exit(1)
}

const db = createDatabase(databaseUrl)

try {
  await runMigrations(db, MIGRATIONS_DIR)
  await seedDemoUser(db)
  await seedDemoStudents(db)
  await seedDemoVehicles(db)
  await seedDemoInstructors(db)
  await seedDemoAppointments(db)
  console.log('PostgreSQL database is set up (migrations applied, demo data seeded).')
} catch (error) {
  console.error('Database setup failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await db.close()
}
