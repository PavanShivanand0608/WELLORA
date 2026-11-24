import { z } from 'zod'

const mealCategories = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const
const logTypes = ['REGULAR', 'UNPLANNED'] as const
const eatingCues = ['HUNGRY', 'CRAVING', 'OVERATE', 'JUST_BECAUSE'] as const
const eatingCueDetails = ['PHYSICAL_HUNGER', 'CRAVINGS', 'STRESS', 'BOREDOM', 'EMOTIONAL_EATING', 'SOCIAL_OCCASION', 'CONVENIENCE', 'OTHER'] as const
const nutritionNumber = z.number().finite().min(0)
const optionalText = (max: number) => z.string().trim().max(max).optional()
const isoDate = z.string().trim().min(1).refine((value) => Number.isFinite(Date.parse(value)), 'Must be a valid date and time.')

const mealFields = {
  foodName: z.string().trim().min(1).max(180),
  mealType: z.enum(mealCategories),
  logType: z.enum(logTypes),
  loggedAt: isoDate,
  quantity: z.number().finite().positive().max(100_000),
  servingUnit: z.string().trim().min(1).max(60),
  calories: nutritionNumber.optional(),
  proteinG: nutritionNumber.optional(),
  carbsG: nutritionNumber.optional(),
  fatG: nutritionNumber.optional(),
  fiberG: nutritionNumber.optional(),
  sugarG: nutritionNumber.optional(),
  sodiumMg: nutritionNumber.optional(),
  eatingCue: z.enum(eatingCues).optional(),
  eatingCueDetail: z.enum(eatingCueDetails).optional(),
  hungerLevel: z.number().int().min(1).max(5).optional(),
  moodBefore: optionalText(80),
  moodAfter: optionalText(80),
  notes: optionalText(2_000),
  context: optionalText(1_000),
}

export const createMealSchema = z.strictObject(mealFields).superRefine((meal, context) => {
  if (meal.logType === 'REGULAR' && (meal.eatingCue || meal.eatingCueDetail)) {
    context.addIssue({ code: 'custom', path: ['eatingCue'], message: 'Eating cues are only available for unplanned meals.' })
  }
})

// PUT is a replacement for the editable meal fields. Omitted optional nutrition
// values remain absent and are cleared on update; a supplied zero stays zero.
export const replaceMealSchema = z.strictObject(mealFields).superRefine((meal, context) => {
  if (meal.logType === 'REGULAR' && (meal.eatingCue || meal.eatingCueDetail)) {
    context.addIssue({ code: 'custom', path: ['eatingCue'], message: 'Eating cues are only available for unplanned meals.' })
  }
})

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}, 'Must be a valid YYYY-MM-DD date.')

export const mealListQuerySchema = z.strictObject({
  date: dateKey.optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  mealType: z.enum(mealCategories).optional(),
  eatingCue: z.enum(eatingCues).optional(),
  eatingCueDetail: z.enum(eatingCueDetails).optional(),
  logType: z.enum(logTypes).optional(),
  search: z.string().trim().max(180).optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['asc', 'desc']).default('desc'),
}).superRefine((query, context) => {
  if (query.date && (query.startDate || query.endDate)) {
    context.addIssue({ code: 'custom', path: ['date'], message: 'Use either date or a date range, not both.' })
  }
  if ((query.startDate && !query.endDate) || (!query.startDate && query.endDate)) {
    context.addIssue({ code: 'custom', path: ['startDate'], message: 'Provide both startDate and endDate.' })
  }
  if (query.startDate && query.endDate && Date.parse(query.startDate) > Date.parse(query.endDate)) {
    context.addIssue({ code: 'custom', path: ['startDate'], message: 'startDate must be before or equal to endDate.' })
  }
})

export const mealSummaryQuerySchema = z.strictObject({
  date: dateKey.optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
}).superRefine((query, context) => {
  if (query.date && (query.startDate || query.endDate)) {
    context.addIssue({ code: 'custom', path: ['date'], message: 'Use either date or a date range, not both.' })
  }
  if ((query.startDate && !query.endDate) || (!query.startDate && query.endDate)) {
    context.addIssue({ code: 'custom', path: ['startDate'], message: 'Provide both startDate and endDate.' })
  }
  if (query.startDate && query.endDate && Date.parse(query.startDate) > Date.parse(query.endDate)) {
    context.addIssue({ code: 'custom', path: ['startDate'], message: 'startDate must be before or equal to endDate.' })
  }
})

export type MealWriteInput = z.infer<typeof createMealSchema>
export type MealListQuery = z.infer<typeof mealListQuerySchema>
export type MealSummaryQuery = z.infer<typeof mealSummaryQuerySchema>
