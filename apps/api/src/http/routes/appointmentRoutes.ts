import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createStudentRepository } from '../../repositories/studentRepository.ts'
import { createInstructorRepository } from '../../repositories/instructorRepository.ts'
import { createInstructorAvailabilityRepository } from '../../repositories/instructorAvailabilityRepository.ts'
import { createInstructorBlockRepository } from '../../repositories/instructorBlockRepository.ts'
import { createVehicleRepository } from '../../repositories/vehicleRepository.ts'
import { createAppointmentRepository } from '../../repositories/appointmentRepository.ts'
import { createAppointmentService } from '../../modules/appointments/appointmentService.ts'
import { createAppointmentController } from '../controllers/appointmentController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'
import { requireRole } from '../middlewares/requireRole.ts'

interface AppointmentRoutesDeps {
  db: DatabaseSync
}

export function appointmentRoutes({ db }: AppointmentRoutesDeps): Router {
  const router = Router()

  const userRepository = createUserRepository(db)
  const sessionRepository = createSessionRepository(db)
  const studentRepository = createStudentRepository(db)
  const instructorRepository = createInstructorRepository(db)
  const instructorAvailabilityRepository = createInstructorAvailabilityRepository(db)
  const instructorBlockRepository = createInstructorBlockRepository(db)
  const vehicleRepository = createVehicleRepository(db)
  const appointmentRepository = createAppointmentRepository(db)
  const appointmentService = createAppointmentService({
    db,
    appointmentRepository,
    studentRepository,
    instructorRepository,
    instructorAvailabilityRepository,
    instructorBlockRepository,
    vehicleRepository,
  })
  const appointmentController = createAppointmentController({ appointmentService })

  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })
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
