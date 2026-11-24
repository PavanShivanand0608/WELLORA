import apiClient from './client'

export type RecommendationCategory = 'Protein' | 'Fibre' | 'Fruit & veg' | 'Balanced meals' | 'Snack ideas' | 'Eating patterns'
export interface FoodRecommendation {
  id: string
  title: string
  foodIdea: string
  description: string
  whySuggested: string
  observedPattern: string
  prepIdea: string
  category: RecommendationCategory
  source: 'personalized' | 'general'
  feedback?: { helpful?: boolean; relevant?: boolean }
  saved: boolean
}
export interface RecommendationPlan {
  period: { days: number; startDate: string; endDate: string }
  mealCount: number
  personalized: FoodRecommendation[]
  general: FoodRecommendation[]
  nutritionCoverage: Array<{
    key: 'calories' | 'proteinG' | 'carbsG' | 'fatG'
    label: string
    unit: string
    recordedEntries: number
    mealCount: number
    averageKnown: number | null
  }>
  observations: Array<{ title: string; detail: string }>
  hasEnoughHistory: boolean
}

export async function fetchRecommendations(): Promise<RecommendationPlan> {
  const { data } = await apiClient.get<{ plan: RecommendationPlan }>('/recommendations')
  return data.plan
}

export async function fetchSavedRecommendations(): Promise<FoodRecommendation[]> {
  const { data } = await apiClient.get<{ recommendations: FoodRecommendation[] }>('/recommendations/saved')
  return data.recommendations
}

export async function submitRecommendationFeedback(id: string, feedback: { helpful: boolean; relevant: boolean }): Promise<FoodRecommendation> {
  const { data } = await apiClient.post<{ recommendation: FoodRecommendation }>(`/recommendations/${encodeURIComponent(id)}/feedback`, feedback)
  return data.recommendation
}

export async function saveRecommendation(id: string): Promise<FoodRecommendation> {
  const { data } = await apiClient.post<{ recommendation: FoodRecommendation }>(`/recommendations/${encodeURIComponent(id)}/save`)
  return data.recommendation
}

export async function unsaveRecommendation(id: string): Promise<void> {
  await apiClient.delete(`/recommendations/${encodeURIComponent(id)}/save`)
}
