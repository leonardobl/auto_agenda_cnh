import { loadEnv } from './config/env.ts'
import { createConnection } from './database/connection.ts'
import { createApp } from './app.ts'

const env = loadEnv()
const db = createConnection(env.dbPath)
const app = createApp({ appOrigin: env.appOrigin, db })

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port} (${env.nodeEnv})`)
})
