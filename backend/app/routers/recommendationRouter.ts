import { Router } from 'express'
import type { AppConfig } from '../config/env.js'
import {
  recommendationController,
  recommendationFeedbackController,
  recommendationsController,
  saveRecommendationController,
  savedRecommendationsController,
  unsaveRecommendationController,
} from '../controllers/recommendationController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireCsrf } from '../middleware/requireCsrf.js'
import { validateBody } from '../middleware/validateRequest.js'
import { recommendationFeedbackSchema } from '../validators/settings.js'

export function createRecommendationRouter(config: AppConfig) {
  const router = Router()
  router.use((_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  const auth = requireAuth(config)
  const csrf = requireCsrf(config)
  router.get('/saved', auth, savedRecommendationsController)
  router.get('/', auth, recommendationsController)
  router.get('/:id', auth, recommendationController)
  router.post('/:id/feedback', auth, csrf, validateBody(recommendationFeedbackSchema), recommendationFeedbackController)
  router.post('/:id/save', auth, csrf, saveRecommendationController)
  router.delete('/:id/save', auth, csrf, unsaveRecommendationController)
  return router
}
