import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Folder, Activity, User } from 'lucide-react'
import { CheckinButton, CheckoutButton } from '@/components/checkin'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/store/authStore'
import { checkinService, projectService } from '@/services/api'
import { Checkin } from '@/types/checkin.types'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [currentCheckin, setCurrentCheckin] = useState<Checkin | null>(null)

  // Fetch current checkin
  const { data: checkinData, refetch: refetchCheckin } = useQuery({
    queryKey: ['current-checkin'],
    queryFn: checkinService.getCurrentCheckin,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch recent projects for quick access
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  })

  useEffect(() => {
    setCurrentCheckin(checkinData || null)
  }, [checkinData])

  const handleCheckinCreated = (checkin: Checkin) => {
    setCurrentCheckin(checkin)
    refetchCheckin()
  }

  const handleCheckoutCompleted = () => {
    setCurrentCheckin(null)
    refetchCheckin()
  }

  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-vrd-red/20 to-transparent border border-vrd-red/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bem-vindo, {user?.name}
            </h1>
            <p className="text-gray-400 mt-1">
              {currentCheckin ? 'Você tem uma sessão ativa' : 'Pronto para começar?'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-400">Status</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentCheckin ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span className={currentCheckin ? 'text-green-400' : 'text-gray-400'}>
                  {currentCheckin ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Checkin/Checkout Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-vrd-red" />
            <h2 className="text-xl font-semibold text-white">
              {currentCheckin ? 'Sessão Atual' : 'Controle de Tempo'}
            </h2>
          </div>

          {currentCheckin ? (
            <CheckoutButton
              activeCheckin={currentCheckin}
              onCheckoutCompleted={handleCheckoutCompleted}
            />
          ) : (
            <CheckinButton
              hasActiveCheckin={!!currentCheckin}
              onCheckinCreated={handleCheckinCreated}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-vrd-red" />
            <span>Resumo Rápido</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{activeProjects.length}</div>
              <div className="text-sm text-gray-400">Projetos Ativos</div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {currentCheckin ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-400">Sessões Ativas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Projects */}
      {activeProjects.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Folder className="w-5 h-5 text-vrd-red" />
              <span>Projetos Ativos</span>
            </h3>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white truncate flex-1">
                    {project.name}
                  </h4>
                  <div className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded-full ml-2">
                    Ativo
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}

                {currentCheckin?.project_id === project.id && (
                  <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Sessão Ativa</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-12">
          <Activity className="w-4 h-4 mr-2" />
          Histórico
        </Button>
        <Button variant="outline" className="h-12">
          <Folder className="w-4 h-4 mr-2" />
          Projetos
        </Button>
        <Button variant="outline" className="h-12">
          <User className="w-4 h-4 mr-2" />
          Perfil
        </Button>
      </div>
    </div>
  )
}