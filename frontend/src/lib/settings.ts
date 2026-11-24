import type { SettingsFieldErrors, UserSettings } from '../types/settings'

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export function parseCommaSeparatedList(value: string): string[] {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]
}

export function validateUserSettings(settings: UserSettings): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {}
  const { profile, goals, applicationPreferences: preferences } = settings

  if (!profile.fullName.trim()) errors['profile.fullName'] = 'Enter your full name.'
  if (!profile.email.trim()) errors['profile.email'] = 'Enter your email address.'
  else if (!validEmail.test(profile.email.trim())) errors['profile.email'] = 'Enter a valid email address.'

  if (profile.age !== null && (!Number.isFinite(profile.age) || profile.age < 1 || profile.age > 120)) {
    errors['profile.age'] = 'Enter an age between 1 and 120.'
  }
  if (profile.heightCm !== null && (!Number.isFinite(profile.heightCm) || profile.heightCm < 50 || profile.heightCm > 250)) {
    errors['profile.heightCm'] = 'Enter a height between 50 and 250 cm.'
  }
  if (profile.weightKg !== null && (!Number.isFinite(profile.weightKg) || profile.weightKg < 1 || profile.weightKg > 500)) {
    errors['profile.weightKg'] = 'Enter a weight between 1 and 500 kg.'
  }

  const goalsToValidate: Array<{ key: keyof SettingsFieldErrors; value: number | null; label: string }> = [
    { key: 'goals.calories', value: goals.calories, label: 'Daily calorie goal' },
    { key: 'goals.proteinG', value: goals.proteinG, label: 'Protein goal' },
    { key: 'goals.carbsG', value: goals.carbsG, label: 'Carbohydrate goal' },
    { key: 'goals.fatG', value: goals.fatG, label: 'Fat goal' },
  ]
  for (const goal of goalsToValidate) {
    if (goal.value !== null && (!Number.isFinite(goal.value) || goal.value <= 0)) errors[goal.key] = `${goal.label} must be greater than zero.`
  }

  if (preferences.notificationsEnabled && preferences.mealReminderEnabled && !validTime.test(preferences.mealReminderTime)) {
    errors['applicationPreferences.mealReminderTime'] = 'Choose a valid meal reminder time.'
  }
  if (preferences.notificationsEnabled && preferences.hydrationReminderEnabled && !validTime.test(preferences.hydrationReminderTime)) {
    errors['applicationPreferences.hydrationReminderTime'] = 'Choose a valid hydration reminder time.'
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: preferences.timezone })
  } catch {
    errors['applicationPreferences.timezone'] = 'Enter a valid time zone, such as Asia/Kolkata.'
  }
  return errors
}
