import { randomUUID } from 'node:crypto'
import type { ErrorRequestHandler } from 'express'

interface ApiError extends Error {
  status?: number
  code?: string
  expose?: boolean
}

function isApiError(err: unknown): err is ApiError {
  return err instanceof Error
}

// Express detects error-handling middleware by runtime arity (`fn.length === 4`) —
// all four parameters must stay declared even though `req`/`next` are unused,
// or Express will silently treat this as regular middleware instead.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const correlationId = randomUUID()

  console.error(`[${correlationId}]`, err)

  const status = isApiError(err) && err.status ? err.status : 500
  const code = isApiError(err) && err.code ? err.code : 'INTERNAL_ERROR'
  const message = isApiError(err) && err.expose ? err.message : 'Erro interno inesperado.'

  res.status(status).json({ code, message, correlationId })
}
