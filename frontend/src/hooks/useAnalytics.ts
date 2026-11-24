import { useQuery } from '@tanstack/react-query'
import { fetchDashboardAnalytics, fetchNutritionTrends, fetchPatternAnalytics, type AnalyticsRangeParams } from '../api/analytics'
import { useAuth } from '../context/AuthContext'

export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  dashboard: (userId: string | undefined, date: string, timezone: string) => ['analytics', userId, 'dashboard', date, timezone] as const,
  trends: (userId: string | undefined, params: AnalyticsRangeParams) => ['analytics', userId, 'trends', params] as const,
  patterns: (userId: string | undefined, params: AnalyticsRangeParams) => ['analytics', userId, 'patterns', params] as const,
}

export function useDashboardAnalytics(date: string, timezone: string, enabled = true) {
  const { user } = useAuth()
  return useQuery({
    queryKey: analyticsQueryKeys.dashboard(user?.id, date, timezone),
    queryFn: () => fetchDashboardAnalytics(date, timezone),
    enabled: Boolean(user) && enabled,
    staleTime: 20_000,
  })
}

export function useNutritionTrends(params: AnalyticsRangeParams, enabled = true) {
  const { user } = useAuth()
  return useQuery({
    queryKey: analyticsQueryKeys.trends(user?.id, params),
    queryFn: () => fetchNutritionTrends(params),
    enabled: Boolean(user) && enabled,
    staleTime: 30_000,
  })
}

export function usePatternAnalytics(params: AnalyticsRangeParams, enabled = true) {
  const { user } = useAuth()
  return useQuery({
    queryKey: analyticsQueryKeys.patterns(user?.id, params),
    queryFn: () => fetchPatternAnalytics(params),
    enabled: Boolean(user) && enabled,
    staleTime: 30_000,
  })
}
