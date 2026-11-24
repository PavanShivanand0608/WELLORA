import { z } from 'zod'

const optionalProfileNumber = (min: number, max: number) => z.number().finite().min(min).max(max).nullable().optional()
const optionalGoal = (max: number) => z.number().finite().min(1).max(max).nullable().optional()
const stringList = z.array(z.string().trim().min(1).max(100)).max(40)

export const profileSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(120).optional(),
  age: optionalProfileNumber(1, 120),
  gender: z.string().trim().max(80).nullable().optional(),
  heightCm: optionalProfileNumber(50, 250),
  weightKg: optionalProfileNumber(1, 500),
  activityLevel: z.enum(['LOW', 'MODERATE', 'HIGH']).nullable().optional(),
})

const goalsSchema = z.strictObject({
  calories: optionalGoal(100_000),
  proteinG: optionalGoal(10_000),
  carbsG: optionalGoal(10_000),
  fatG: optionalGoal(10_000),
  fiberG: optionalGoal(10_000),
  objectives: stringList.optional(),
}).partial()

const foodPreferencesSchema = z.strictObject({
  foodStyle: z.enum(['NOT_SET', 'VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN']).optional(),
  allergies: stringList.optional(),
  dietaryPreferences: stringList.optional(),
  foodsToAvoid: stringList.optional(),
  favouriteCategories: stringList.optional(),
}).partial()

function validTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

const applicationPreferencesSchema = z.strictObject({
  notificationsEnabled: z.boolean().optional(),
  mealReminderEnabled: z.boolean().optional(),
  mealReminderTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  hydrationReminderEnabled: z.boolean().optional(),
  hydrationReminderTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  timezone: z.string().trim().min(1).max(80).refine(validTimezone, 'Enter a valid IANA time zone.').optional(),
  theme: z.enum(['LIGHT']).optional(),
}).partial()

export const updateSettingsSchema = z.strictObject({
  profile: profileSchema.optional(),
  goals: goalsSchema.optional(),
  foodPreferences: foodPreferencesSchema.optional(),
  applicationPreferences: applicationPreferencesSchema.optional(),
})

export const updateProfileSchema = profileSchema
export const recommendationFeedbackSchema = z.strictObject({
  helpful: z.boolean().optional(),
  relevant: z.boolean().optional(),
}).refine((value) => value.helpful !== undefined || value.relevant !== undefined, 'Provide a feedback value.')

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type RecommendationFeedbackInput = z.infer<typeof recommendationFeedbackSchema>
