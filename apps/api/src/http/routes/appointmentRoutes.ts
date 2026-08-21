import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createStudentRepository } from '../../repositories/studentRepository.ts'
import { createInstructorRepository } from '../../repositories/instructorRepository.ts'
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
  const vehicleRepository = createVehicleRepository(db)
  const appointmentRepository = createAppointmentRepository(db)
  const appointmentService = createAppointmentService({
    db,
    appointmentRepository,
    studentRepository,
    instructorRepository,
    vehicleRepository,
  })
  const appointmentController = createAppointmentController({ appointmentService })

  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })
  const requireAdmin = requireRole('ADMIN')

  router.get('/availability/slots', requireAuthMiddleware, requireAdmin, appointmentController.searchSlots)
  router.post('/appointments', requireAuthMiddleware, requireAdmin, appointmentController.book)
  router.get('/appointments', requireAuthMiddleware, requireAdmin, appointmentController.list)

  return router
}
