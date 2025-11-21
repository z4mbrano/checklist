import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService, checkinService, taskService } from '@/services/api'
import { CheckinStatus, CheckinType, CheckoutRequest } from '@/types'
import { Button } from '@/components/common/Button'

export const CheckinWorkflowPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [currentCheckin, setCurrentCheckin] = useState<any>(null)
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [observations, setObservations] = useState('')
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)

  // Buscar informações do projeto
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(Number(projectId)),
    enabled: !!projectId
  })

  // Buscar tarefas disponíveis
  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getByProject(Number(projectId)),
    enabled: !!projectId
  })

  // Buscar check-in ativo
  const { data: activeCheckin, refetch: refetchCheckin } = useQuery({
    queryKey: ['current-checkin'],
    queryFn: () => checkinService.getCurrentCheckin()
  })

  useEffect(() => {
    if (activeCheckin) {
      setCurrentCheckin(activeCheckin)
    }
  }, [activeCheckin])

  // Mutation para check-in de chegada
  const arrivalMutation = useMutation({
    mutationFn: () => checkinService.arrival({
      project_id: Number(projectId),
      type: CheckinType.ARRIVAL
    }),
    onSuccess: (data) => {
      setCurrentCheckin(data)
      queryClient.invalidateQueries({ queryKey: ['current-checkin'] })
    }
  })

  // Mutation para início de serviço
  const startServiceMutation = useMutation({
    mutationFn: () => checkinService.startService({
      checkin_id: currentCheckin.id
    }),
    onSuccess: (data) => {
      setCurrentCheckin(data)
      queryClient.invalidateQueries({ queryKey: ['current-checkin'] })
    }
  })

  // Mutation para check-out
  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => checkinService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-checkin'] })
      navigate('/dashboard')
    }
  })

  const handleArrival = () => {
    arrivalMutation.mutate()
  }

  const handleStartService = () => {
    startServiceMutation.mutate()
  }

  const handleCheckout = () => {
    setShowCheckoutForm(true)
  }

  const handleConfirmCheckout = () => {
    if (currentCheckin) {
      checkoutMutation.mutate({
        checkin_id: currentCheckin.id,
        task_ids: selectedTasks,
        observations
      })
    }
  }

  const handleTaskToggle = (taskId: number) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const isArrived = currentCheckin?.status === CheckinStatus.ARRIVED
  const isWorking = currentCheckin?.status === CheckinStatus.WORKING

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Cabeçalho com informações do projeto */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {project?.name}
            </h1>
            {project?.client && (
              <p className="text-gray-600">
                Cliente: {project.client.name}
              </p>
            )}
          </div>

          {/* Formulário de Check-out */}
          {showCheckoutForm ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Finalizar Atendimento
              </h2>

              {/* Seleção de atividades executadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Atividades Executadas
                </label>
                <div className="space-y-2">
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleTaskToggle(task.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="ml-3 text-gray-700">{task.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Nenhuma atividade cadastrada para este projeto
                    </p>
                  )}
                </div>
              </div>

              {/* Campo de observações */}
              <div>
                <label
                  htmlFor="observations"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Observações
                </label>
                <textarea
                  id="observations"
                  rows={4}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite aqui suas observações sobre o atendimento..."
                />
              </div>

              {/* Botões de ação */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowCheckoutForm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmCheckout}
                  className="flex-1"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? 'Finalizando...' : 'Finalizar'}
                </Button>
              </div>
            </div>
          ) : (
            /* Botões do fluxo de check-in */
            <div className="space-y-4">
              {/* Passo 1: Check-in de chegada */}
              {!currentCheckin && (
                <Button
                  onClick={handleArrival}
                  disabled={arrivalMutation.isPending}
                  className="w-full py-6 text-lg"
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {arrivalMutation.isPending
                    ? 'Registrando chegada...'
                    : 'Check-in: Chegada no Cliente'}
                </Button>
              )}

              {/* Passo 2: Iniciar serviço (só aparece após chegada) */}
              {isArrived && (
                <Button
                  onClick={handleStartService}
                  disabled={startServiceMutation.isPending}
                  className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {startServiceMutation.isPending
                    ? 'Iniciando serviço...'
                    : 'Check-in: Iniciar Serviço'}
                </Button>
              )}

              {/* Passo 3: Check-out (só aparece durante o serviço) */}
              {isWorking && (
                <Button
                  onClick={handleCheckout}
                  className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Check-out
                </Button>
              )}

              {/* Informação do status atual */}
              {currentCheckin && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Status Atual:{' '}
                    {isArrived && 'Aguardando início do serviço'}
                    {isWorking && 'Serviço em andamento'}
                  </p>
                  {currentCheckin.arrival_time && (
                    <p className="text-sm text-blue-600 mt-1">
                      Chegada: {new Date(currentCheckin.arrival_time).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                  {currentCheckin.start_time && (
                    <p className="text-sm text-blue-600 mt-1">
                      Início: {new Date(currentCheckin.start_time).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
