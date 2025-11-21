import React, { useState } from 'react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { DataProvider } from '../../contexts/DataContext'
import { Screen, Project } from '../../types/mobile'
import { LoginScreen } from './LoginScreen'
import { DashboardScreen } from './DashboardScreen'
import { SelectProjectScreen } from './SelectProjectScreen'
import { ProjectFormScreen } from './ProjectFormScreen'
import { WorkflowScreen } from './WorkflowScreen'
import { HistoryScreen } from './HistoryScreen'
import { ProjectDetailScreen } from './ProjectDetailScreen'
import { SuccessScreen } from './SuccessScreen'

const MobileAppContent = () => {
  const { isAuthenticated } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'arrived' | 'working' | 'checkout'>('idle')

  // Effect to handle auth state changes
  React.useEffect(() => {
    if (isAuthenticated && currentScreen === 'login') {
      setCurrentScreen('dashboard')
    } else if (!isAuthenticated && currentScreen !== 'login') {
      setCurrentScreen('login')
    }
  }, [isAuthenticated, currentScreen])

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setWorkflowStep('idle')
    setCurrentScreen('workflow')
  }

  const handleSelectProjectForHistory = (project: Project) => {
    setSelectedProject(project)
  }

  // Render logic
  if (currentScreen === 'login') return <LoginScreen />
  
  if (currentScreen === 'dashboard') return <DashboardScreen onNavigate={setCurrentScreen} />
  
  if (currentScreen === 'selectProject') return (
    <SelectProjectScreen 
      onNavigate={setCurrentScreen} 
      onSelectProject={handleSelectProject} 
    />
  )

  if (currentScreen === 'addProject') return (
    <ProjectFormScreen 
      onNavigate={setCurrentScreen}
      mode="add"
      onProjectSaved={(project) => {
          setSelectedProject(project)
          setWorkflowStep('idle')
          setCurrentScreen('workflow')
      }}
    />
  )

  if (currentScreen === 'editProject') return (
    <ProjectFormScreen 
      onNavigate={setCurrentScreen}
      mode="edit"
      initialData={selectedProject}
    />
  )

  if (currentScreen === 'workflow') return (
    <WorkflowScreen 
      selectedProject={selectedProject}
      onNavigate={setCurrentScreen}
      workflowStep={workflowStep}
      setWorkflowStep={setWorkflowStep}
    />
  )

  if (currentScreen === 'history') return (
    <HistoryScreen 
      onNavigate={setCurrentScreen}
      onSelectProject={handleSelectProjectForHistory}
    />
  )

  if (currentScreen === 'projectDetail') return (
    <ProjectDetailScreen 
      selectedProject={selectedProject}
      onNavigate={setCurrentScreen}
    />
  )

  if (currentScreen === 'success') return <SuccessScreen onNavigate={setCurrentScreen} />

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Tela não encontrada: {currentScreen}</h1>
      <button onClick={() => setCurrentScreen('dashboard')} className="mt-4 text-blue-600 underline">
        Voltar ao Dashboard
      </button>
    </div>
  )
}

export default function MobileApp() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <MobileAppContent />
        </div>
      </DataProvider>
    </AuthProvider>
  )
}
