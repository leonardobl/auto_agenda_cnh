// View for every error response — the docs/04 §6.3 envelope. Status and logging stay
// in the middlewares; only the JSON shape lives here.
export interface ErrorView {
  code: string
  message: string
  correlationId: string
}

export function presentError(code: string, message: string, correlationId: string): ErrorView {
  return { code, message, correlationId }
}
