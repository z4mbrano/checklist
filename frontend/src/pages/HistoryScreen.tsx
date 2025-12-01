import React from 'react'
import { ArrowLeft, Folder, ChevronRight, Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Screen, Project } from '../types/mobile'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'

interface HistoryScreenProps {
  onNavigate: (screen: Screen) => void
  onSelectProject: (project: Project) => void
}

export const HistoryScreen = ({ 
  onNavigate, 
  onSelectProject
}: HistoryScreenProps) => {
  const { user } = useAuth()
  const { projects, checkins } = useData()

  // Filter projects based on user role
  // TODO: Re-enable filtering when API returns responsible email
  const filteredProjects = projects; 
  /* 
  const filteredProjects = user?.isAdmin 
    ? projects 
    : projects.filter(p => p.responsibleEmail === user?.email)
  */

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft /></button>
            <h1 className="text-xl font-bold text-slate-800">Histórico & Projetos</h1>
        </div>
        <button 
            onClick={() => onNavigate('addProject')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
            <Plus size={20} />
            <span className="hidden sm:inline">Novo Projeto</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <Card key={p.id} onClick={() => { onSelectProject(p); onNavigate('projectDetail') }} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-900">
                <Folder size={20} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                p.status === 'Em Andamento' ? 'bg-emerald-100 text-emerald-700' : 
                p.status === 'Pausado' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {p.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{p.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{p.client}</p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <span>{checkins.filter(c => c.projectId === p.id).length} check-ins</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
