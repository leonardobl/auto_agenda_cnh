import { Router } from 'express'
import type { Database } from '../database/connection.ts'
import { createHealthModel } from '../models/healthModel.ts'
import { createHealthController } from '../controllers/healthController.ts'

interface HealthRoutesDeps {
  db: Database
}

export function healthRoutes({ db }: HealthRoutesDeps): Router {
  const router = Router()
  const healthController = createHealthController({ healthModel: createHealthModel(db) })

  router.get('/health', healthController.liveness)
  router.get('/health/db', healthController.readiness)

  return router
}
