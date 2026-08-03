import { Router } from 'express'
import type { DatabaseSync } from 'node:sqlite'

interface HealthRoutesDeps {
  db: DatabaseSync
}

export function healthRoutes({ db }: HealthRoutesDeps): Router {
  const router = Router()

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  router.get('/health/db', (_req, res) => {
    try {
      db.prepare('SELECT 1').get()
      res.status(200).json({ status: 'ok' })
    } catch {
      res.status(503).json({ status: 'error', message: 'Banco de dados indisponível.' })
    }
  })

  return router
}
