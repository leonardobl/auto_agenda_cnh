import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: 'Rota não encontrada.',
    correlationId: randomUUID(),
  })
}
