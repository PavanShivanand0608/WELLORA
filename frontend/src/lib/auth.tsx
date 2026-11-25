import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export interface User {
  name: string
  email: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  signIn: (email: string, name?: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'wellora_signed_in'
const USER_EMAIL_KEY = 'wellora_user_email'
const USER_NAME_KEY = 'wellora_user_name'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [user, setUser] = useState<User | null>(() => {
    try {
      if (sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
        return {
          name: sessionStorage.getItem(USER_NAME_KEY) || 'Alex Morgan',
          email: sessionStorage.getItem(USER_EMAIL_KEY) || 'alex@wellora.health',
        }
      }
    } catch {
      // Fallback if sessionStorage is disabled
    }
    return null
  })

  useEffect(() => {
    try {
      if (isAuthenticated) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
        if (user) {
          sessionStorage.setItem(USER_EMAIL_KEY, user.email)
          sessionStorage.setItem(USER_NAME_KEY, user.name)
        }
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY)
        sessionStorage.removeItem(USER_EMAIL_KEY)
        sessionStorage.removeItem(USER_NAME_KEY)
      }
    } catch {
      // Ignore sessionStorage exceptions
    }
  }, [isAuthenticated, user])

  const signIn = (email: string, name?: string) => {
    const displayName = name?.trim() || 'Alex Morgan'
    setUser({ name: displayName, email })
    setIsAuthenticated(true)
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
