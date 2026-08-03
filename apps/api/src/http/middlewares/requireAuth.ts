import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../../shared/ApiError.ts'
import type { SessionRepository } from '../../repositories/sessionRepository.ts'
import type { UserRepository } from '../../repositories/userRepository.ts'
import type { AuthenticatedUser } from '../../modules/auth/authService.ts'

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
  sessionRepository: SessionRepository
  userRepository: UserRepository
}

export function requireAuth({ sessionRepository, userRepository }: RequireAuthDeps) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

    const session = token ? sessionRepository.findValidById(token) : undefined
    const user = session ? userRepository.findById(session.user_id) : undefined

    if (!session || !user) {
      throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'Autenticação necessária.')
    }

    req.sessionId = session.id
    req.user = { id: user.id, email: user.email, role: user.role, status: user.status }
    next()
  }
}
