import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import type { AppConfig } from '../config/env.js'
import {
  createCsrfController,
  createForgotPasswordController,
  createLoginController,
  createLogoutController,
  createRegisterController,
  createResetPasswordController,
  currentUserController,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireCsrf } from '../middleware/requireCsrf.js'
import { validateBody } from '../middleware/validateRequest.js'
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/auth.js'

function authRateLimit(config: AppConfig, limit: number) {
  return rateLimit({
    windowMs: config.authRateLimitWindowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (request, response) => {
      response.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many authentication requests. Please try again later.' },
        requestId: request.id,
      })
    },
  })
}

export function createAuthRouter(config: AppConfig): Router {
  const router = Router()
  const csrf = requireCsrf(config)
  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store')
    response.set('Pragma', 'no-cache')
    next()
  })
  router.get('/csrf', createCsrfController(config))
  router.post('/register', authRateLimit(config, config.authRegisterRateLimitMax), csrf, validateBody(registerSchema), createRegisterController(config))
  router.post('/login', authRateLimit(config, config.authLoginRateLimitMax), csrf, validateBody(loginSchema), createLoginController(config))
  router.post('/logout', csrf, createLogoutController(config))
  router.get('/me', requireAuth(config), currentUserController)
  router.post('/password/forgot', authRateLimit(config, config.authResetRateLimitMax), csrf, validateBody(forgotPasswordSchema), createForgotPasswordController(config))
  router.post('/password/reset', authRateLimit(config, config.authResetRateLimitMax), csrf, validateBody(resetPasswordSchema), createResetPasswordController(config))
  return router
}
