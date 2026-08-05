import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createVehicleRepository } from '../../repositories/vehicleRepository.ts'
import { createLicenseCategoryRepository } from '../../repositories/licenseCategoryRepository.ts'
import { createVehicleService } from '../../modules/vehicles/vehicleService.ts'
import { createVehicleController } from '../controllers/vehicleController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface VehicleRoutesDeps {
  db: DatabaseSync
}

export function vehicleRoutes({ db }: VehicleRoutesDeps): Router {
  const router = Router()

  const userRepository = createUserRepository(db)
  const sessionRepository = createSessionRepository(db)
  const vehicleRepository = createVehicleRepository(db)
  const licenseCategoryRepository = createLicenseCategoryRepository(db)
  const vehicleService = createVehicleService({ vehicleRepository, licenseCategoryRepository })
  const vehicleController = createVehicleController({ vehicleService })

  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })
  const requireAdmin = requireRole('ADMIN')

  router.get('/vehicles', requireAuthMiddleware, requireAdmin, vehicleController.list)
  router.post('/vehicles', requireAuthMiddleware, requireAdmin, vehicleController.register)
  router.get('/vehicles/:id', requireAuthMiddleware, requireAdmin, vehicleController.getById)
  router.patch('/vehicles/:id', requireAuthMiddleware, requireAdmin, vehicleController.update)

  return router
}
