import type { Request, Response } from 'express'
import type { InstructorService } from '../../modules/instructors/instructorService.ts'
import { ApiError } from '../../shared/ApiError.ts'

interface InstructorControllerDeps {
  instructorService: InstructorService
}

function requireIdParam(req: Request): string {
  const { id } = req.params
  if (typeof id !== 'string' || !id) {
    throw new ApiError(404, 'INSTRUCTOR_NOT_FOUND', 'Instrutor não encontrado.')
  }
  return id
}

export function createInstructorController({ instructorService }: InstructorControllerDeps) {
  return {
    list(req: Request, res: Response) {
      const result = instructorService.list(req.query)
      res.status(200).json(result)
    },

    async register(req: Request, res: Response) {
      const instructor = await instructorService.register(req.body ?? {})
      res.status(201).json(instructor)
    },

    getById(req: Request, res: Response) {
      const instructor = instructorService.getById(requireIdParam(req))
      res.status(200).json(instructor)
    },

    update(req: Request, res: Response) {
      const instructor = instructorService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(instructor)
    },
  }
}
