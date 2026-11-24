import apiClient from './client'
import type { EatingCue, EatingCueDetail, HungerLevel, MealCategory, MealEntry, MealLogKind } from '../types/meal'

export interface MealApiRecord {
  id: string
  foodName: string
  mealType: MealCategory
  logType: MealLogKind
  loggedAt: string
  quantity: number
  servingUnit: string
  eatingCue?: EatingCue
  eatingCueDetail?: EatingCueDetail
  hungerLevel?: HungerLevel
  moodBefore?: string
  moodAfter?: string
  notes?: string
  context?: string
  nutrition: {
    calories?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
    fiberG?: number
    sugarG?: number
    sodiumMg?: number
  }
  createdAt: string
  updatedAt: string
}

export interface MealListFilters {
  date?: string
  startDate?: string
  endDate?: string
  mealType?: MealCategory
  eatingCue?: EatingCue
  eatingCueDetail?: EatingCueDetail
  logType?: MealLogKind
  search?: string
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
}

export interface MealListResponse {
  meals: MealEntry[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface NutritionAggregate {
  total: number | null
  average: number | null
  recordedCount: number
}

export interface MealNutritionSummary {
  mealCount: number
  calories: NutritionAggregate
  proteinG: NutritionAggregate
  carbsG: NutritionAggregate
  fatG: NutritionAggregate
  goals: { calories?: number; proteinG?: number; carbsG?: number; fatG?: number }
}

export type MealWritePayload = Omit<MealEntry, 'mealId' | 'foodArt'> & {
  fiberG?: number
  sugarG?: number
  sodiumMg?: number
}

export function mapApiMeal(meal: MealApiRecord): MealEntry {
  return {
    mealId: meal.id,
    foodName: meal.foodName,
    mealType: meal.mealType,
    logType: meal.logType,
    loggedAt: meal.loggedAt,
    quantity: meal.quantity,
    servingUnit: meal.servingUnit,
    ...(meal.nutrition.calories !== undefined ? { calories: meal.nutrition.calories } : {}),
    ...(meal.nutrition.proteinG !== undefined ? { proteinG: meal.nutrition.proteinG } : {}),
    ...(meal.nutrition.carbsG !== undefined ? { carbsG: meal.nutrition.carbsG } : {}),
    ...(meal.nutrition.fatG !== undefined ? { fatG: meal.nutrition.fatG } : {}),
    ...(meal.eatingCue ? { eatingCue: meal.eatingCue } : {}),
    ...(meal.eatingCueDetail ? { eatingCueDetail: meal.eatingCueDetail } : {}),
    ...(meal.hungerLevel !== undefined ? { hungerLevel: meal.hungerLevel } : {}),
    ...(meal.moodBefore ? { moodBefore: meal.moodBefore } : {}),
    ...(meal.moodAfter ? { moodAfter: meal.moodAfter } : {}),
    ...(meal.notes ? { notes: meal.notes } : {}),
    ...(meal.context ? { context: meal.context } : {}),
    foodArt: 'bowl',
  }
}

function toApiPayload(meal: Omit<MealEntry, 'mealId' | 'foodArt'>): Omit<MealWritePayload, 'loggedAt'> & { loggedAt: string } {
  const { loggedAt, ...rest } = meal
  return { ...rest, loggedAt: new Date(loggedAt).toISOString() }
}

export async function fetchMeals(filters: MealListFilters = {}): Promise<MealListResponse> {
  const { data } = await apiClient.get<{ meals: MealApiRecord[]; pagination: MealListResponse['pagination'] }>('/meals', { params: filters })
  return { meals: data.meals.map(mapApiMeal), pagination: data.pagination }
}

export async function fetchMeal(mealId: string): Promise<MealEntry> {
  const { data } = await apiClient.get<{ meal: MealApiRecord }>(`/meals/${encodeURIComponent(mealId)}`)
  return mapApiMeal(data.meal)
}

export async function createMeal(meal: Omit<MealEntry, 'mealId' | 'foodArt'>): Promise<MealEntry> {
  const { data } = await apiClient.post<{ meal: MealApiRecord }>('/meals', toApiPayload(meal))
  return mapApiMeal(data.meal)
}

export async function updateMeal(meal: MealEntry): Promise<MealEntry> {
  const { mealId, foodArt: _foodArt, ...payload } = meal
  const { data } = await apiClient.put<{ meal: MealApiRecord }>(`/meals/${encodeURIComponent(mealId)}`, toApiPayload(payload))
  return mapApiMeal(data.meal)
}

export async function deleteMeal(mealId: string): Promise<void> {
  await apiClient.delete(`/meals/${encodeURIComponent(mealId)}`)
}

export async function fetchMealSummary(dates: { date?: string; startDate?: string; endDate?: string }): Promise<MealNutritionSummary> {
  const { data } = await apiClient.get<{ summary: MealNutritionSummary }>('/meals/summary', { params: dates })
  return data.summary
}
