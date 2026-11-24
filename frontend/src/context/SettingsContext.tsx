import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useSaveUserProfile, useSaveUserSettings, useUserSettings } from '../hooks/useSettings'
import type { UserProfile, UserSettings } from '../types/settings'

interface SettingsContextValue {
  settings: UserSettings
  isLoading: boolean
  isSaving: boolean
  error: Error | null
  saveSettings: (settings: UserSettings) => Promise<UserSettings>
  saveProfile: (profile: UserProfile) => Promise<UserSettings>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function initialSettings(user: ReturnType<typeof useAuth>['user']): UserSettings {
  return {
    profile: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      age: null,
      gender: '',
      heightCm: null,
      weightKg: null,
    },
    goals: { calories: null, proteinG: null, carbsG: null, fatG: null, fiberG: null, objectives: [] },
    foodPreferences: { foodStyle: 'Not set', allergies: [], dietaryPreferences: [], foodsToAvoid: [], favouriteCategories: [] },
    applicationPreferences: {
      notificationsEnabled: true,
      mealReminderEnabled: false,
      mealReminderTime: '',
      hydrationReminderEnabled: false,
      hydrationReminderTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      theme: 'light',
    },
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const query = useUserSettings()
  const settingsMutation = useSaveUserSettings()
  const profileMutation = useSaveUserProfile()
  const settings = useMemo(() => query.data ?? initialSettings(user), [query.data, user])
  const saveSettings = useCallback((next: UserSettings) => settingsMutation.mutateAsync(next), [settingsMutation])
  const saveProfile = useCallback((profile: UserProfile) => profileMutation.mutateAsync(profile), [profileMutation])
  const value = useMemo(() => ({
    settings,
    isLoading: query.isLoading,
    isSaving: settingsMutation.isPending || profileMutation.isPending,
    error: query.error instanceof Error ? query.error : null,
    saveSettings,
    saveProfile,
  }), [settings, query.isLoading, query.error, settingsMutation.isPending, profileMutation.isPending, saveSettings, saveProfile])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used within a SettingsProvider')
  return value
}
