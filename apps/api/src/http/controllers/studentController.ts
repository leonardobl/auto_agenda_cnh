import type { Request, Response } from 'express'
import type { StudentService } from '../../modules/students/studentService.ts'
import { ApiError } from '../../shared/ApiError.ts'

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
    list(req: Request, res: Response) {
      const result = studentService.list(req.query)
      res.status(200).json(result)
    },

    register(req: Request, res: Response) {
      const student = studentService.register(req.body ?? {})
      res.status(201).json(student)
    },

    getById(req: Request, res: Response) {
      const student = studentService.getById(requireIdParam(req))
      res.status(200).json(student)
    },

    update(req: Request, res: Response) {
      const student = studentService.update(requireIdParam(req), req.body ?? {})
      res.status(200).json(student)
    },

    deactivate(req: Request, res: Response) {
      const student = studentService.deactivate(requireIdParam(req))
      res.status(200).json(student)
    },
  }
}
