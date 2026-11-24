import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMeal as createMealRequest, deleteMeal as deleteMealRequest, fetchMeals, updateMeal as updateMealRequest } from '../api/meals'
import { getLocalDateTimeBounds, getLocalDateKey, shiftDateKey } from '../lib/date'
import type { MealEntry } from '../types/meal'
import { mealQueryKeys } from '../hooks/useMeals'
import { analyticsQueryKeys } from '../hooks/useAnalytics'
import { recommendationQueryKeys } from '../hooks/useRecommendations'
import { useAuth } from './AuthContext'

export type NewMealEntry = Omit<MealEntry, 'mealId'>

interface MealDataContextValue {
  meals: MealEntry[]
  isLoading: boolean
  error: Error | null
  addMeal: (meal: NewMealEntry) => Promise<MealEntry>
  updateMeal: (meal: MealEntry) => Promise<MealEntry>
  removeMeal: (mealId: string) => Promise<void>
}

const MealDataContext = createContext<MealDataContextValue | null>(null)

function recentMealRange() {
  const start = getLocalDateTimeBounds(shiftDateKey(getLocalDateKey(), -89)).startDate
  return { startDate: start, endDate: new Date().toISOString(), page: 1, limit: 100, sort: 'desc' as const }
}

export function MealDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const recentFilters = useMemo(recentMealRange, [])
  const listQuery = useQuery({
    queryKey: mealQueryKeys.list(user?.id, recentFilters),
    queryFn: () => fetchMeals(recentFilters),
    enabled: Boolean(user),
    staleTime: 15_000,
  })
  const invalidateMealQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: recommendationQueryKeys.all }),
    ])
  }, [queryClient])
  const createMutation = useMutation({
    mutationFn: createMealRequest,
    onSuccess: invalidateMealQueries,
  })
  const updateMutation = useMutation({
    mutationFn: updateMealRequest,
    onSuccess: invalidateMealQueries,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteMealRequest,
    onSuccess: invalidateMealQueries,
  })

  const addMeal = useCallback(async (meal: NewMealEntry) => {
    const { foodArt: _foodArt, ...payload } = meal
    return createMutation.mutateAsync(payload)
  }, [createMutation])
  const updateMeal = useCallback((meal: MealEntry) => updateMutation.mutateAsync(meal), [updateMutation])
  const removeMeal = useCallback((mealId: string) => deleteMutation.mutateAsync(mealId), [deleteMutation])
  const value = useMemo(() => ({
    meals: listQuery.data?.meals ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error instanceof Error ? listQuery.error : null,
    addMeal,
    updateMeal,
    removeMeal,
  }), [listQuery.data?.meals, listQuery.error, listQuery.isLoading, addMeal, updateMeal, removeMeal])

  return <MealDataContext.Provider value={value}>{children}</MealDataContext.Provider>
}

export function useMealData() {
  const value = useContext(MealDataContext)
  if (!value) throw new Error('useMealData must be used within a MealDataProvider')
  return value
}
