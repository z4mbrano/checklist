import { api } from './api'
import { LoginRequest, TokenResponse, RefreshTokenRequest, RegisterRequest } from '@/types/auth.types'

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data)
    return response.data
  },

  async refresh(data: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<any> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updatePassword(data: { senha_atual: string; nova_senha: string }): Promise<any> {
    const response = await api.put('/auth/me', data)
    return response.data
  },
}