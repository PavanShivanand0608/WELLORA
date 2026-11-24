import mongoose from 'mongoose'
import { Meal, Nutrition } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { getNutritionByMealIds, pickNutritionValues, replaceMealNutrition, type NutritionValues } from './nutritionService.js'
import type { MealListQuery, MealWriteInput } from '../validators/meal.js'

const nutritionFieldNames = ['calories', 'proteinG', 'carbsG', 'fatG', 'fiberG', 'sugarG', 'sodiumMg'] as const
const mealFieldNames = ['foodName', 'mealType', 'logType', 'loggedAt', 'quantity', 'servingUnit', 'eatingCue', 'eatingCueDetail', 'hungerLevel', 'moodBefore', 'moodAfter', 'notes', 'context'] as const

function escapedRegex(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

function dateBounds(query: MealListQuery) {
  if (query.date) {
    const start = new Date(`${query.date}T00:00:00.000Z`)
    return { $gte: start, $lt: new Date(start.getTime() + 86_400_000) }
  }
  if (query.startDate && query.endDate) return { $gte: new Date(query.startDate), $lte: new Date(query.endDate) }
  return undefined
}

function mealQuery(userId: string, filters: MealListQuery) {
  const loggedAt = dateBounds(filters)
  const query: Record<string, unknown> = { userId }
  if (loggedAt) query.loggedAt = loggedAt
  if (filters.mealType) query.mealType = filters.mealType
  if (filters.logType) query.logType = filters.logType
  if (filters.eatingCueDetail) query.eatingCueDetail = filters.eatingCueDetail
  if (filters.eatingCue) query.eatingCue = filters.eatingCue
  if (filters.search) query.foodName = escapedRegex(filters.search)
  return query
}

export interface MealApiRecord {
  id: string
  foodName: string
  mealType: string
  logType: string
  loggedAt: string
  quantity: number
  servingUnit: string
  eatingCue?: string
  eatingCueDetail?: string
  hungerLevel?: number
  moodBefore?: string
  moodAfter?: string
  notes?: string
  context?: string
  nutrition: NutritionValues
  createdAt: string
  updatedAt: string
}

async function serializeMeals(meals: Array<InstanceType<typeof Meal>>): Promise<MealApiRecord[]> {
  const nutritionMap = await getNutritionByMealIds(meals[0]?.userId.toString() ?? '', meals.map((meal) => meal._id))
  return meals.map((meal) => {
    const record = meal.toObject()
    const nutrition = nutritionMap.get(meal._id.toString()) ?? {}
    return {
      id: meal._id.toString(),
      foodName: record.foodName,
      mealType: record.mealType,
      logType: record.logType,
      loggedAt: record.loggedAt.toISOString(),
      quantity: record.quantity,
      servingUnit: record.servingUnit,
      ...(record.eatingCue ? { eatingCue: record.eatingCue } : {}),
      ...(record.eatingCueDetail ? { eatingCueDetail: record.eatingCueDetail } : {}),
      ...(record.hungerLevel != null ? { hungerLevel: record.hungerLevel } : {}),
      ...(record.moodBefore ? { moodBefore: record.moodBefore } : {}),
      ...(record.moodAfter ? { moodAfter: record.moodAfter } : {}),
      ...(record.notes ? { notes: record.notes } : {}),
      ...(record.context ? { context: record.context } : {}),
      nutrition,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  })
}

function toMealWriteRecord(input: MealWriteInput) {
  const { calories: _calories, proteinG: _proteinG, carbsG: _carbsG, fatG: _fatG, fiberG: _fiberG, sugarG: _sugarG, sodiumMg: _sodiumMg, ...mealFields } = input
  return { ...mealFields, loggedAt: new Date(input.loggedAt) }
}

function toNutrition(input: MealWriteInput): NutritionValues {
  return pickNutritionValues(input as unknown as Record<string, unknown>)
}

export async function createMealForUser(userId: string, input: MealWriteInput): Promise<MealApiRecord> {
  const meal = await Meal.create({ userId, ...toMealWriteRecord(input) })
  try {
    await Nutrition.create({ userId, mealId: meal._id, ...toNutrition(input) })
  } catch (error) {
    await Meal.deleteOne({ _id: meal._id, userId })
    throw error
  }
  return (await serializeMeals([meal]))[0]!
}

export async function listMealsForUser(userId: string, filters: MealListQuery) {
  const filter = mealQuery(userId, filters)
  const sort = filters.sort === 'asc' ? 1 : -1
  const skip = (filters.page - 1) * filters.limit
  const [meals, total] = await Promise.all([
    Meal.find(filter).sort({ loggedAt: sort, _id: sort }).skip(skip).limit(filters.limit),
    Meal.countDocuments(filter),
  ])
  return {
    meals: await serializeMeals(meals),
    pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  }
}

export async function getMealForUser(userId: string, id: string): Promise<MealApiRecord> {
  const meal = await Meal.findOne({ _id: id, userId })
  if (!meal) throw new AppError(404, 'MEAL_NOT_FOUND', 'Meal not found.')
  return (await serializeMeals([meal]))[0]!
}

export async function replaceMealForUser(userId: string, id: string, input: MealWriteInput): Promise<MealApiRecord> {
  const meal = await Meal.findOne({ _id: id, userId })
  if (!meal) throw new AppError(404, 'MEAL_NOT_FOUND', 'Meal not found.')
  const oldMeal = meal.toObject()
  const oldNutrition = await Nutrition.findOne({ userId, mealId: meal._id }).lean()

  for (const field of mealFieldNames) {
    const value = input[field]
    meal.set(field, field === 'loggedAt' ? new Date(input.loggedAt) : value)
  }
  await meal.save()
  try {
    await replaceMealNutrition(userId, id, toNutrition(input))
  } catch (error) {
    try {
      await Meal.replaceOne({ _id: id, userId }, oldMeal)
      if (oldNutrition) await replaceMealNutrition(userId, id, pickNutritionValues(oldNutrition as unknown as Record<string, unknown>))
      else await Nutrition.deleteOne({ userId, mealId: id })
    } catch {
      // Preserve the original persistence error; the scoped compensation is best effort.
    }
    throw error
  }
  return (await serializeMeals([meal]))[0]!
}

export async function deleteMealForUser(userId: string, id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'INVALID_MEAL_ID', 'Meal ID is invalid.')
  const meal = await Meal.findOneAndDelete({ _id: id, userId })
  if (!meal) throw new AppError(404, 'MEAL_NOT_FOUND', 'Meal not found.')
  await Nutrition.deleteOne({ userId, mealId: meal._id })
}
