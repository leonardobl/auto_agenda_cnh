import type { Request, Response } from 'express'
import type { HealthModel } from '../models/healthModel.ts'
import { presentHealthError, presentHealthOk } from '../views/healthView.ts'

interface HealthControllerDeps {
  healthModel: HealthModel
}

// Reads the database only through healthModel — same rule as every other controller
// (the one exception to "controllers talk to *Service": there is no business rule here).
export function createHealthController({ healthModel }: HealthControllerDeps) {
  return {
    async liveness(_req: Request, res: Response) {
      res.status(200).json(presentHealthOk())
    },

    async readiness(_req: Request, res: Response) {
      if (await healthModel.isDatabaseReachable()) {
        res.status(200).json(presentHealthOk())
        return
      }
      res.status(503).json(presentHealthError('Banco de dados indisponível.'))
    },
  }
}
