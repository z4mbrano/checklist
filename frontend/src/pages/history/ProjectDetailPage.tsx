import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Folder, Calendar, Clock, User } from 'lucide-react'
import { projectService } from '@/services/api'
import { Button } from '@/components/common/Button'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(Number(projectId)),
    enabled: !!projectId,
  })

  // This would need a specific endpoint for project checkins
  // For now, we'll show a placeholder
  const projectCheckins: any[] = []

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (projectLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="h-32 bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          Projeto não encontrado
        </h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Folder className="w-8 h-8 text-vrd-red" />
          <span>{project.name}</span>
        </h1>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          project.status === 'active' 
            ? 'bg-green-900/50 text-green-300' 
            : project.status === 'on_hold'
            ? 'bg-yellow-900/50 text-yellow-300'
            : 'bg-gray-700/50 text-gray-400'
        }`}>
          {project.status === 'active' ? 'Ativo' : 
           project.status === 'on_hold' ? 'Pausado' : 'Concluído'}
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações do Projeto</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {project.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Descrição</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>
            )}
            
            <div className="space-y-3">
              {project.start_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Data de Início:</span>
                  <span className="text-white">{formatDate(project.start_date)}</span>
                </div>
              )}
              
              {project.end_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Data de Fim:</span>
                  <span className="text-white">{formatDate(project.end_date)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Cliente</h3>
            <p className="text-white">{project.client?.name || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Project Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-3">
          <Clock className="w-6 h-6 text-vrd-red" />
          <span>Atividades Recentes</span>
        </h2>
        
        {projectCheckins.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              Nenhuma atividade registrada neste projeto ainda
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectCheckins.map((checkin: any) => (
              <div
                key={checkin.id}
                className="border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">
                      {checkin.user?.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {formatDate(checkin.checkin_time)}
                  </span>
                </div>
                
                {checkin.description && (
                  <p className="text-gray-300 text-sm">
                    {checkin.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}