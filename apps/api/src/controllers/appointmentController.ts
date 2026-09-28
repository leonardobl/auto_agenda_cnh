import type { Request, Response } from 'express'
import type { AppointmentService } from '../models/appointmentService.ts'
import { presentAppointment, presentSlot } from '../views/appointmentView.ts'
import { presentPage, presentItems } from '../views/pageView.ts'

interface AppointmentControllerDeps {
  appointmentService: AppointmentService
}

export function createAppointmentController({ appointmentService }: AppointmentControllerDeps) {
  return {
    searchSlots(req: Request, res: Response) {
      const slots = appointmentService.searchSlots(req.query, {
        role: req.user!.role,
        userId: req.user!.id,
      })
      res.status(200).json(presentItems(slots, presentSlot))
    },

    book(req: Request, res: Response) {
      const appointment = appointmentService.book(req.body ?? {}, {
        role: req.user!.role,
        userId: req.user!.id,
      })
      res.status(201).json(presentAppointment(appointment))
    },

    list(req: Request, res: Response) {
      const result = appointmentService.list(req.query, { role: req.user!.role, userId: req.user!.id })
      res.status(200).json(presentPage(result, presentAppointment))
    },
  }
}
