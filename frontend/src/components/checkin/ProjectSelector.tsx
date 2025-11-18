import { useState, useEffect } from 'react'
import { ChevronDown, Folder } from 'lucide-react'
import { Project, Client } from '../../types'
import { projectService, clientService } from '../../services/api'
import { Button } from '../common/Button'

interface ProjectSelectorProps {
  selectedProject: Project | null
  onProjectSelect: (project: Project) => void
  disabled?: boolean
  className?: string
}

export function ProjectSelector({ 
  selectedProject, 
  onProjectSelect, 
  disabled = false,
  className = '' 
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadProjectsAndClients = async () => {
      setLoading(true)
      try {
        const [projectsData, clientsData] = await Promise.all([
          projectService.getAll(),
          clientService.getAll()
        ])
        setProjects(projectsData)
        setClients(clientsData)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjectsAndClients()
  }, [])

  const getClientName = (clientId: number): string => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido'
  }

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(project.client_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProjectSelect = (project: Project) => {
    onProjectSelect(project)
    setIsOpen(false)
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse bg-gray-700/50 h-12 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Selected Project Display */}
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <Folder className="w-5 h-5 text-vrd-red" />
          <div className="flex flex-col min-w-0 flex-1">
            {selectedProject ? (
              <>
                <span className="text-sm font-medium text-white truncate">
                  {selectedProject.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {getClientName(selectedProject.client_id)}
                </span>
              </>
            ) : (
              <span className="text-gray-400">Selecionar projeto...</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-600">
            <input
              type="text"
              placeholder="Buscar projeto ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vrd-red focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Project List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto disponível'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 text-vrd-red flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-white truncate">
                        {project.name}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {getClientName(project.client_id)}
                      </span>
                      {project.description && (
                        <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {project.description}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-900/50 text-green-300' 
                          : project.status === 'on_hold'
                          ? 'bg-yellow-900/50 text-yellow-300'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {project.status === 'active' ? 'Ativo' : 
                         project.status === 'on_hold' ? 'Pausado' : 'Concluído'}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}