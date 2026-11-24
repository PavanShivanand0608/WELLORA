import apiClient from './client'
import type { ApplicationPreferences, FoodPreferences, FoodStyle, UserSettings } from '../types/settings'

interface SettingsApiResponse {
  profile: {
    fullName: string
    email: string
    age?: number | null
    gender?: string | null
    heightCm?: number | null
    weightKg?: number | null
    activityLevel?: 'LOW' | 'MODERATE' | 'HIGH' | null
  }
  goals: {
    calories?: number | null
    proteinG?: number | null
    carbsG?: number | null
    fatG?: number | null
    fiberG?: number | null
    objectives?: string[]
  }
  foodPreferences: {
    foodStyle?: 'NOT_SET' | 'VEGETARIAN' | 'NON_VEGETARIAN' | 'VEGAN'
    allergies?: string[]
    dietaryPreferences?: string[]
    foodsToAvoid?: string[]
    favouriteCategories?: string[]
  }
  applicationPreferences: {
    notificationsEnabled?: boolean
    mealReminderEnabled?: boolean
    mealReminderTime?: string | null
    hydrationReminderEnabled?: boolean
    hydrationReminderTime?: string | null
    timezone?: string
    theme?: 'LIGHT'
  }
}

const styleFromApi: Record<NonNullable<SettingsApiResponse['foodPreferences']['foodStyle']>, FoodStyle> = {
  NOT_SET: 'Not set', VEGETARIAN: 'Vegetarian', NON_VEGETARIAN: 'Non-vegetarian', VEGAN: 'Vegan',
}
const styleToApi: Record<FoodStyle, NonNullable<SettingsApiResponse['foodPreferences']['foodStyle']>> = {
  'Not set': 'NOT_SET', Vegetarian: 'VEGETARIAN', 'Non-vegetarian': 'NON_VEGETARIAN', Vegan: 'VEGAN',
}

export function mapSettingsFromApi(source: SettingsApiResponse): UserSettings {
  const food = source.foodPreferences ?? {}
  const app = source.applicationPreferences ?? {}
  return {
    profile: {
      fullName: source.profile.fullName,
      email: source.profile.email,
      age: source.profile.age ?? null,
      gender: (source.profile.gender ?? '') as UserSettings['profile']['gender'],
      heightCm: source.profile.heightCm ?? null,
      weightKg: source.profile.weightKg ?? null,
      activityLevel: source.profile.activityLevel ?? null,
    },
    goals: {
      calories: source.goals?.calories ?? null,
      proteinG: source.goals?.proteinG ?? null,
      carbsG: source.goals?.carbsG ?? null,
      fatG: source.goals?.fatG ?? null,
      fiberG: source.goals?.fiberG ?? null,
      objectives: source.goals?.objectives ?? [],
    },
    foodPreferences: {
      foodStyle: styleFromApi[food.foodStyle ?? 'NOT_SET'],
      allergies: food.allergies ?? [],
      dietaryPreferences: food.dietaryPreferences ?? [],
      foodsToAvoid: food.foodsToAvoid ?? [],
      favouriteCategories: food.favouriteCategories ?? [],
    },
    applicationPreferences: {
      notificationsEnabled: app.notificationsEnabled ?? true,
      mealReminderEnabled: app.mealReminderEnabled ?? false,
      mealReminderTime: app.mealReminderTime ?? '',
      hydrationReminderEnabled: app.hydrationReminderEnabled ?? false,
      hydrationReminderTime: app.hydrationReminderTime ?? '',
      timezone: app.timezone ?? 'UTC',
      theme: 'light',
    },
  }
}

function toApiSettings(settings: UserSettings) {
  const { profile, goals, foodPreferences, applicationPreferences } = settings
  return {
    profile: {
      fullName: profile.fullName,
      age: profile.age,
      gender: profile.gender || null,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel ?? null,
    },
    goals,
    foodPreferences: {
      ...foodPreferences,
      foodStyle: styleToApi[foodPreferences.foodStyle],
    },
    applicationPreferences: {
      ...applicationPreferences,
      mealReminderTime: applicationPreferences.mealReminderTime || null,
      hydrationReminderTime: applicationPreferences.hydrationReminderTime || null,
      theme: 'LIGHT',
    },
  }
}

export async function fetchSettings(): Promise<UserSettings> {
  const { data } = await apiClient.get<{ settings: SettingsApiResponse }>('/settings')
  return mapSettingsFromApi(data.settings)
}

export async function updateSettings(settings: UserSettings): Promise<UserSettings> {
  const { data } = await apiClient.put<{ settings: SettingsApiResponse }>('/settings', toApiSettings(settings))
  return mapSettingsFromApi(data.settings)
}

export async function updateProfile(profile: UserSettings['profile']): Promise<UserSettings> {
  const { data } = await apiClient.put<{ settings: SettingsApiResponse }>('/profile', {
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender || null,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel ?? null,
  })
  return mapSettingsFromApi(data.settings)
}

export type { ApplicationPreferences, FoodPreferences }
