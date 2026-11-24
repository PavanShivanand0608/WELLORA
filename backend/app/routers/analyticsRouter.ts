import { Router } from 'express'
import type { AppConfig } from '../config/env.js'
import { dashboardAnalyticsController, nutritionTrendsController, patternsAnalyticsController } from '../controllers/analyticsController.js'
import { requireAuth } from '../middleware/requireAuth.js'

export function createAnalyticsRouter(config: AppConfig) {
  const router = Router()
  router.use(requireAuth(config))
  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store')
    next()
  })
  router.get('/dashboard', dashboardAnalyticsController)
  router.get('/trends', nutritionTrendsController)
  router.get('/patterns', patternsAnalyticsController)
  return router
}
