import React, { useState } from 'react'
import { ArrowLeft, UserPlus, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export const UserRegistrationScreen = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tecnico'
  })

  // Protect route
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Acesso não autorizado')
      navigate('/menu')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não conferem')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/users/', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      toast.success('Usuário cadastrado com sucesso!')
      navigate('/menu')
    } catch (error: any) {
      console.error(error)
      const msg = error.response?.data?.detail || 'Erro ao cadastrar usuário'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/menu')} className="p-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Novo Usuário</h1>
          <p className="text-sm text-slate-500">Cadastrar novo membro da equipe</p>
        </div>
      </header>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserPlus size={32} />
            </div>
          </div>

          <Input
            label="Nome Completo"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="Ex: joao@empresa.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Senha"
              type="password"
              placeholder="******"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
            
            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="******"
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perfil de Acesso</label>
            <select
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="tecnico">Técnico</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData.role === 'admin' ? 'Acesso total ao sistema.' : 
               formData.role === 'supervisor' ? 'Pode gerenciar projetos e ver relatórios.' : 
               'Acesso padrão para realizar check-ins.'}
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" icon={Save} disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
