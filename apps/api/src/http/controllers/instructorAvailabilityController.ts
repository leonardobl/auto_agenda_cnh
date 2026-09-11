import type { Request, Response } from 'express'
import type { InstructorAvailabilityService } from '../../modules/instructors/instructorAvailabilityService.ts'
import { ApiError } from '../../shared/ApiError.ts'

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
    listAvailability(req: Request, res: Response) {
      const items = instructorAvailabilityService.listAvailability(requireIdParam(req), requesterFrom(req))
      res.status(200).json({ items })
    },

    addAvailability(req: Request, res: Response) {
      const availability = instructorAvailabilityService.addAvailability(
        requireIdParam(req),
        requesterFrom(req),
        req.body ?? {},
      )
      res.status(201).json(availability)
    },

    listBlocks(req: Request, res: Response) {
      const items = instructorAvailabilityService.listBlocks(requireIdParam(req), requesterFrom(req))
      res.status(200).json({ items })
    },

    addBlock(req: Request, res: Response) {
      const block = instructorAvailabilityService.addBlock(
        requireIdParam(req),
        requesterFrom(req),
        req.body ?? {},
      )
      res.status(201).json(block)
    },
  }
}
