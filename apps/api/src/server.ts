import { loadEnv } from './config/env.ts'
import { createDatabase } from './database/connection.ts'
import { createApp } from './app.ts'

const env = loadEnv()
const db = createDatabase(env.databaseUrl)
const app = createApp({ appOrigin: env.appOrigin, db })

const server = app.listen(env.port, () => {
  console.log(`API listening on port ${env.port} (${env.nodeEnv})`)
})

// Close the HTTP server, then the connection pool, so in-flight requests finish and
// PostgreSQL isn't left holding idle connections (watch mode restarts, Ctrl+C, Docker stop).
function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`)
  server.close(() => {
    void db.close().finally(() => process.exit(0))
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
