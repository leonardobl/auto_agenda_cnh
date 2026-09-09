import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createStudentRepository } from '../../repositories/studentRepository.ts'
import { createLicenseCategoryRepository } from '../../repositories/licenseCategoryRepository.ts'
import { createStudentService } from '../../modules/students/studentService.ts'
import { createStudentController } from '../controllers/studentController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface StudentRoutesDeps {
  db: DatabaseSync
}

export function studentRoutes({ db }: StudentRoutesDeps): Router {
  const router = Router()

  const userRepository = createUserRepository(db)
  const sessionRepository = createSessionRepository(db)
  const studentRepository = createStudentRepository(db)
  const licenseCategoryRepository = createLicenseCategoryRepository(db)
  const studentService = createStudentService({ db, studentRepository, licenseCategoryRepository, userRepository })
  const studentController = createStudentController({ studentService })

  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })
  const requireAdmin = requireRole('ADMIN')
  const requireStudent = requireRole('STUDENT')
  const requireAdminOrStudent = requireRole('ADMIN', 'STUDENT')

  router.get('/students', requireAuthMiddleware, requireAdmin, studentController.list)
  router.post('/students', requireAuthMiddleware, requireAdmin, studentController.register)
  // Registered before /students/:id so "me" isn't captured as an :id param.
  router.get('/students/me', requireAuthMiddleware, requireStudent, studentController.getMe)
  router.patch('/students/me', requireAuthMiddleware, requireStudent, studentController.updateMe)
  router.get('/students/:id', requireAuthMiddleware, requireAdmin, studentController.getById)
  router.patch('/students/:id', requireAuthMiddleware, requireAdmin, studentController.update)
  router.post('/students/:id/deactivate', requireAuthMiddleware, requireAdmin, studentController.deactivate)
  router.post('/students/:id/create-account', requireAuthMiddleware, requireAdmin, studentController.createAccount)

  // Static reference data (A/B/AB/C/D/E), no sensitive content — widened beyond
  // Admin so Student > Perfil can resolve its own category_id to a readable code.
  router.get('/license-categories', requireAuthMiddleware, requireAdminOrStudent, (_req, res) => {
    res.status(200).json(licenseCategoryRepository.findAll())
  })

  return router
}
