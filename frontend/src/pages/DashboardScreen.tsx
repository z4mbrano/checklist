import React from 'react'
import { LogOut, User as UserIcon, Play, History } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Screen } from '../types/mobile'

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void
}

export const DashboardScreen = ({ onNavigate }: DashboardScreenProps) => {
  const { user, logout } = useAuth()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name || 'Técnico'}</h1>
          <p className="text-slate-500">Bem-vindo ao seu painel</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
            Sair
          </button>
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
            <UserIcon className="text-slate-600" size={20} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card onClick={() => onNavigate('selectProject')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-blue-500 group">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-900 transition-colors">
            <Play className="text-blue-900 group-hover:text-white w-8 h-8" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Novo Check-in</h2>
            <p className="text-slate-500">Iniciar atendimento em cliente</p>
          </div>
        </Card>

        <Card onClick={() => onNavigate('history')} className="p-8 flex flex-col items-center text-center gap-4 hover:border-emerald-500 group">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <History className="text-emerald-600 group-hover:text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Histórico & Projetos</h2>
            <p className="text-slate-500">Consultar atendimentos realizados</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
