import { useQuery } from '@tanstack/react-query'
import { fetchMealSummary, fetchMeals, type MealListFilters } from '../api/meals'
import { getLocalDateTimeBounds } from '../lib/date'
import { useAuth } from '../context/AuthContext'

export const mealQueryKeys = {
  all: ['meals'] as const,
  list: (userId: string | undefined, filters: MealListFilters) => ['meals', userId, 'list', filters] as const,
  summary: (userId: string | undefined, dates: { date?: string; startDate?: string; endDate?: string }) => ['meals', userId, 'summary', dates] as const,
}

export function useMealList(filters: MealListFilters) {
  const { user } = useAuth()
  return useQuery({
    queryKey: mealQueryKeys.list(user?.id, filters),
    queryFn: () => fetchMeals(filters),
    enabled: Boolean(user),
    staleTime: 15_000,
  })
}

export function useMealSummaryForDate(dateKey: string) {
  const { user } = useAuth()
  const bounds = getLocalDateTimeBounds(dateKey)
  return useQuery({
    queryKey: mealQueryKeys.summary(user?.id, bounds),
    queryFn: () => fetchMealSummary(bounds),
    enabled: Boolean(user),
    staleTime: 15_000,
  })
}
