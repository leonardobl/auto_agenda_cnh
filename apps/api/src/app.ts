import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import type { DatabaseSync } from 'node:sqlite'
import { healthRoutes } from './http/routes/healthRoutes.ts'
import { authRoutes } from './http/routes/authRoutes.ts'
import { studentRoutes } from './http/routes/studentRoutes.ts'
import { notFoundHandler } from './http/middlewares/notFoundHandler.ts'
import { errorHandler } from './http/middlewares/errorHandler.ts'

interface CreateAppOptions {
  appOrigin: string
  db: DatabaseSync
}

export function createApp({ appOrigin, db }: CreateAppOptions): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: appOrigin }))
  app.use(express.json())

  app.use(healthRoutes({ db }))
  app.use(authRoutes({ db }))
  app.use(studentRoutes({ db }))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
