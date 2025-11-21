import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Layout } from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import { ProjectSelectionPage } from '@/pages/checkin/ProjectSelectionPage'
import { CheckinWorkflowPage } from '@/pages/checkin/CheckinWorkflowPage'
import { AddProjectPage } from '@/pages/checkin/AddProjectPage'
import HistoryPage from '@/pages/history/HistoryPage'
import ProjectDetailPage from '@/pages/history/ProjectDetailPage'
import MobileWorkflowApp from '@/pages/mobile/MobileWorkflowApp'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <div className="min-h-screen bg-vrd-darker">
      <Routes>
        {/* Versão Mobile (standalone) */}
        <Route path="/mobile" element={<MobileWorkflowApp />} />
        
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="checkin/select-project" element={<ProjectSelectionPage />} />
          <Route path="checkin/workflow/:projectId" element={<CheckinWorkflowPage />} />
          <Route path="projects/new" element={<AddProjectPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="project/:id" element={<ProjectDetailPage />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App