import type { RequestHandler } from 'express'
import type { z } from 'zod'
import { getDashboardAnalytics, getNutritionTrends, getPatternsAnalytics } from '../services/analyticsService.js'
import { AppError, ValidationAppError } from '../utils/AppError.js'
import { dashboardAnalyticsQuerySchema, nutritionTrendsQuerySchema, patternsAnalyticsQuerySchema } from '../validators/analytics.js'

function getUserId(request: { auth?: { userId: string } }): string {
  if (!request.auth) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.')
  return request.auth.userId
}

function parseQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  const result = schema.safeParse(query)
  if (!result.success) throw new ValidationAppError(result.error.issues.map((issue) => ({ field: issue.path.map(String).join('.'), message: issue.message })))
  return result.data
}

export const dashboardAnalyticsController: RequestHandler = async (request, response) => {
  const query = parseQuery(dashboardAnalyticsQuerySchema, request.query)
  const result = await getDashboardAnalytics(getUserId(request), query.date, query.timezone)
  response.status(200).json(result)
}

export const nutritionTrendsController: RequestHandler = async (request, response) => {
  const query = parseQuery(nutritionTrendsQuerySchema, request.query)
  response.status(200).json(await getNutritionTrends(getUserId(request), query))
}

export const patternsAnalyticsController: RequestHandler = async (request, response) => {
  const query = parseQuery(patternsAnalyticsQuerySchema, request.query)
  response.status(200).json(await getPatternsAnalytics(getUserId(request), query))
}
