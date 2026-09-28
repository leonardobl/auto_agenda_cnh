import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import { presentError } from '../views/errorView.ts'

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(presentError('ROUTE_NOT_FOUND', 'Rota não encontrada.', randomUUID()))
}
