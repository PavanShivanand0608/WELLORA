import type { MealEntry } from '../types/meal'

export interface MealNutritionTotals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

/** Sum only nutrition values present on a meal; absent values remain unknown. */
export function summarizeMeals(meals: readonly MealEntry[]): MealNutritionTotals {
  return meals.reduce<MealNutritionTotals>((totals, meal) => ({
    calories: totals.calories + (meal.calories ?? 0),
    proteinG: totals.proteinG + (meal.proteinG ?? 0),
    carbsG: totals.carbsG + (meal.carbsG ?? 0),
    fatG: totals.fatG + (meal.fatG ?? 0),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 })
}
