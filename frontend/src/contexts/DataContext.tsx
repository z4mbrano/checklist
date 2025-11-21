import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Project, Checkin } from '../types/mobile'

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [
  { 
    id: '1', 
    name: 'Instalação CCTV', 
    client: 'Shopping Metrô', 
    responsible: 'Carlos Silva', 
    responsibleEmail: 'carlos@vrdsolution.com',
    startDate: '2023-10-01', 
    status: 'Em Andamento' 
  },
  { 
    id: '2', 
    name: 'Manutenção Rede', 
    client: 'Escola Futuro', 
    responsible: 'Ana Souza', 
    responsibleEmail: 'ana@vrdsolution.com',
    startDate: '2023-11-15', 
    status: 'Em Andamento' 
  },
  { 
    id: '3', 
    name: 'Consultoria TI', 
    client: 'Advocacia Lima', 
    responsible: 'Roberto Dias', 
    responsibleEmail: 'roberto@vrdsolution.com',
    startDate: '2023-09-20', 
    status: 'Concluído' 
  },
  { 
    id: '4', 
    name: 'Implementação Firewall', 
    client: 'Empresa Tech Solutions', 
    responsible: 'Arthur Zambrano', 
    responsibleEmail: 'arthur@vrdsolution.com.br',
    startDate: '2023-11-21', 
    status: 'Em Andamento' 
  },
]

const INITIAL_CHECKINS: Checkin[] = [
  { 
    id: '101', 
    projectId: '3', 
    projectName: 'Consultoria TI', 
    arrivalTime: '2023-11-20T09:00:00', 
    startTime: '2023-11-20T09:15:00', 
    endTime: '2023-11-20T11:30:00', 
    totalHours: '02:15', 
    activities: ['Reunião'], 
    observations: 'Reunião inicial com cliente', 
    date: '2023-11-20',
    userEmail: 'roberto@vrdsolution.com'
  }
]

interface DataContextType {
  projects: Project[]
  checkins: Checkin[]
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  addCheckin: (checkin: Checkin) => void
  updateCheckin: (checkin: Checkin) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [checkins, setCheckins] = useState<Checkin[]>(INITIAL_CHECKINS)

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project])
  }

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p))
  }

  const addCheckin = (checkin: Checkin) => {
    setCheckins(prev => [checkin, ...prev])
  }

  const updateCheckin = (checkin: Checkin) => {
    setCheckins(prev => prev.map(c => c.id === checkin.id ? checkin : c))
  }

  return (
    <DataContext.Provider value={{
      projects,
      checkins,
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
