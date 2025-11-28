import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { Project, Checkin } from '../types/mobile'
import { projectService, checkinService } from '../services/api'
import { Project as ApiProject, ProjectStatus } from '../types/project.types'
import { Checkin as ApiCheckin } from '../types/checkin.types'
import { useAuth } from './AuthContext'
import { toast } from 'react-hot-toast'

interface DataContextType {
  projects: Project[]
  checkins: Checkin[]
  isLoading: boolean
  refreshData: () => Promise<void>
  addProject: (project: Project) => void // Deprecated/Mock adapter
  updateProject: (project: Project) => void // Deprecated/Mock adapter
  addCheckin: (checkin: Checkin) => void // Deprecated/Mock adapter
  updateCheckin: (checkin: Checkin) => void // Deprecated/Mock adapter
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const mapApiProjectToMobile = (p: ApiProject): Project => ({
    id: p.id.toString(),
    name: p.name,
    client: p.client?.name || 'Cliente Desconhecido',
    responsible: 'Técnico', // API doesn't have this yet
    responsibleEmail: '', // API doesn't have this yet
    startDate: p.start_date || '',
    endDate: p.end_date,
    status: p.status === ProjectStatus.COMPLETED ? 'Concluído' : 
            p.status === ProjectStatus.ON_HOLD ? 'Pausado' : 'Em Andamento',
    observations: p.description
  })

  const mapApiCheckinToMobile = (c: ApiCheckin): Checkin => ({
    id: c.id.toString(),
    projectId: c.project_id.toString(),
    projectName: c.project?.name || 'Projeto',
    arrivalTime: c.arrival_time,
    startTime: c.start_time,
    endTime: c.checkout_time,
    totalHours: c.total_hours ? c.total_hours.toFixed(2) : undefined,
    activities: c.tasks?.map(t => t.name) || [],
    observations: c.observations,
    date: c.created_at,
    userEmail: c.user?.email || ''
  })

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
      const [projectsData, checkinsData] = await Promise.all([
        projectService.getAll(),
        checkinService.getHistory(1, 100) // Fetch last 100 checkins
      ])

      if (Array.isArray(projectsData)) {
        setProjects(projectsData.map(mapApiProjectToMobile))
      } else {
        console.error('Invalid projects data format:', projectsData)
        setProjects([])
      }

      if (checkinsData && Array.isArray(checkinsData.items)) {
        setCheckins(checkinsData.items.map(mapApiCheckinToMobile))
      } else {
        console.error('Invalid checkins data format:', checkinsData)
        setCheckins([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Adapters for existing UI components that expect synchronous updates
  // In a real app, these should be replaced by direct API calls in the components
  const addProject = (project: Project) => {
    // This is a placeholder. In production, components should call projectService.create()
    console.warn('addProject called in DataContext - should use API')
    setProjects(prev => [...prev, project])
  }

  const updateProject = (project: Project) => {
    console.warn('updateProject called in DataContext - should use API')
    setProjects(prev => prev.map(p => p.id === project.id ? project : p))
  }

  const addCheckin = (checkin: Checkin) => {
    console.warn('addCheckin called in DataContext - should use API')
    setCheckins(prev => [checkin, ...prev])
  }

  const updateCheckin = (checkin: Checkin) => {
    console.warn('updateCheckin called in DataContext - should use API')
    setCheckins(prev => prev.map(c => c.id === checkin.id ? checkin : c))
  }

  return (
    <DataContext.Provider value={{
      projects,
      checkins,
      isLoading,
      refreshData,
      addProject,
      updateProject,
      addCheckin,
      updateCheckin
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
