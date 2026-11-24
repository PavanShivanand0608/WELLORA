import mongoose from 'mongoose'
import type { RequestHandler } from 'express'
import { createMealForUser, deleteMealForUser, getMealForUser, listMealsForUser, replaceMealForUser } from '../services/mealService.js'
import { summarizeMealsForUser } from '../services/nutritionService.js'
import { AppError, ValidationAppError } from '../utils/AppError.js'
import { mealListQuerySchema, mealSummaryQuerySchema, type MealWriteInput } from '../validators/meal.js'

function getUserId(request: { auth?: { userId: string } }): string {
  if (!request.auth) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.')
  return request.auth.userId
}

function parseQuery<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } } }, query: unknown): T {
  const result = schema.safeParse(query)
  if (!result.success) throw new ValidationAppError(result.error.issues.map((issue) => ({ field: issue.path.map(String).join('.'), message: issue.message })))
  return result.data
}

function mealId(value: string): string {
  if (!mongoose.isValidObjectId(value)) throw new AppError(400, 'INVALID_MEAL_ID', 'Meal ID is invalid.')
  return value
}

export const createMealController: RequestHandler<{ id: string }, unknown, MealWriteInput> = async (request, response) => {
  const input = request.body
  const meal = await createMealForUser(getUserId(request), input)
  response.status(201).json({ meal })
}

export const listMealsController: RequestHandler = async (request, response) => {
  const filters = parseQuery(mealListQuerySchema, request.query)
  response.status(200).json(await listMealsForUser(getUserId(request), filters))
}

export const mealSummaryController: RequestHandler = async (request, response) => {
  const dates = parseQuery(mealSummaryQuerySchema, request.query)
  response.status(200).json({ summary: await summarizeMealsForUser(getUserId(request), dates) })
}

export const getMealController: RequestHandler<{ id: string }> = async (request, response) => {
  response.status(200).json({ meal: await getMealForUser(getUserId(request), mealId(request.params.id)) })
}

export const replaceMealController: RequestHandler<{ id: string }, unknown, MealWriteInput> = async (request, response) => {
  const input = request.body
  response.status(200).json({ meal: await replaceMealForUser(getUserId(request), mealId(request.params.id), input) })
}

export const deleteMealController: RequestHandler<{ id: string }> = async (request, response) => {
  await deleteMealForUser(getUserId(request), mealId(request.params.id))
  response.status(200).json({ message: 'Meal deleted.' })
}
