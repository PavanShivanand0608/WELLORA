import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const MealLog = lazy(() => import('./pages/MealLog'))
const QuickLog = lazy(() => import('./pages/QuickLog'))
const Patterns = lazy(() => import('./pages/Patterns'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Settings = lazy(() => import('./pages/Settings'))

function ProtectedAppLayout() {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-screen px-6 text-center text-sm font-medium text-muted">Restoring your WELLORA session…</main>
  }
  if (!user) return <Navigate to="/" replace />
  return <AppLayout />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<ProtectedAppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<MealLog />} />
        <Route path="/quick-log" element={<QuickLog />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
