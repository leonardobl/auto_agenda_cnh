const DEFAULT_PORT = 3333

export interface Env {
  nodeEnv: string
  // Optional: serverless hosts (e.g. the Vercel entry point, src/../api/index.ts)
  // never call `.listen()`, so this is read but unused there — see server.ts for the
  // one place that actually binds to it.
  port: number
  appOrigin: string
  databaseUrl: string
  // Managed Postgres providers reached over the public internet (Supabase, Render,
  // Neon, ...) require TLS; a local/Docker Postgres on a private network doesn't.
  // Off by default so local dev (infra/docker-compose.yml) needs no extra var.
  databaseSsl: boolean
}

const REQUIRED_VARS = ['NODE_ENV', 'APP_ORIGIN', 'DATABASE_URL'] as const

export function loadEnv(): Env {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}. See .env.example.`,
    )
    process.exit(1)
  }

  const port = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT

  if (!Number.isInteger(port) || port <= 0) {
    console.error(`Invalid PORT: "${process.env.PORT}" is not a positive integer.`)
    process.exit(1)
  }

  return {
    nodeEnv: process.env.NODE_ENV!,
    port,
    appOrigin: process.env.APP_ORIGIN!,
    databaseUrl: process.env.DATABASE_URL!,
    databaseSsl: process.env.DATABASE_SSL === 'true',
  }
}
