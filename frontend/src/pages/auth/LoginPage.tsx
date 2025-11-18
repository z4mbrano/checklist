import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { LoginRequest } from '@/types/auth.types'

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.access_token, response.refresh_token)
      toast.success(`Bem-vindo, ${response.user.name}!`)
      navigate('/dashboard')
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      toast.error(error.response?.data?.detail || 'Erro ao fazer login')
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vrd-darker">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            VRD <span className="text-vrd-blue">SOLUTION</span>
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-8">LOGIN</h2>
        </div>

        {/* Login form */}
        <div className="bg-vrd-dark p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="form-input w-full"
                placeholder="seu@email.com"
                disabled={loginMutation.isPending}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                id="senha"
                className="form-input w-full"
                placeholder="••••••••"
                disabled={loginMutation.isPending}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="form-button w-full flex items-center justify-center space-x-2"
            >
              {loginMutation.isPending && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
              )}
              <span>{loginMutation.isPending ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Sistema de Check-in/Check-out</p>
          <p className="mt-1">© 2025 VRD Solution. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}