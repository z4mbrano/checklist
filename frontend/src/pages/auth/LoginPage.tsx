import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Briefcase, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginRequest } from '@/types/auth.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data.email, data.password),
    onSuccess: () => {
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      toast.error(error.message || 'Erro ao fazer login')
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-900 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/20">
            <Briefcase className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">VRD Field Service</h1>
          <p className="text-slate-500">Portal do Técnico</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input 
              {...register('email')}
              type="email"
              placeholder="E-mail corporativo" 
              disabled={loginMutation.isPending}
              className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Input 
              {...register('password')}
              type="password" 
              placeholder="Senha" 
              disabled={loginMutation.isPending}
              className={errors.password ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {loginMutation.isError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-sm text-red-700">
                {(loginMutation.error as any)?.message || 'Erro ao fazer login'}
              </span>
            </div>
          )}

          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-xs text-slate-400 text-center space-y-1">
            <p className="font-semibold text-slate-500">Ambiente de Produção</p>
          </div>
        </form>
      </Card>
    </div>
  )
}