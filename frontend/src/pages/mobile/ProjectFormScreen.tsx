import React, { useState } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Screen, Project } from '../../types/mobile'
import { useData } from '../../contexts/DataContext'

interface ProjectFormScreenProps {
  onNavigate: (screen: Screen) => void
  onProjectSaved?: (project: Project) => void
  initialData?: Project | null
  mode?: 'add' | 'edit'
}

export const ProjectFormScreen = ({ 
  onNavigate, 
  onProjectSaved,
  initialData,
  mode = 'add'
}: ProjectFormScreenProps) => {
  const { addProject, updateProject } = useData()
  
  const [formData, setFormData] = useState<Partial<Project>>(
    initialData || {
      name: '',
      client: '',
      responsible: '',
      responsibleEmail: '',
      startDate: '',
      endDate: '',
      observations: '',
      status: 'Em Andamento'
    }
  )
  const [errors, setErrors] = useState<{name?: string; client?: string; responsibleEmail?: string}>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome do projeto é obrigatório'
    }
    
    if (!formData.client || formData.client.trim() === '') {
      newErrors.client = 'Cliente é obrigatório'
    }

    if (!formData.responsibleEmail || !formData.responsibleEmail.includes('@')) {
      newErrors.responsibleEmail = 'E-mail válido é obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (mode === 'add') {
        const newProject: Project = {
            id: Date.now().toString(),
            name: formData.name!,
            client: formData.client!,
            responsible: formData.responsible || 'Técnico',
            responsibleEmail: formData.responsibleEmail!,
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            status: formData.status || 'Em Andamento',
            endDate: formData.endDate,
            observations: formData.observations
        }
        addProject(newProject)
        if (onProjectSaved) {
            onProjectSaved(newProject)
        } else {
            onNavigate('selectProject')
        }
    } else {
        if (initialData && initialData.id) {
             const updatedProject = { ...initialData, ...formData } as Project
             updateProject(updatedProject)
             if (onProjectSaved) {
                 onProjectSaved(updatedProject)
             } else {
                 onNavigate('projectDetail')
             }
        }
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate(mode === 'edit' ? 'projectDetail' : 'selectProject')} className="p-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{mode === 'edit' ? 'Editar Projeto' : 'Novo Projeto'}</h1>
      </header>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              label="Nome do Projeto *" 
              placeholder="Ex: Instalação Fibra" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Input 
              label="Cliente *" 
              placeholder="Nome do Cliente" 
              value={formData.client || ''} 
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              required
            />
            {errors.client && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.client}
              </p>
            )}
          </div>

          <Input 
            label="Responsável" 
            placeholder="Nome do Técnico" 
            value={formData.responsible || ''} 
            onChange={(e) => setFormData({...formData, responsible: e.target.value})}
          />

          <div>
            <Input 
              label="E-mail do Responsável *" 
              type="email"
              placeholder="tecnico@vrdsolution.com" 
              value={formData.responsibleEmail || ''} 
              onChange={(e) => setFormData({...formData, responsibleEmail: e.target.value})}
              required
            />
            {errors.responsibleEmail && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.responsibleEmail}
              </p>
            )}
          </div>
          
          <Select
            label="Status"
            value={formData.status || 'Em Andamento'}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
          >
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Pausado">Pausado</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="date" 
              label="Data Início" 
              value={formData.startDate || ''} 
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
            <Input 
              type="date" 
              label="Data Fim" 
              value={formData.endDate || ''} 
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações</label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              rows={3}
              value={formData.observations || ''}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Detalhes adicionais..."
            />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="success">
              {mode === 'edit' ? 'Salvar Alterações' : 'Salvar e Iniciar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
