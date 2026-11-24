import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiClient, { clearApiCsrfToken, initializeCsrf } from '../api/client'
import type { AuthenticatedUser, LoginCredentials, RegisterCredentials } from '../types/auth'

interface AuthContextValue {
  user: AuthenticatedUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        await initializeCsrf()
        const response = await apiClient.get<{ user: AuthenticatedUser }>('/auth/me')
        if (active) setUser(response.data.user)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void restoreSession()
    return () => { active = false }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    await initializeCsrf()
    const response = await apiClient.post<{ user: AuthenticatedUser }>('/auth/login', credentials)
    setUser(response.data.user)
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    await initializeCsrf()
    const response = await apiClient.post<{ user: AuthenticatedUser }>('/auth/register', credentials)
    setUser(response.data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await initializeCsrf()
      await apiClient.post('/auth/logout')
    } finally {
      setUser(null)
      clearApiCsrfToken()
      queryClient.removeQueries({ queryKey: ['meals'] })
      queryClient.removeQueries({ queryKey: ['settings'] })
      queryClient.removeQueries({ queryKey: ['recommendations'] })
    }
  }, [queryClient])

  const requestPasswordReset = useCallback(async (email: string) => {
    await initializeCsrf()
    const response = await apiClient.post<{ message: string }>('/auth/password/forgot', { email })
    return response.data.message
  }, [])

  const value = useMemo(() => ({ user, isLoading, login, register, logout, requestPasswordReset }), [
    user, isLoading, login, register, logout, requestPasswordReset,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within an AuthProvider')
  return value
}
