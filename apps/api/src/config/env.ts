export interface Env {
  nodeEnv: string
  port: number
  appOrigin: string
  dbPath: string
}

const REQUIRED_VARS = ['NODE_ENV', 'PORT', 'APP_ORIGIN'] as const

export function loadEnv(): Env {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}. See .env.example.`,
    )
    process.exit(1)
  }

  const port = Number(process.env.PORT)

  if (!Number.isInteger(port) || port <= 0) {
    console.error(`Invalid PORT: "${process.env.PORT}" is not a positive integer.`)
    process.exit(1)
  }

  return {
    nodeEnv: process.env.NODE_ENV!,
    port,
    appOrigin: process.env.APP_ORIGIN!,
    dbPath: process.env.DB_PATH || 'data/app.db',
  }
}
