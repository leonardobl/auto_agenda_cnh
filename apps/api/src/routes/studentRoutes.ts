import { Router } from 'express'
import type { Database } from '../database/connection.ts'
import { createUserModel } from '../models/userModel.ts'
import { createSessionModel } from '../models/sessionModel.ts'
import { createStudentModel } from '../models/studentModel.ts'
import { createLicenseCategoryModel } from '../models/licenseCategoryModel.ts'
import { createStudentService } from '../models/studentService.ts'
import { createLicenseCategoryService } from '../models/licenseCategoryService.ts'
import { createStudentController } from '../controllers/studentController.ts'
import { createLicenseCategoryController } from '../controllers/licenseCategoryController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface StudentRoutesDeps {
  db: Database
}

export function studentRoutes({ db }: StudentRoutesDeps): Router {
  const router = Router()

  const userModel = createUserModel(db)
  const sessionModel = createSessionModel(db)
  const studentModel = createStudentModel(db)
  const licenseCategoryModel = createLicenseCategoryModel(db)
  const studentService = createStudentService({ database: db, studentModel, licenseCategoryModel })
  const studentController = createStudentController({ studentService })
  const licenseCategoryService = createLicenseCategoryService({ licenseCategoryModel })
  const licenseCategoryController = createLicenseCategoryController({ licenseCategoryService })

  const requireAuthMiddleware = requireAuth({ sessionModel, userModel })
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
  router.get('/license-categories', requireAuthMiddleware, requireAdminOrStudent, licenseCategoryController.list)

  return router
}
