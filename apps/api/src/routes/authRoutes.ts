import { Router } from 'express'
import type { Database } from '../database/connection.ts'
import { createUserModel } from '../models/userModel.ts'
import { createSessionModel } from '../models/sessionModel.ts'
import { createPasswordResetTokenModel } from '../models/passwordResetTokenModel.ts'
import { createAuthService } from '../models/authService.ts'
import { createAuthController } from '../controllers/authController.ts'
import { requireAuth } from '../middlewares/requireAuth.ts'

interface AuthRoutesDeps {
  db: Database
  appOrigin: string
}

export function authRoutes({ db, appOrigin }: AuthRoutesDeps): Router {
  const router = Router()

  const userModel = createUserModel(db)
  const sessionModel = createSessionModel(db)
  const passwordResetTokenModel = createPasswordResetTokenModel(db)
  const authService = createAuthService({
    userModel,
    sessionModel,
    passwordResetTokenModel,
    appOrigin,
  })
  const authController = createAuthController({ authService })
  const requireAuthMiddleware = requireAuth({ sessionModel, userModel })

  router.post('/auth/login', authController.login)
  router.post('/auth/logout', requireAuthMiddleware, authController.logout)
  router.get('/me', requireAuthMiddleware, authController.me)
  router.post('/auth/forgot-password', authController.forgotPassword)
  router.post('/auth/reset-password', authController.resetPassword)

  return router
}
