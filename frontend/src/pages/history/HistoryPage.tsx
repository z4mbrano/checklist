import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, Calendar, User, Folder } from 'lucide-react'
import { checkinService } from '@/services/api'
import { Button } from '@/components/common/Button'

export default function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['checkins-history', currentPage],
    queryFn: () => checkinService.getHistory(currentPage, pageSize),
  })

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Clock className="w-8 h-8 text-vrd-red" />
          <span>Histórico de Atividades</span>
        </h1>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {historyData?.items?.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              Nenhuma atividade registrada
            </h3>
            <p className="text-gray-500">
              Suas sessões de trabalho aparecerão aqui
            </p>
          </div>
        ) : (
          historyData?.items?.map((checkin: any) => (
            <div
              key={checkin.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Folder className="w-5 h-5 text-vrd-red" />
                    <h3 className="text-lg font-semibold text-white">
                      {checkin.project?.name || 'Projeto não encontrado'}
                    </h3>
                  </div>
                  
                  {checkin.task && (
                    <p className="text-gray-400 mb-2">
                      Tarefa: {checkin.task.name}
                    </p>
                  )}
                  
                  {checkin.description && (
                    <p className="text-gray-300 text-sm mb-3">
                      {checkin.description}
                    </p>
                  )}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  checkin.status === 'completed' 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-blue-900/50 text-blue-300'
                }`}>
                  {checkin.status === 'completed' ? 'Concluído' : 'Ativo'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Data:</span>
                  <span className="text-white">{formatDate(checkin.checkin_time)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Horário:</span>
                  <span className="text-white">
                    {formatTime(checkin.checkin_time)}
                    {checkin.checkout_time && ` - ${formatTime(checkin.checkout_time)}`}
                  </span>
                </div>
                
                {checkin.total_hours && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white font-medium">
                      {formatDuration(checkin.total_hours)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {historyData && historyData.total > pageSize && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">
              Página {currentPage} de {Math.ceil(historyData.total / pageSize)}
            </span>
          </div>
          
          <Button
            variant="secondary"
            disabled={currentPage * pageSize >= historyData.total}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}