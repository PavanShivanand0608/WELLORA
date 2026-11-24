import { mealNutritionGoals } from './meals'
import type { UserSettings } from '../../types/settings'

/** Clearly fictional values used only by the frontend demo. */
export const demoUserSettings: UserSettings = {
  profile: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.test',
    age: 29,
    gender: '',
    heightCm: 168,
    weightKg: 66,
  },
  goals: {
    ...mealNutritionGoals,
    objectives: ['Try more food variety', 'Plan easy meals ahead'],
  },
  foodPreferences: {
    foodStyle: 'Not set',
    allergies: [],
    dietaryPreferences: [],
    foodsToAvoid: [],
    favouriteCategories: [],
  },
  applicationPreferences: {
    notificationsEnabled: true,
    mealReminderEnabled: false,
    mealReminderTime: '12:00',
    hydrationReminderEnabled: false,
    hydrationReminderTime: '15:00',
    timezone: 'UTC',
    theme: 'light',
  },
}

export function copyUserSettings(settings: UserSettings): UserSettings {
  return {
    profile: { ...settings.profile },
    goals: { ...settings.goals, objectives: [...settings.goals.objectives] },
    foodPreferences: {
      ...settings.foodPreferences,
      allergies: [...settings.foodPreferences.allergies],
      dietaryPreferences: [...settings.foodPreferences.dietaryPreferences],
      foodsToAvoid: [...settings.foodPreferences.foodsToAvoid],
      favouriteCategories: [...settings.foodPreferences.favouriteCategories],
    },
    applicationPreferences: { ...settings.applicationPreferences },
  }
}
