import type { Request, Response } from 'express'
import type { StudentService } from '../models/studentService.ts'
import { ApiError } from '../shared/ApiError.ts'
import { presentStudent } from '../views/studentView.ts'
import { presentPage } from '../views/pageView.ts'

interface StudentControllerDeps {
  studentService: StudentService
}

function requireIdParam(req: Request): string {
  const { id } = req.params
  if (typeof id !== 'string' || !id) {
    throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.')
  }
  return id
}

export function createStudentController({ studentService }: StudentControllerDeps) {
  return {
    async list(req: Request, res: Response) {
      const result = await studentService.list(req.query)
      res.status(200).json(presentPage(result, presentStudent))
    },

    async register(req: Request, res: Response) {
      const student = await studentService.register(req.body ?? {})
      res.status(201).json(presentStudent(student))
    },

    async getById(req: Request, res: Response) {
      const student = await studentService.getById(requireIdParam(req))
      res.status(200).json(presentStudent(student))
    },

    async update(req: Request, res: Response) {
      const student = await studentService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(presentStudent(student))
    },

    async deactivate(req: Request, res: Response) {
      const student = await studentService.deactivate(requireIdParam(req))
      res.status(200).json(presentStudent(student))
    },

    async createAccount(req: Request, res: Response) {
      const student = await studentService.createAccount(requireIdParam(req), req.body ?? {})
      res.status(201).json(presentStudent(student))
    },

    async getMe(req: Request, res: Response) {
      const student = await studentService.getOwnProfile(req.user!.id)
      res.status(200).json(presentStudent(student))
    },

    async updateMe(req: Request, res: Response) {
      const student = await studentService.updateOwnProfile(req.user!.id, req.body ?? {})
      res.status(200).json(presentStudent(student))
    },
  }
}
