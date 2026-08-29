import { randomUUID } from 'node:crypto'
import { hashPassword, verifyPassword } from '../../shared/passwordHash.ts'
import { ApiError } from '../../shared/ApiError.ts'
import type { UserRepository } from '../../repositories/userRepository.ts'
import type { SessionRepository } from '../../repositories/sessionRepository.ts'
import type { PasswordResetTokenRepository } from '../../repositories/passwordResetTokenRepository.ts'

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
export const RESET_TOKEN_TTL_SECONDS = 30 * 60

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  status: string
}

export interface AuthService {
  login(email: unknown, password: unknown): Promise<{ token: string; user: AuthenticatedUser }>
  logout(sessionId: string): void
  requestPasswordReset(email: unknown): Promise<void>
  resetPassword(token: unknown, newPassword: unknown): Promise<void>
}

interface AuthServiceDeps {
  userRepository: UserRepository
  sessionRepository: SessionRepository
  passwordResetTokenRepository: PasswordResetTokenRepository
  appOrigin: string
}

function toAuthenticatedUser(user: {
  id: string
  email: string
  role: string
  status: string
}): AuthenticatedUser {
  return { id: user.id, email: user.email, role: user.role, status: user.status }
}

export function createAuthService({
  userRepository,
  sessionRepository,
  passwordResetTokenRepository,
  appOrigin,
}: AuthServiceDeps): AuthService {
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

    async requestPasswordReset(email) {
      if (typeof email !== 'string' || !email) {
        return
      }

      const user = userRepository.findByEmail(email)
      if (!user || user.status !== 'ACTIVE') {
        return
      }

      const tokenId = randomUUID()
      passwordResetTokenRepository.create({
        id: tokenId,
        userId: user.id,
        ttlSeconds: RESET_TOKEN_TTL_SECONDS,
      })

      // No email provider is configured for this project — logging the link to the
      // server console stands in for sending it, a deliberate mock (see design.md).
      console.log(`Password reset link for ${user.email}: ${appOrigin}/redefinir-senha?token=${tokenId}`)
    },

    async resetPassword(token, newPassword) {
      if (typeof token !== 'string' || !token || typeof newPassword !== 'string' || !newPassword) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Link inválido ou expirado.')
      }

      const resetToken = passwordResetTokenRepository.findValidById(token)
      if (!resetToken) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Link inválido ou expirado.')
      }

      const passwordHash = await hashPassword(newPassword)
      userRepository.updatePasswordHash(resetToken.user_id, passwordHash)
      passwordResetTokenRepository.markUsed(resetToken.id)
      sessionRepository.deleteAllForUser(resetToken.user_id)
    },
  }
}
