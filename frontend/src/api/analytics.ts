import apiClient from './client'
import { mapApiMeal, type MealApiRecord } from './meals'
import type { MealEntry } from '../types/meal'
import type { CountItem, DailyPatternPoint, PatternRange } from '../lib/patternAnalytics'
import type { MealNutritionSummary } from './meals'

export interface DashboardAnalytics {
  date: string
  timezone: string
  summary: MealNutritionSummary & {
    regularMealCount: number
    unplannedMealCount: number
    remaining: { calories: number | null; proteinG: number | null; carbsG: number | null; fatG: number | null }
  }
  meals: MealEntry[]
}

export interface NutritionTrendDay {
  date: string
  mealCount: number
  caloriesTotal: number | null
  proteinGTotal: number | null
  carbsGTotal: number | null
  fatGTotal: number | null
  recorded: { calories: number; proteinG: number; carbsG: number; fatG: number }
}

export interface NutritionTrends {
  period: { startDate: string; endDate: string; timezone: string; dayCount: number }
  goals: { calories?: number; proteinG?: number; carbsG?: number; fatG?: number }
  days: NutritionTrendDay[]
}

export interface PatternAnalyticsResponse {
  range: number
  startDate: string
  endDate: string
  previousStartDate: string
  previousEndDate: string
  timezone: string
  mealCount: number
  previousMealCount: number
  unplannedCount: number
  previousUnplannedCount: number
  cueTaggedCount: number
  previousCueTaggedCount: number
  hungerCount: number
  averageHunger: number | null
  mostCommonHunger: string | null
  dailyHungerRange: { first: number | null; last: number | null; change: number | null }
  cueDistribution: CountItem[]
  hungerDistribution: CountItem[]
  mealCategoryDistribution: CountItem[]
  unplannedCategoryDistribution: CountItem[]
  daypartDistribution: CountItem[]
  unplannedDaypartDistribution: CountItem[]
  commonHours: Array<{ hour: number; label: string; count: number }>
  moodBeforeDistribution: CountItem[]
  moodAfterDistribution: CountItem[]
  moodTransitionCount: number
  moodSameCount: number
  moodDifferentCount: number
  cueMoodAssociations: Array<{ cue: string; cueLabel: string; mood: string; count: number }>
  dailyTrend: DailyPatternPoint[]
}

export interface AnalyticsRangeParams {
  timezone: string
  range?: PatternRange
  startDate?: string
  endDate?: string
}

export async function fetchDashboardAnalytics(date: string, timezone: string): Promise<DashboardAnalytics> {
  const { data } = await apiClient.get<Omit<DashboardAnalytics, 'meals'> & { meals: MealApiRecord[] }>('/analytics/dashboard', { params: { date, timezone } })
  return { ...data, meals: data.meals.map(mapApiMeal) }
}

export async function fetchNutritionTrends(params: AnalyticsRangeParams): Promise<NutritionTrends> {
  const { data } = await apiClient.get<NutritionTrends>('/analytics/trends', { params })
  return data
}

export async function fetchPatternAnalytics(params: AnalyticsRangeParams): Promise<PatternAnalyticsResponse> {
  const { data } = await apiClient.get<PatternAnalyticsResponse>('/analytics/patterns', { params })
  return data
}
