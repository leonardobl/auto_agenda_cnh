import { randomUUID } from 'node:crypto'
import { verifyPassword } from '../../shared/passwordHash.ts'
import { ApiError } from '../../shared/ApiError.ts'
import type { UserRepository } from '../../repositories/userRepository.ts'
import type { SessionRepository } from '../../repositories/sessionRepository.ts'

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  status: string
}

export interface AuthService {
  login(email: unknown, password: unknown): Promise<{ token: string; user: AuthenticatedUser }>
  logout(sessionId: string): void
}

interface AuthServiceDeps {
  userRepository: UserRepository
  sessionRepository: SessionRepository
}

function toAuthenticatedUser(user: {
  id: string
  email: string
  role: string
  status: string
}): AuthenticatedUser {
  return { id: user.id, email: user.email, role: user.role, status: user.status }
}

export function createAuthService({ userRepository, sessionRepository }: AuthServiceDeps): AuthService {
  return {
    async login(email, password) {
      if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'E-mail ou senha inválidos.')
      }

      const user = userRepository.findByEmail(email)
      const passwordMatches = user ? await verifyPassword(password, user.password_hash) : false

      if (!user || !passwordMatches || user.status !== 'ACTIVE') {
        throw new ApiError(401, 'AUTHENTICATION_REQUIRED', 'E-mail ou senha inválidos.')
      }

      const sessionId = randomUUID()
      sessionRepository.create({ id: sessionId, userId: user.id, ttlSeconds: SESSION_TTL_SECONDS })

      return { token: sessionId, user: toAuthenticatedUser(user) }
    },

    logout(sessionId) {
      sessionRepository.delete(sessionId)
    },
  }
}
