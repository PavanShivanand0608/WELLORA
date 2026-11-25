import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './lib/auth'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import MealLog from './pages/MealLog'
import QuickLog from './pages/QuickLog'
import Patterns from './pages/Patterns'
import Recommendations from './pages/Recommendations'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing & Authentication Route */}
        <Route path="/" element={<Landing />} />

        {/* Authenticated Inner Routes Nested Inside ProtectedRoute and AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meals" element={<MealLog />} />
          <Route path="/quick-log" element={<QuickLog />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all Wildcard Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
