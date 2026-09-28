import type { Request, Response } from 'express'
import type { InstructorService } from '../models/instructorService.ts'
import { ApiError } from '../shared/ApiError.ts'
import { presentInstructor } from '../views/instructorView.ts'
import { presentPage } from '../views/pageView.ts'

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
    async list(req: Request, res: Response) {
      const result = await instructorService.list(req.query)
      res.status(200).json(presentPage(result, presentInstructor))
    },

    async register(req: Request, res: Response) {
      const instructor = await instructorService.register(req.body ?? {})
      res.status(201).json(presentInstructor(instructor))
    },

    async getById(req: Request, res: Response) {
      const instructor = await instructorService.getById(requireIdParam(req))
      res.status(200).json(presentInstructor(instructor))
    },

    async update(req: Request, res: Response) {
      const instructor = await instructorService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(presentInstructor(instructor))
    },

    async getMe(req: Request, res: Response) {
      const instructor = await instructorService.getOwnProfile(req.user!.id)
      res.status(200).json(presentInstructor(instructor))
    },

    async updateMe(req: Request, res: Response) {
      const instructor = await instructorService.updateOwnProfile(req.user!.id, req.body ?? {})
      res.status(200).json(presentInstructor(instructor))
    },
  }
}
