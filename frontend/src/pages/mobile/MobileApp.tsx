import React, { useState } from 'react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { DataProvider } from '../../contexts/DataContext'
import { Screen, Project } from '../../types/mobile'
import { LoginScreen } from './LoginScreen'
import { DashboardScreen } from './DashboardScreen'
import { SelectProjectScreen } from './SelectProjectScreen'
// Import other screens as they are created...

const MobileAppContent = () => {
  const { isAuthenticated } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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
    // Reset workflow state here if needed
    setCurrentScreen('workflow')
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

  // Placeholder for other screens until they are fully refactored
  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Tela em construção: {currentScreen}</h1>
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
        <MobileAppContent />
      </DataProvider>
    </AuthProvider>
  )
}
