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
  addProject: (project: Project) => Promise<Project | undefined> // Returns created project with DB ID
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
    responsible: p.responsible_user?.name || 'Técnico',
    responsibleEmail: p.responsible_user?.email || '',
    startDate: p.start_date || '',
    endDate: p.end_date,
    status: p.status === ProjectStatus.COMPLETED ? 'Concluído' : 
            p.status === ProjectStatus.ON_HOLD ? 'Pausado' : 'Em Andamento',
    observations: p.description
  })

  const mapApiCheckinToMobile = (c: ApiCheckin): Checkin => {
    // Robust mapping to handle potential missing fields or structure mismatches
    const projectName = c.project?.name || 'Projeto';
    const userEmail = c.user?.email || '';
    
    return {
      id: c.id.toString(),
      projectId: c.project_id.toString(),
      projectName: projectName,
      arrivalTime: c.arrival_time,
      startTime: c.start_time || c.created_at, // Fallback to created_at if start_time is missing
      endTime: c.checkout_time,
      totalHours: c.total_hours ? c.total_hours.toFixed(2) : undefined,
      activities: c.tasks?.map(t => t.name) || [],
      observations: c.observations,
      date: c.created_at,
      userEmail: userEmail
    }
  }

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
  const addProject = async (project: Project): Promise<Project | undefined> => {
    try {
      // Map Mobile Project to API CreateProjectRequest
      // TODO: Handle client selection properly. Using ID 1 as default.
      const apiProject = {
        name: project.name,
        description: project.observations || undefined,
        start_date: project.startDate || undefined,
        end_date_planned: project.endDate || undefined,
        client_id: 1, 
        responsible_user_id: 1, // TODO: Get from auth context or selection
        estimated_value: undefined
      }
      
      const newProject = await projectService.create(apiProject)
      const mappedProject = mapApiProjectToMobile(newProject)
      setProjects(prev => [...prev, mappedProject])
      toast.success('Projeto criado com sucesso!')
      return mappedProject
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Erro ao criar projeto')
      return undefined
    }
  }

  const updateProject = (project: Project) => {
    console.warn('updateProject called in DataContext - should use API')
    setProjects(prev => prev.map(p => p.id === project.id ? project : p))
  }

  const addCheckin = async (checkin: Checkin) => {
    try {
      // Map Mobile Checkin to API CreateFullCheckinRequest
      const apiCheckinPayload = {
        project_id: parseInt(checkin.projectId),
        arrival_time: checkin.arrivalTime,
        start_time: checkin.startTime,
        end_time: checkin.endTime,
        activities: checkin.activities,
        observations: checkin.observations || checkin.otherActivities
      }

      const newCheckin = await checkinService.createFull(apiCheckinPayload)
      setCheckins(prev => [mapApiCheckinToMobile(newCheckin), ...prev])
      toast.success('Check-in salvo com sucesso!')
    } catch (error) {
      console.error('Error creating checkin:', error)
      toast.error('Erro ao salvar check-in')
    }
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
