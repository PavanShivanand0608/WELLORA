import { Router } from 'express'
import type { AppConfig } from '../config/env.js'
import { createMealController, deleteMealController, getMealController, listMealsController, mealSummaryController, replaceMealController } from '../controllers/mealController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireCsrf } from '../middleware/requireCsrf.js'
import { validateBody } from '../middleware/validateRequest.js'
import { createMealSchema, replaceMealSchema } from '../validators/meal.js'

export function createMealRouter(config: AppConfig): Router {
  const router = Router()
  router.use(requireAuth(config))
  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store')
    next()
  })
  router.get('/summary', mealSummaryController)
  router.get('/', listMealsController)
  router.post('/', requireCsrf(config), validateBody(createMealSchema), createMealController)
  router.get('/:id', getMealController)
  router.put('/:id', requireCsrf(config), validateBody(replaceMealSchema), replaceMealController)
  router.delete('/:id', requireCsrf(config), deleteMealController)
  return router
}
