import type { Request, Response } from 'express'
import type { AuthService } from '../../modules/auth/authService.ts'

interface AuthControllerDeps {
  authService: AuthService
}

export function createAuthController({ authService }: AuthControllerDeps) {
  return {
    async login(req: Request, res: Response) {
      const { email, password } = req.body ?? {}
      const { token, user } = await authService.login(email, password)
      res.status(200).json({ token, user })
    },

    logout(req: Request, res: Response) {
      authService.logout(req.sessionId!)
      res.status(204).send()
    },

    me(req: Request, res: Response) {
      res.status(200).json(req.user)
    },
  }
}
