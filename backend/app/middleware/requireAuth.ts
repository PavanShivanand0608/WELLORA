import type { RequestHandler } from 'express'
import type { AppConfig } from '../config/env.js'
import { verifyAccessToken } from '../services/tokenService.js'
import { AppError } from '../utils/AppError.js'
import { authCookieName } from '../utils/authCookies.js'

type TokenConfig = Pick<AppConfig, 'jwtSecret' | 'jwtAlgorithm' | 'jwtAccessTokenExpireMinutes'>

export function requireAuth(config: TokenConfig): RequestHandler {
  return (request, _response, next) => {
    const token = request.cookies?.[authCookieName] as string | undefined
    if (!token) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.'))
      return
    }

    try {
      request.auth = verifyAccessToken(token, config)
      next()
    } catch (error) {
      next(error)
    }
  }
}

/** Protects future routes such as /users/:userId by requiring the token subject to match. */
export const authorizeSelf: RequestHandler = (request, _response, next) => {
  if (!request.auth) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.'))
    return
  }
  if (request.params.userId && request.params.userId !== request.auth.userId) {
    next(new AppError(403, 'FORBIDDEN', 'You cannot access another user’s data.'))
    return
  }
  next()
}
