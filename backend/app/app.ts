import cors from 'cors'
import cookieParser from 'cookie-parser'
import express, { type Express } from 'express'
import helmet from 'helmet'
import type { AppConfig } from './config/env.js'
import { requestLogger } from './config/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFound.js'
import { createHealthRouter } from './routers/healthRouter.js'
import { createAuthRouter } from './routers/authRouter.js'
import { AppError } from './utils/AppError.js'
import { createMealRouter } from './routers/mealRouter.js'
import { createAnalyticsRouter } from './routers/analyticsRouter.js'
import { createSettingsRouter } from './routers/settingsRouter.js'
import { createRecommendationRouter } from './routers/recommendationRouter.js'

export function createApp(config: AppConfig): Express {
  const app = express()
  app.locals.config = config
  app.disable('x-powered-by')
  app.use(requestLogger)
  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === config.frontendOrigin) {
        callback(null, true)
        return
      }
      callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'This origin is not allowed to access the API.'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id'],
    maxAge: 600,
  }))
  app.use(cookieParser())
  app.use(express.json({ limit: '100kb', strict: true }))
  app.use('/api/health', createHealthRouter(config))
  app.use('/api/auth', createAuthRouter(config))
  app.use('/api/meals', createMealRouter(config))
  app.use('/api/analytics', createAnalyticsRouter(config))
  app.use('/api', createSettingsRouter(config))
  app.use('/api/recommendations', createRecommendationRouter(config))
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
