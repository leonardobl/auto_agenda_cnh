import { api } from '../Apis/api'

export interface AuthUser {
  id: string
  email: string
  role: string
  status: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    return data
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  static async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/me')
    return data
  }

  static async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  }
}
