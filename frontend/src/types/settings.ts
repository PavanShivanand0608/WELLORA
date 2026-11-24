export type GenderOption = '' | 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say' | 'Self describe'
export type FoodStyle = 'Not set' | 'Vegetarian' | 'Non-vegetarian' | 'Vegan'
export type ThemePreference = 'light'

export interface UserProfile {
  fullName: string
  email: string
  age: number | null
  gender: GenderOption
  heightCm: number | null
  weightKg: number | null
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH' | null
}

export interface WellnessGoals {
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  fiberG?: number | null
  objectives: string[]
}

export interface FoodPreferences {
  foodStyle: FoodStyle
  allergies: string[]
  dietaryPreferences: string[]
  foodsToAvoid: string[]
  favouriteCategories: string[]
}

export interface ApplicationPreferences {
  notificationsEnabled: boolean
  mealReminderEnabled: boolean
  mealReminderTime: string
  hydrationReminderEnabled: boolean
  hydrationReminderTime: string
  timezone: string
  theme: ThemePreference
}

export interface UserSettings {
  profile: UserProfile
  goals: WellnessGoals
  foodPreferences: FoodPreferences
  applicationPreferences: ApplicationPreferences
}

export type SettingsFieldErrors = Partial<Record<
  | 'profile.fullName'
  | 'profile.email'
  | 'profile.age'
  | 'profile.heightCm'
  | 'profile.weightKg'
  | 'goals.calories'
  | 'goals.proteinG'
  | 'goals.carbsG'
  | 'goals.fatG'
  | 'applicationPreferences.mealReminderTime'
  | 'applicationPreferences.hydrationReminderTime'
  | 'applicationPreferences.timezone',
  string
>>
