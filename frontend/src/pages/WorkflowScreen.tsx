import React, { useState } from 'react'
import { ArrowLeft, MapPin, Play, StopCircle, CheckCircle, Clock } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Screen, Project, Checkin } from '../types/mobile'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { ACTIVITY_TAGS } from '../constants'

interface WorkflowScreenProps {
  selectedProject: Project | null
  onNavigate: (screen: Screen) => void
  workflowStep: 'idle' | 'arrived' | 'working' | 'checkout'
  setWorkflowStep: (step: 'idle' | 'arrived' | 'working' | 'checkout') => void
}

export const WorkflowScreen = ({ 
  selectedProject,
  onNavigate,
  workflowStep,
  setWorkflowStep
}: WorkflowScreenProps) => {
  const { user } = useAuth()
  const { addCheckin } = useData()
  
  const [timestamps, setTimestamps] = useState<{arrival?: string, start?: string, end?: string}>({})
  const [checkoutData, setCheckoutData] = useState({ activities: [] as string[], other: '', obs: '' })

  if (!selectedProject) return null
  
  const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'

  const handleWorkflowAction = (action: 'arrival' | 'start' | 'end') => {
    const now = new Date().toISOString()
    if (action === 'arrival') {
      setTimestamps({ ...timestamps, arrival: now })
      setWorkflowStep('arrived')
    } else if (action === 'start') {
      setTimestamps({ ...timestamps, start: now })
      setWorkflowStep('working')
    } else if (action === 'end') {
      setTimestamps({ ...timestamps, end: now })
      setWorkflowStep('checkout')
    }
  }

  const finishCheckin = () => {
    if (!selectedProject || !timestamps.start || !timestamps.end) return
    
    const start = new Date(timestamps.start)
    const end = new Date(timestamps.end)
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 // minutes
    const hours = Math.floor(diff / 60)
    const mins = Math.floor(diff % 60)
    const totalHours = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

    const newCheckin: Checkin = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      userEmail: user?.email || '',
      arrivalTime: timestamps.arrival,
      startTime: timestamps.start,
      endTime: timestamps.end,
      totalHours,
      activities: checkoutData.activities,
      otherActivities: checkoutData.other,
      observations: checkoutData.obs,
      date: new Date().toISOString().split('T')[0]
    }

    addCheckin(newCheckin)
    onNavigate('success')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => onNavigate('selectProject')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{selectedProject.name}</h1>
          <p className="text-sm text-slate-500">{selectedProject.client}</p>
        </div>
      </header>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded-xl border ${timestamps.arrival ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Chegada</p>
          <p className="text-2xl font-mono font-bold text-slate-800">{formatTime(timestamps.arrival)}</p>
        </div>
        <div className={`p-4 rounded-xl border ${timestamps.start ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Início</p>
          <p className="text-2xl font-mono font-bold text-slate-800">{formatTime(timestamps.start)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-1 flex flex-col justify-center gap-4">
        {workflowStep === 'idle' && (
          <Button onClick={() => handleWorkflowAction('arrival')} icon={MapPin}>
            Chegada no Cliente
          </Button>
        )}
        
        {workflowStep === 'arrived' && (
          <Button onClick={() => handleWorkflowAction('start')} variant="success" icon={Play}>
            Iniciar Serviço
          </Button>
        )}

        {workflowStep === 'working' && (
          <div className="space-y-4 animate-pulse">
            <div className="text-center py-8">
              <p className="text-slate-500 mb-2">Serviço em andamento...</p>
              <Clock className="w-12 h-12 text-blue-900 mx-auto animate-spin-slow" />
            </div>
            <Button onClick={() => handleWorkflowAction('end')} variant="danger" icon={StopCircle}>
              Check-out / Finalizar
            </Button>
          </div>
        )}

        {workflowStep === 'checkout' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Atividades Realizadas</h3>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = checkoutData.activities.includes(tag) 
                          ? checkoutData.activities.filter((t: string) => t !== tag)
                          : [...checkoutData.activities, tag]
                        setCheckoutData({...checkoutData, activities: newTags})
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        checkoutData.activities.includes(tag)
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <Input 
                label="Outras Atividades" 
                placeholder="Descreva se necessário..." 
                value={checkoutData.other} 
                onChange={(e) => setCheckoutData({...checkoutData, other: e.target.value})} 
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações Gerais</label>
                <textarea 
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 outline-none"
                  rows={3}
                  value={checkoutData.obs}
                  onChange={(e) => setCheckoutData({...checkoutData, obs: e.target.value})}
                />
              </div>
            </Card>
            <Button onClick={finishCheckin} variant="success" icon={CheckCircle}>
              Finalizar Apontamento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
