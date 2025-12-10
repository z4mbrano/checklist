import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { AppRoutes } from './routes'
import { MobileLayout } from './components/layout/MobileLayout'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MobileLayout>
           <AppRoutes />
        </MobileLayout>
      </DataProvider>
    </AuthProvider>
  )
}

export default App