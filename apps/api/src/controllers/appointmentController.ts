import type { Request, Response } from 'express'
import type { AppointmentService } from '../models/appointmentService.ts'
import { presentAppointment, presentSlot } from '../views/appointmentView.ts'
import { presentPage, presentItems } from '../views/pageView.ts'

interface AppointmentControllerDeps {
  appointmentService: AppointmentService
}

export function createAppointmentController({ appointmentService }: AppointmentControllerDeps) {
  return {
    async searchSlots(req: Request, res: Response) {
      const slots = await appointmentService.searchSlots(req.query, {
        role: req.user!.role,
        userId: req.user!.id,
      })
      res.status(200).json(presentItems(slots, presentSlot))
    },

    async book(req: Request, res: Response) {
      const appointment = await appointmentService.book(req.body ?? {}, {
        role: req.user!.role,
        userId: req.user!.id,
      })
      res.status(201).json(presentAppointment(appointment))
    },

    async list(req: Request, res: Response) {
      const result = await appointmentService.list(req.query, { role: req.user!.role, userId: req.user!.id })
      res.status(200).json(presentPage(result, presentAppointment))
    },
  }
}
