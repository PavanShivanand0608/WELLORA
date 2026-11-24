import { Router } from 'express'
import type { AppConfig } from '../config/env.js'
import { getProfileController, getSettingsController, updateProfileController, updateSettingsController } from '../controllers/settingsController.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireCsrf } from '../middleware/requireCsrf.js'
import { validateBody } from '../middleware/validateRequest.js'
import { updateProfileSchema, updateSettingsSchema } from '../validators/settings.js'

export function createSettingsRouter(config: AppConfig) {
  const router = Router()
  router.use((_request, response, next) => { response.set('Cache-Control', 'no-store'); next() })
  const auth = requireAuth(config)
  router.get('/settings', auth, getSettingsController)
  router.put('/settings', auth, requireCsrf(config), validateBody(updateSettingsSchema), updateSettingsController)
  router.get('/profile', auth, getProfileController)
  router.put('/profile', auth, requireCsrf(config), validateBody(updateProfileSchema), updateProfileController)
  return router
}
