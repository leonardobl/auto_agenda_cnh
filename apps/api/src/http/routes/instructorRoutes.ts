import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createInstructorRepository } from '../../repositories/instructorRepository.ts'
import { createInstructorService } from '../../modules/instructors/instructorService.ts'
import { createInstructorController } from '../controllers/instructorController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface InstructorRoutesDeps {
  db: DatabaseSync
}

export function instructorRoutes({ db }: InstructorRoutesDeps): Router {
  const router = Router()

  const userRepository = createUserRepository(db)
  const sessionRepository = createSessionRepository(db)
  const instructorRepository = createInstructorRepository(db)
  const instructorService = createInstructorService({ db, userRepository, instructorRepository })
  const instructorController = createInstructorController({ instructorService })

  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })
  const requireAdmin = requireRole('ADMIN')

  router.get('/instructors', requireAuthMiddleware, requireAdmin, instructorController.list)
  router.post('/instructors', requireAuthMiddleware, requireAdmin, instructorController.register)
  router.get('/instructors/:id', requireAuthMiddleware, requireAdmin, instructorController.getById)
  router.patch('/instructors/:id', requireAuthMiddleware, requireAdmin, instructorController.update)

  return router
}
