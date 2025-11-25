import { useState } from 'react'
import { Play, Clock, AlertCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { ProjectSelector } from './ProjectSelector'
import { Project } from '../../types'
import { checkinService } from '../../services/api'
import { toast } from 'react-hot-toast'

interface CheckinButtonProps {
  hasActiveCheckin: boolean
  onCheckinCreated: (checkin: any) => void
  disabled?: boolean
  className?: string
}

export function CheckinButton({ 
  hasActiveCheckin, 
  onCheckinCreated, 
  disabled = false,
  className = '' 
}: CheckinButtonProps) {
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')

  const handleStartCheckin = async () => {
    if (!selectedProject) {
      toast.error('Selecione um projeto para iniciar')
      return
    }

    setLoading(true)
    try {
      // Use arrival instead of create
      const checkin = await checkinService.arrival({
        project_id: selectedProject.id,
        description: description || undefined
      })

      onCheckinCreated(checkin)
      setShowProjectSelector(false)
      setSelectedProject(null)
      setDescription('')
      toast.success(`Check-in iniciado no projeto ${selectedProject.name}`)
    } catch (error: any) {
      console.error('Error creating checkin:', error)
      toast.error(error.response?.data?.detail || 'Erro ao iniciar check-in')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowProjectSelector(false)
    setSelectedProject(null)
    setDescription('')
  }

  if (hasActiveCheckin) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2 text-green-400">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Check-in Ativo</span>
        </div>
      </div>
    )
  }

  if (showProjectSelector) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Projeto <span className="text-red-400">*</span>
          </label>
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva brevemente o que será trabalhado..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vrd-red focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handleStartCheckin}
            loading={loading}
            disabled={!selectedProject}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar Check-in
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
    <div className={className}>
      {disabled ? (
        <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/20 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Check-in não disponível no momento</span>
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={() => setShowProjectSelector(true)}
          className="w-full"
        >
          <Clock className="w-5 h-5 mr-3" />
          Iniciar Check-in
        </Button>
      )}
    </div>
  )
}