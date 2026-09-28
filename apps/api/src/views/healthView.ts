export function presentHealthOk() {
  return { status: 'ok' }
}

export function presentHealthError(message: string) {
  return { status: 'error', message }
}
