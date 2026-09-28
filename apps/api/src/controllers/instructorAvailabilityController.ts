import type { Request, Response } from 'express'
import type { InstructorAvailabilityService } from '../models/instructorAvailabilityService.ts'
import { ApiError } from '../shared/ApiError.ts'
import { presentInstructorAvailability, presentInstructorBlock } from '../views/instructorView.ts'
import { presentItems } from '../views/pageView.ts'

interface InstructorAvailabilityControllerDeps {
  instructorAvailabilityService: InstructorAvailabilityService
}

function requireIdParam(req: Request): string {
  const { id } = req.params
  if (typeof id !== 'string' || !id) {
    throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
  }
  return id
}

function requesterFrom(req: Request) {
  return { role: req.user!.role, userId: req.user!.id }
}

export function createInstructorAvailabilityController({
  instructorAvailabilityService,
}: InstructorAvailabilityControllerDeps) {
  return {
    async listAvailability(req: Request, res: Response) {
      const items = await instructorAvailabilityService.listAvailability(requireIdParam(req), requesterFrom(req))
      res.status(200).json(presentItems(items, presentInstructorAvailability))
    },

    async addAvailability(req: Request, res: Response) {
      const availability = await instructorAvailabilityService.addAvailability(
        requireIdParam(req),
        requesterFrom(req),
        req.body ?? {},
      )
      res.status(201).json(presentInstructorAvailability(availability))
    },

    async listBlocks(req: Request, res: Response) {
      const items = await instructorAvailabilityService.listBlocks(requireIdParam(req), requesterFrom(req))
      res.status(200).json(presentItems(items, presentInstructorBlock))
    },

    async addBlock(req: Request, res: Response) {
      const block = await instructorAvailabilityService.addBlock(
        requireIdParam(req),
        requesterFrom(req),
        req.body ?? {},
      )
      res.status(201).json(presentInstructorBlock(block))
    },
  }
}
