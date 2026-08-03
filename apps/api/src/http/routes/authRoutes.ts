import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import { createUserRepository } from '../../repositories/userRepository.ts'
import { createSessionRepository } from '../../repositories/sessionRepository.ts'
import { createAuthService } from '../../modules/auth/authService.ts'
import { createAuthController } from '../controllers/authController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'

interface AuthRoutesDeps {
  db: DatabaseSync
}

export function authRoutes({ db }: AuthRoutesDeps): Router {
  const router = Router()

  const userRepository = createUserRepository(db)
  const sessionRepository = createSessionRepository(db)
  const authService = createAuthService({ userRepository, sessionRepository })
  const authController = createAuthController({ authService })
  const requireAuthMiddleware = requireAuth({ sessionRepository, userRepository })

  router.post('/auth/login', authController.login)
  router.post('/auth/logout', requireAuthMiddleware, authController.logout)
  router.get('/me', requireAuthMiddleware, authController.me)

  return router
}
