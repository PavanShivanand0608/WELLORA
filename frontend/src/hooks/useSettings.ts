import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, updateProfile, updateSettings } from '../api/settings'
import { useAuth } from '../context/AuthContext'
import { analyticsQueryKeys } from './useAnalytics'
import { recommendationQueryKeys } from './useRecommendations'
import type { UserSettings } from '../types/settings'

export const settingsQueryKeys = {
  all: ['settings'] as const,
  user: (userId: string | undefined) => ['settings', userId] as const,
}

export function useUserSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: settingsQueryKeys.user(user?.id),
    queryFn: fetchSettings,
    enabled: Boolean(user),
    staleTime: 30_000,
  })
}

export function useSaveUserSettings() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: async (settings: UserSettings) => {
      queryClient.setQueryData(settingsQueryKeys.user(user?.id), settings)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all }),
      ])
    },
  })
}

export function useSaveUserProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (settings: UserSettings) => queryClient.setQueryData(settingsQueryKeys.user(user?.id), settings),
  })
}
