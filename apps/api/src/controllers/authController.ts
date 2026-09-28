import type { Request, Response } from 'express'
import type { AuthService } from '../models/authService.ts'
import { presentLogin, presentMessage, presentAuthenticatedUser } from '../views/authView.ts'

interface AuthControllerDeps {
  authService: AuthService
}

export function createAuthController({ authService }: AuthControllerDeps) {
  return {
    async login(req: Request, res: Response) {
      const { email, password } = req.body ?? {}
      const { token, user } = await authService.login(email, password)
      res.status(200).json(presentLogin({ token, user }))
    },

    async logout(req: Request, res: Response) {
      await authService.logout(req.sessionId!)
      res.status(204).send()
    },

    async forgotPassword(req: Request, res: Response) {
      const { email } = req.body ?? {}
      await authService.requestPasswordReset(email)
      res.status(200).json(
        presentMessage('Se o e-mail informado existir, você receberá instruções para redefinir sua senha.'),
      )
    },

    async resetPassword(req: Request, res: Response) {
      const { token, password } = req.body ?? {}
      await authService.resetPassword(token, password)
      res.status(200).json(presentMessage('Senha redefinida com sucesso.'))
    },

    async me(req: Request, res: Response) {
      res.status(200).json(presentAuthenticatedUser(req.user!))
    },
  }
}
