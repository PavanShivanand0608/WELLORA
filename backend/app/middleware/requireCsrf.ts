import type { RequestHandler } from 'express'
import type { AppConfig } from '../config/env.js'
import { csrfCookieName, csrfTokensMatch } from '../utils/authCookies.js'
import { AppError } from '../utils/AppError.js'

export function requireCsrf(config: Pick<AppConfig, 'frontendOrigin' | 'jwtSecret'>): RequestHandler {
  return (request, _response, next) => {
    const origin = request.get('origin')
    if (origin && origin !== config.frontendOrigin) {
      next(new AppError(403, 'CSRF_ORIGIN_DENIED', 'This origin is not allowed to submit this request.'))
      return
    }

    const cookieToken = request.cookies?.[csrfCookieName] as string | undefined
    const headerToken = request.get('x-csrf-token')
    if (!csrfTokensMatch(cookieToken, headerToken, config.jwtSecret)) {
      next(new AppError(403, 'CSRF_VALIDATION_FAILED', 'A valid CSRF token is required.'))
      return
    }
    next()
  }
}
