import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import type { DatabaseSync } from 'node:sqlite'
import { healthRoutes } from './routes/healthRoutes.ts'
import { authRoutes } from './routes/authRoutes.ts'
import { studentRoutes } from './routes/studentRoutes.ts'
import { vehicleRoutes } from './routes/vehicleRoutes.ts'
import { instructorRoutes } from './routes/instructorRoutes.ts'
import { appointmentRoutes } from './routes/appointmentRoutes.ts'
import { notFoundHandler } from './middlewares/notFoundHandler.ts'
import { errorHandler } from './middlewares/errorHandler.ts'

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
  app.use(authRoutes({ db, appOrigin }))
  app.use(studentRoutes({ db }))
  app.use(vehicleRoutes({ db }))
  app.use(instructorRoutes({ db }))
  app.use(appointmentRoutes({ db }))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
