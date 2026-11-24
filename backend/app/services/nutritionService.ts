import mongoose, { type PipelineStage } from 'mongoose'
import { Meal, UserSettings } from '../models/index.js'
import { Nutrition } from '../models/Nutrition.js'

const nutritionFields = ['calories', 'proteinG', 'carbsG', 'fatG', 'fiberG', 'sugarG', 'sodiumMg'] as const
export type NutritionField = typeof nutritionFields[number]
export type NutritionValues = Partial<Record<NutritionField, number>>

export function pickNutritionValues(source: Record<string, unknown>): NutritionValues {
  const values: NutritionValues = {}
  for (const field of nutritionFields) {
    const value = source[field]
    if (typeof value === 'number' && Number.isFinite(value)) values[field] = value
  }
  return values
}

export async function replaceMealNutrition(userId: string, mealId: string, values: NutritionValues): Promise<void> {
  const unset = Object.fromEntries(nutritionFields.filter((field) => values[field] === undefined).map((field) => [field, 1]))
  await Nutrition.updateOne(
    { userId, mealId },
    { $set: values, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { upsert: true, runValidators: true },
  )
}

export async function getNutritionByMealIds(userId: string, mealIds: readonly unknown[]) {
  if (mealIds.length === 0) return new Map<string, NutritionValues>()
  const rows = await Nutrition.find()
    .where('userId').equals(new mongoose.Types.ObjectId(userId))
    .where('mealId').in([...mealIds])
    .lean()
  return new Map(rows.map((row) => [row.mealId.toString(), pickNutritionValues(row as unknown as Record<string, unknown>)]))
}

export interface NutritionAggregate {
  total: number | null
  average: number | null
  recordedCount: number
}

export interface MealNutritionSummary {
  mealCount: number
  regularMealCount: number
  unplannedMealCount: number
  calories: NutritionAggregate
  proteinG: NutritionAggregate
  carbsG: NutritionAggregate
  fatG: NutritionAggregate
  goals: {
    calories?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
  }
}

function dateMatch(date: string | undefined, startDate: string | undefined, endDate: string | undefined) {
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(start.getTime() + 86_400_000)
    return { $gte: start, $lt: end }
  }
  if (startDate && endDate) return { $gte: new Date(startDate), $lte: new Date(endDate) }
  return undefined
}

export async function summarizeMealsForUser(userId: string, dates: { date?: string; startDate?: string; endDate?: string }): Promise<MealNutritionSummary> {
  const loggedAt = dateMatch(dates.date, dates.startDate, dates.endDate)
  const match = { userId: new mongoose.Types.ObjectId(userId), ...(loggedAt ? { loggedAt } : {}) }
  const pipeline: PipelineStage[] = [
    { $match: match },
    { $lookup: {
      from: 'nutritions',
      let: { mealId: '$_id', ownerId: '$userId' },
      pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$mealId', '$$mealId'] }, { $eq: ['$userId', '$$ownerId'] }] } } }],
      as: 'nutrition',
    } },
    { $unwind: { path: '$nutrition', preserveNullAndEmptyArrays: true } },
    { $group: {
      _id: null,
      mealCount: { $sum: 1 },
      regularMealCount: { $sum: { $cond: [{ $eq: ['$logType', 'REGULAR'] }, 1, 0] } },
      unplannedMealCount: { $sum: { $cond: [{ $eq: ['$logType', 'UNPLANNED'] }, 1, 0] } },
      caloriesTotal: { $sum: '$nutrition.calories' }, caloriesAvg: { $avg: '$nutrition.calories' }, caloriesCount: { $sum: { $cond: [{ $isNumber: '$nutrition.calories' }, 1, 0] } },
      proteinTotal: { $sum: '$nutrition.proteinG' }, proteinAvg: { $avg: '$nutrition.proteinG' }, proteinCount: { $sum: { $cond: [{ $isNumber: '$nutrition.proteinG' }, 1, 0] } },
      carbsTotal: { $sum: '$nutrition.carbsG' }, carbsAvg: { $avg: '$nutrition.carbsG' }, carbsCount: { $sum: { $cond: [{ $isNumber: '$nutrition.carbsG' }, 1, 0] } },
      fatTotal: { $sum: '$nutrition.fatG' }, fatAvg: { $avg: '$nutrition.fatG' }, fatCount: { $sum: { $cond: [{ $isNumber: '$nutrition.fatG' }, 1, 0] } },
    } },
  ]
  const [aggregate] = await Meal.aggregate(pipeline)
  const settings = await UserSettings.findOne({ userId }).select('goals').lean()
  const numericAggregate = (total: unknown, average: unknown, recordedCount: unknown): NutritionAggregate => ({
    total: typeof total === 'number' && Number(recordedCount) > 0 ? total : null,
    average: typeof average === 'number' ? average : null,
    recordedCount: typeof recordedCount === 'number' ? recordedCount : 0,
  })
  const item = (total: string, average: string, count: string) => numericAggregate(aggregate?.[total], aggregate?.[average], aggregate?.[count])
  const goals: MealNutritionSummary['goals'] = {}
  if (settings?.goals?.calories != null) goals.calories = settings.goals.calories
  if (settings?.goals?.proteinG != null) goals.proteinG = settings.goals.proteinG
  if (settings?.goals?.carbsG != null) goals.carbsG = settings.goals.carbsG
  if (settings?.goals?.fatG != null) goals.fatG = settings.goals.fatG
  return {
    mealCount: typeof aggregate?.mealCount === 'number' ? aggregate.mealCount : 0,
    regularMealCount: typeof aggregate?.regularMealCount === 'number' ? aggregate.regularMealCount : 0,
    unplannedMealCount: typeof aggregate?.unplannedMealCount === 'number' ? aggregate.unplannedMealCount : 0,
    calories: item('caloriesTotal', 'caloriesAvg', 'caloriesCount'),
    proteinG: item('proteinTotal', 'proteinAvg', 'proteinCount'),
    carbsG: item('carbsTotal', 'carbsAvg', 'carbsCount'),
    fatG: item('fatTotal', 'fatAvg', 'fatCount'),
    goals,
  }
}
