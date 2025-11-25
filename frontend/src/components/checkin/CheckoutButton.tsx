import { useState } from 'react'
import { Square, Clock, CheckCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { Timer } from './Timer'
import { checkinService } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Checkin } from '../../types/checkin.types'

interface CheckoutButtonProps {
  activeCheckin: Checkin | null
  onCheckoutCompleted: () => void
  disabled?: boolean
  className?: string
}

export function CheckoutButton({ 
  activeCheckin, 
  onCheckoutCompleted, 
  disabled = false,
  className = '' 
}: CheckoutButtonProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [description, setDescription] = useState(activeCheckin?.description || '')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!activeCheckin) return

    setLoading(true)
    try {
      await checkinService.checkout({
        checkin_id: activeCheckin.id,
        task_ids: [], // Assuming empty tasks for now if not selected
        description: description || undefined
      })

      onCheckoutCompleted()
      setShowCheckoutForm(false)
      setDescription('')
      toast.success('Check-out realizado com sucesso!')
    } catch (error: any) {
      console.error('Error during checkout:', error)
      toast.error(error.response?.data?.detail || 'Erro ao realizar check-out')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowCheckoutForm(false)
    setDescription(activeCheckin?.description || '')
  }

  if (!activeCheckin) {
    return (
      <div className={`flex items-center space-x-3 text-gray-400 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <span className="text-sm">Sem check-in ativo</span>
        </div>
      </div>
    )
  }

  if (showCheckoutForm) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Current Session Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Sessão Atual</h3>
            <Timer 
              startTime={activeCheckin.checkin_time || new Date().toISOString()} 
              isRunning={true}
              className="text-right"
            />
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Projeto: </span>
              <span className="text-white font-medium">{activeCheckin.project?.name}</span>
            </div>
            
            {activeCheckin.tasks && activeCheckin.tasks.length > 0 && (
              <div>
                <span className="text-gray-400">Tarefa: </span>
                <span className="text-white">{activeCheckin.tasks[0]?.name}</span>
              </div>
            )}

            <div>
              <span className="text-gray-400">Início: </span>
              <span className="text-white">
                {new Date(activeCheckin.checkin_time || new Date()).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Final Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição Final
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que foi realizado durante esta sessão..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vrd-red focus:border-transparent resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta descrição será associada ao registro de trabalho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handleCheckout}
            loading={loading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmar Check-out
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Session Display */}
      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-medium">Sessão Ativa</span>
          </div>
          <Timer 
            startTime={activeCheckin.checkin_time || new Date().toISOString()} 
            isRunning={true}
          />
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Projeto: </span>
            <span className="text-white font-medium">{activeCheckin.project?.name}</span>
          </div>
          
          {activeCheckin.tasks && activeCheckin.tasks.length > 0 && (
            <div>
              <span className="text-gray-400">Tarefa: </span>
              <span className="text-white">{activeCheckin.tasks[0]?.name}</span>
            </div>
          )}
          
          {activeCheckin.task && (
            <div>
              <span className="text-gray-400">Tarefa: </span>
              <span className="text-white">{activeCheckin.task?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Button */}
      {disabled ? (
        <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/20 px-4 py-3 rounded-lg">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Check-out não disponível no momento</span>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setShowCheckoutForm(true)}
          className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
        >
          <Square className="w-5 h-5 mr-3" />
          Finalizar Check-out
        </Button>
      )}
    </div>
  )
}