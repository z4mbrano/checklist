export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
  isAdmin?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  user: User
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
}