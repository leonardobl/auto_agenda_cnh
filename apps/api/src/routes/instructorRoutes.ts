import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserModel } from '../models/userModel.ts'
import { createSessionModel } from '../models/sessionModel.ts'
import { createInstructorModel } from '../models/instructorModel.ts'
import { createInstructorAvailabilityModel } from '../models/instructorAvailabilityModel.ts'
import { createInstructorBlockModel } from '../models/instructorBlockModel.ts'
import { createInstructorService } from '../models/instructorService.ts'
import { createInstructorAvailabilityService } from '../models/instructorAvailabilityService.ts'
import { createInstructorController } from '../controllers/instructorController.ts'
import { createInstructorAvailabilityController } from '../controllers/instructorAvailabilityController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface InstructorRoutesDeps {
  db: DatabaseSync
}

export function instructorRoutes({ db }: InstructorRoutesDeps): Router {
  const router = Router()

  const userModel = createUserModel(db)
  const sessionModel = createSessionModel(db)
  const instructorModel = createInstructorModel(db)
  const instructorAvailabilityModel = createInstructorAvailabilityModel(db)
  const instructorBlockModel = createInstructorBlockModel(db)
  const instructorService = createInstructorService({ db, userModel, instructorModel })
  const instructorAvailabilityService = createInstructorAvailabilityService({
    instructorModel,
    instructorAvailabilityModel,
    instructorBlockModel,
  })
  const instructorController = createInstructorController({ instructorService })
  const instructorAvailabilityController = createInstructorAvailabilityController({
    instructorAvailabilityService,
  })

  const requireAuthMiddleware = requireAuth({ sessionModel, userModel })
  const requireAdmin = requireRole('ADMIN')
  const requireInstructor = requireRole('INSTRUCTOR')
  const requireAdminOrInstructor = requireRole('ADMIN', 'INSTRUCTOR')

  router.get('/instructors', requireAuthMiddleware, requireAdmin, instructorController.list)
  router.post('/instructors', requireAuthMiddleware, requireAdmin, instructorController.register)
  // Registered before /instructors/:id so "me" isn't captured as an :id param.
  router.get('/instructors/me', requireAuthMiddleware, requireInstructor, instructorController.getMe)
  router.patch('/instructors/me', requireAuthMiddleware, requireInstructor, instructorController.updateMe)
  router.get('/instructors/:id', requireAuthMiddleware, requireAdmin, instructorController.getById)
  router.patch('/instructors/:id', requireAuthMiddleware, requireAdmin, instructorController.update)

  // Both Admin (any instructor) and the owning Instructor (their own :id) can reach
  // these — requireAdminOrInstructor lets both roles through, the ownership check for
  // a non-Admin caller happens inside instructorAvailabilityService.
  router.get(
    '/instructors/:id/availability',
    requireAuthMiddleware,
    requireAdminOrInstructor,
    instructorAvailabilityController.listAvailability,
  )
  router.post(
    '/instructors/:id/availability',
    requireAuthMiddleware,
    requireAdminOrInstructor,
    instructorAvailabilityController.addAvailability,
  )
  router.get(
    '/instructors/:id/blocks',
    requireAuthMiddleware,
    requireAdminOrInstructor,
    instructorAvailabilityController.listBlocks,
  )
  router.post(
    '/instructors/:id/blocks',
    requireAuthMiddleware,
    requireAdminOrInstructor,
    instructorAvailabilityController.addBlock,
  )

  return router
}
