// Vercel serverless entry point. Vercel's Node runtime treats any file under /api as
// a function and calls its default export as an (req, res) handler — an Express app
// instance already has that exact shape, so it's exported directly, with no `.listen()`
// (Vercel owns the HTTP server). See ../vercel.json for the rewrite that routes every
// path to this one function, so routes stay unprefixed (/health, /auth/login, ...),
// matching apps/web's VITE_API_BASE_URL + relative-path calls.
//
// Built once at module scope, not inside the handler: on a warm invocation (the same
// container reused for a later request) this file is not re-evaluated, so the
// connection pool — created once here — is reused instead of leaking a new one per
// request. A cold start still creates a fresh pool; that's normal for serverless and
// is exactly why DATABASE_URL should point at Supabase's pooled connection string
// (port 6543, "Transaction" mode) here, not the direct connection — see README.md
// "Demonstração pública".
import { loadEnv } from '../src/config/env.ts'
import { createDatabase } from '../src/database/connection.ts'
import { createApp } from '../src/app.ts'

const env = loadEnv()
const db = createDatabase(env.databaseUrl, { ssl: env.databaseSsl })
const app = createApp({ appOrigin: env.appOrigin, db })

export default app
