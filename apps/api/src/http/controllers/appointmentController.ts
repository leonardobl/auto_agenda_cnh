import type { Request, Response } from 'express'
import type { AppointmentService } from '../../modules/appointments/appointmentService.ts'

interface AppointmentControllerDeps {
  appointmentService: AppointmentService
}

export function createAppointmentController({ appointmentService }: AppointmentControllerDeps) {
  return {
    searchSlots(req: Request, res: Response) {
      const slots = appointmentService.searchSlots(req.query)
      res.status(200).json({ items: slots })
    },

    book(req: Request, res: Response) {
      const appointment = appointmentService.book(req.body ?? {}, req.user!.id)
      res.status(201).json(appointment)
    },

    list(req: Request, res: Response) {
      const result = appointmentService.list(req.query, { role: req.user!.role, userId: req.user!.id })
      res.status(200).json(result)
    },
  }
}
