import { Router } from 'express'
import type { Database } from '../database/connection.ts'
import { createUserModel } from '../models/userModel.ts'
import { createSessionModel } from '../models/sessionModel.ts'
import { createVehicleModel } from '../models/vehicleModel.ts'
import { createLicenseCategoryModel } from '../models/licenseCategoryModel.ts'
import { createVehicleService } from '../models/vehicleService.ts'
import { createVehicleController } from '../controllers/vehicleController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface VehicleRoutesDeps {
  db: Database
}

export function vehicleRoutes({ db }: VehicleRoutesDeps): Router {
  const router = Router()

  const userModel = createUserModel(db)
  const sessionModel = createSessionModel(db)
  const vehicleModel = createVehicleModel(db)
  const licenseCategoryModel = createLicenseCategoryModel(db)
  const vehicleService = createVehicleService({ vehicleModel, licenseCategoryModel })
  const vehicleController = createVehicleController({ vehicleService })

  const requireAuthMiddleware = requireAuth({ sessionModel, userModel })
  const requireAdmin = requireRole('ADMIN')

  router.get('/vehicles', requireAuthMiddleware, requireAdmin, vehicleController.list)
  router.post('/vehicles', requireAuthMiddleware, requireAdmin, vehicleController.register)
  router.get('/vehicles/:id', requireAuthMiddleware, requireAdmin, vehicleController.getById)
  router.patch('/vehicles/:id', requireAuthMiddleware, requireAdmin, vehicleController.update)

  return router
}
