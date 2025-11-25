import { User } from '../types/mobile'

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { email: 'admin@vrdsolution.com.br', name: 'Administrador', isAdmin: true },
  { email: 'arthur@vrdsolution.com.br', name: 'Arthur Belmonte', isAdmin: false },
  { email: 'guilherme@vrdsolution.com.br', name: 'Guilherme Bohn', isAdmin: false },
  { email: 'diego@vrdsolution.com.br', name: 'Diego Bohn', isAdmin: false },
  { email: 'rafael@vrdsolution.com.br', name: 'Rafael Machado', isAdmin: false },
  { email: 'raphael@vrdsolution.com.br', name: 'Raphael Machado', isAdmin: false },
]

// WARNING: This is for development only. NEVER use hardcoded passwords in production.
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@vrdsolution.com.br': 'admin123',
  'arthur@vrdsolution.com.br': 'zambranolindo',
  'guilherme@vrdsolution.com.br': 'vrd123',
  'diego@vrdsolution.com.br': 'vrd123',
  'rafael@vrdsolution.com.br': 'vrd123',
  'raphael@vrdsolution.com.br': 'vrd123',
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const normalizedEmail = email.trim().toLowerCase()
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const correctPassword = MOCK_PASSWORDS[user.email] // Use the email from the found user to look up password
    if (password !== correctPassword) {
      throw new Error('Senha incorreta')
    }

    return user
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}
