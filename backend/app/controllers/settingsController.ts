import type { RequestHandler } from 'express'
import { getUserProfile, getUserSettings, updateUserProfile, updateUserSettings } from '../services/settingsService.js'
import { AppError } from '../utils/AppError.js'

function userId(request: { auth?: { userId: string } }) {
  if (!request.auth) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.')
  return request.auth.userId
}

export const getSettingsController: RequestHandler = async (request, response) => {
  response.status(200).json({ settings: await getUserSettings(userId(request)) })
}

export const updateSettingsController: RequestHandler = async (request, response) => {
  response.status(200).json({ settings: await updateUserSettings(userId(request), request.body) })
}

export const getProfileController: RequestHandler = async (request, response) => {
  response.status(200).json({ profile: await getUserProfile(userId(request)) })
}

export const updateProfileController: RequestHandler = async (request, response) => {
  const updated = await updateUserProfile(userId(request), request.body)
  response.status(200).json({ profile: await getUserProfile(userId(request)), settings: updated })
}
