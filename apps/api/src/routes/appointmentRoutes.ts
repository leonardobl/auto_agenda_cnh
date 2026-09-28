import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserModel } from '../models/userModel.ts'
import { createSessionModel } from '../models/sessionModel.ts'
import { createStudentModel } from '../models/studentModel.ts'
import { createInstructorModel } from '../models/instructorModel.ts'
import { createInstructorAvailabilityModel } from '../models/instructorAvailabilityModel.ts'
import { createInstructorBlockModel } from '../models/instructorBlockModel.ts'
import { createVehicleModel } from '../models/vehicleModel.ts'
import { createAppointmentModel } from '../models/appointmentModel.ts'
import { createAppointmentService } from '../models/appointmentService.ts'
import { createAppointmentController } from '../controllers/appointmentController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface AppointmentRoutesDeps {
  db: DatabaseSync
}

export function appointmentRoutes({ db }: AppointmentRoutesDeps): Router {
  const router = Router()

  const userModel = createUserModel(db)
  const sessionModel = createSessionModel(db)
  const studentModel = createStudentModel(db)
  const instructorModel = createInstructorModel(db)
  const instructorAvailabilityModel = createInstructorAvailabilityModel(db)
  const instructorBlockModel = createInstructorBlockModel(db)
  const vehicleModel = createVehicleModel(db)
  const appointmentModel = createAppointmentModel(db)
  const appointmentService = createAppointmentService({
    db,
    appointmentModel,
    studentModel,
    instructorModel,
    instructorAvailabilityModel,
    instructorBlockModel,
    vehicleModel,
  })
  const appointmentController = createAppointmentController({ appointmentService })

  const requireAuthMiddleware = requireAuth({ sessionModel, userModel })
  const requireAdminOrStudent = requireRole('ADMIN', 'STUDENT')
  const requireAdminOrInstructorOrStudent = requireRole('ADMIN', 'INSTRUCTOR', 'STUDENT')

  router.get(
    '/availability/slots',
    requireAuthMiddleware,
    requireAdminOrStudent,
    appointmentController.searchSlots,
  )
  router.post('/appointments', requireAuthMiddleware, requireAdminOrStudent, appointmentController.book)
  router.get(
    '/appointments',
    requireAuthMiddleware,
    requireAdminOrInstructorOrStudent,
    appointmentController.list,
  )

  return router
}
