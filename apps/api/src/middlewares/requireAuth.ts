import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../shared/ApiError.ts'
import type { SessionModel } from '../models/sessionModel.ts'
import type { UserModel } from '../models/userModel.ts'
import type { AuthenticatedUser } from '../models/authService.ts'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required shape for augmenting Express's own Request type
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      sessionId?: string
    }
  }
}

interface RequireAuthDeps {
  sessionModel: SessionModel
  userModel: UserModel
}

export function requireAuth({ sessionModel, userModel }: RequireAuthDeps) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

    const session = token ? await sessionModel.findValidById(token) : undefined
    const user = session ? await userModel.findById(session.user_id) : undefined

    if (!session || !user) {
      throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Autenticação necessária.')
    }

    req.sessionId = session.id
    req.user = { id: user.id, email: user.email, role: user.role, status: user.status }
    next()
  }
}
