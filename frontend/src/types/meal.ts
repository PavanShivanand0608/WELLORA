import type { FoodArtVariant } from '../components/FoodArt'

export type MealCategory = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
export type MealLogKind = 'REGULAR' | 'UNPLANNED'
/** Values accepted by the existing meal_logs.eating_cue data contract. */
export type EatingCue = 'HUNGRY' | 'CRAVING' | 'OVERATE' | 'JUST_BECAUSE'
/** More specific UI selection retained for future pattern analysis. */
export type EatingCueDetail =
  | 'PHYSICAL_HUNGER'
  | 'CRAVINGS'
  | 'STRESS'
  | 'BOREDOM'
  | 'EMOTIONAL_EATING'
  | 'SOCIAL_OCCASION'
  | 'CONVENIENCE'
  | 'OTHER'
export type HungerLevel = 1 | 2 | 3 | 4 | 5

export interface MealEntry {
  mealId: string
  foodName: string
  mealType: MealCategory
  logType: MealLogKind
  loggedAt: string
  quantity: number
  servingUnit: string
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  notes?: string
  foodArt: FoodArtVariant
  eatingCue?: EatingCue
  eatingCueDetail?: EatingCueDetail
  hungerLevel?: HungerLevel
  moodBefore?: string
  moodAfter?: string
  context?: string
}

export interface MealFormValues {
  foodName: string
  mealType: MealCategory | ''
  date: string
  time: string
  quantity: string
  servingUnit: string
  calories: string
  proteinG: string
  carbsG: string
  fatG: string
  notes: string
}

export type MealFormErrors = Partial<Record<keyof MealFormValues, string>>

export interface MealNutritionGoals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}
