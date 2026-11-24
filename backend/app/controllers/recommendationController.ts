import type { RequestHandler } from 'express'
import {
  getRecommendation,
  getRecommendations,
  getSavedRecommendations,
  isRecommendationId,
  saveRecommendation,
  unsaveRecommendation,
  updateRecommendationFeedback,
} from '../services/recommendationService.js'
import { AppError } from '../utils/AppError.js'

function getUserId(request: { auth?: { userId: string } }) {
  if (!request.auth) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.')
  return request.auth.userId
}

function getRecommendationId(id: string) {
  if (!isRecommendationId(id)) throw new AppError(400, 'INVALID_RECOMMENDATION_ID', 'Recommendation ID is invalid.')
  return id
}

function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export const recommendationsController: RequestHandler = async (request, response) => {
  response.status(200).json({ plan: await getRecommendations(getUserId(request)) })
}

export const recommendationController: RequestHandler = async (request, response) => {
  response.status(200).json({ recommendation: await getRecommendation(getUserId(request), getRecommendationId(routeId(request.params.id))) })
}

export const recommendationFeedbackController: RequestHandler = async (request, response) => {
  response.status(200).json({ recommendation: await updateRecommendationFeedback(getUserId(request), getRecommendationId(routeId(request.params.id)), request.body) })
}

export const savedRecommendationsController: RequestHandler = async (request, response) => {
  response.status(200).json({ recommendations: await getSavedRecommendations(getUserId(request)) })
}

export const saveRecommendationController: RequestHandler = async (request, response) => {
  response.status(200).json({ recommendation: await saveRecommendation(getUserId(request), getRecommendationId(routeId(request.params.id))) })
}

export const unsaveRecommendationController: RequestHandler = async (request, response) => {
  response.status(200).json(await unsaveRecommendation(getUserId(request), getRecommendationId(routeId(request.params.id))))
}
