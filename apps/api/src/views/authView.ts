import type { AuthenticatedUser } from '../models/authService.ts'

export function presentAuthenticatedUser(user: AuthenticatedUser) {
  return { id: user.id, email: user.email, role: user.role, status: user.status }
}

export function presentLogin({ token, user }: { token: string; user: AuthenticatedUser }) {
  return { token, user: presentAuthenticatedUser(user) }
}

export function presentMessage(message: string) {
  return { message }
}
