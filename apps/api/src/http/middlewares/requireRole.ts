import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../../shared/ApiError.ts'

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'Você não tem permissão para acessar este recurso.')
    }

    next()
  }
}
