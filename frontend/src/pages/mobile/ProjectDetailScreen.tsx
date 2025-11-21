import React, { useState } from 'react'
import { ArrowLeft, FileText, Edit, History } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Screen, Project, Checkin } from '../../types/mobile'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { ACTIVITY_TAGS } from '../../constants'

// --- PRINT STYLES ---
const PrintStyles = () => (
  <style>{`
    @media print {
      html, body {
        margin: 0;
        padding: 0;
        background: white !important;
        height: auto !important;
        overflow: visible !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      .printable-area {
        display: block !important;
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        flex: none !important;
      }
      
      .print-container {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
        max-height: none !important;
      }
      
      /* Evita quebra de página dentro dos cards */
      .print\\:break-inside-avoid {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      button, input, select, textarea {
        display: none !important;
      }
      
      .rounded-2xl, .rounded-xl {
        border: 1px solid #e2e8f0 !important;
      }
      
      @page {
        size: A4;
        margin: 1cm;
      }
    }
  `}</style>
)

interface ProjectDetailScreenProps {
  selectedProject: Project | null
  onNavigate: (screen: Screen) => void
}

export const ProjectDetailScreen = ({ 
  selectedProject, 
  onNavigate
}: ProjectDetailScreenProps) => {
  const { user } = useAuth()
  const { checkins, updateCheckin } = useData()
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null)

  if (!selectedProject) return null
  
  const projectCheckins = checkins.filter(c => c.projectId === selectedProject.id)
  
  // Check if user can edit this project
  const canEdit = user?.isAdmin || user?.email === selectedProject.responsibleEmail

  const handleExportPDF = () => {
    window.print()
  }

  const handleUpdateCheckin = (checkinData: Partial<Checkin>) => {
    if (!editingCheckin) return

    // Recalculate total hours if times changed
    let totalHours = editingCheckin.totalHours
    if (checkinData.startTime && checkinData.endTime) {
      const start = new Date(checkinData.startTime)
      const end = new Date(checkinData.endTime)
      const diff = (end.getTime() - start.getTime()) / 1000 / 60
      const hours = Math.floor(diff / 60)
      const mins = Math.floor(diff % 60)
      totalHours = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    const updatedCheckin = { ...editingCheckin, ...checkinData, totalHours } as Checkin
    updateCheckin(updatedCheckin)
    setEditingCheckin(null)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto print:h-auto print:block print-container">
      <PrintStyles />
      
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('history')} className="p-2 hover:bg-slate-200 rounded-full no-print"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{selectedProject.name}</h1>
            <p className="text-sm text-slate-500">Histórico de Apontamentos</p>
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button 
            onClick={handleExportPDF} 
            className="p-2 hover:bg-blue-50 rounded-full"
            title="Exportar PDF"
          >
            <FileText className="text-blue-900" size={20} />
          </button>
          {canEdit && (
            <button 
              onClick={() => onNavigate('editProject')} 
              className="p-2 hover:bg-slate-200 rounded-full"
              title="Editar Projeto"
            >
              <Edit className="text-blue-900" size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="printable-area space-y-4 print:flex-none print:overflow-visible print:h-auto">
        {projectCheckins.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <History size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum apontamento encontrado.</p>
          </div>
        )}
        
        {projectCheckins.map(c => (
          <Card key={c.id} className="p-5 print:break-inside-avoid">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-800">{new Date(c.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">
                  {c.startTime && new Date(c.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {c.endTime && new Date(c.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-blue-900">{c.totalHours}h</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {c.activities.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
            
            {c.observations && (
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                "{c.observations}"
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end no-print">
              <button 
                onClick={() => setEditingCheckin(c)}
                className="text-sm font-bold text-blue-900 flex items-center gap-1 hover:underline"
              >
                <Edit size={14} /> Editar
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Checkin Modal */}
      <EditCheckinModal 
        checkin={editingCheckin}
        onClose={() => setEditingCheckin(null)}
        onSave={handleUpdateCheckin}
      />
    </div>
  )
}

const EditCheckinModal = ({ 
  checkin, 
  onClose, 
  onSave 
}: { 
  checkin: Checkin | null
  onClose: () => void
  onSave: (data: Partial<Checkin>) => void
}) => {
  if (!checkin) return null

  const [formData, setFormData] = useState<Partial<Checkin>>({
    arrivalTime: checkin.arrivalTime,
    startTime: checkin.startTime,
    endTime: checkin.endTime,
    activities: checkin.activities || [],
    otherActivities: checkin.otherActivities || '',
    observations: checkin.observations || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const formatDateTimeLocal = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toISOString().slice(0, 16)
  }

  return (
    <Modal isOpen={!!checkin} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Check-in</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="datetime-local"
            label="Horário de Chegada"
            value={formatDateTimeLocal(formData.arrivalTime)}
            onChange={(e) => setFormData({...formData, arrivalTime: new Date(e.target.value).toISOString()})}
          />

          <Input
            type="datetime-local"
            label="Horário de Início"
            value={formatDateTimeLocal(formData.startTime)}
            onChange={(e) => setFormData({...formData, startTime: new Date(e.target.value).toISOString()})}
          />

          <Input
            type="datetime-local"
            label="Horário de Término"
            value={formatDateTimeLocal(formData.endTime)}
            onChange={(e) => setFormData({...formData, endTime: new Date(e.target.value).toISOString()})}
          />

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Atividades</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const newTags = formData.activities?.includes(tag) 
                      ? formData.activities.filter(t => t !== tag)
                      : [...(formData.activities || []), tag]
                    setFormData({...formData, activities: newTags})
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    formData.activities?.includes(tag)
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
            value={formData.otherActivities || ''}
            onChange={(e) => setFormData({...formData, otherActivities: e.target.value})}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Observações</label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              rows={4}
              value={formData.observations || ''}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <Button type="submit" variant="success">
            Salvar Alterações
          </Button>
        </form>
      </div>
    </Modal>
  )
}
