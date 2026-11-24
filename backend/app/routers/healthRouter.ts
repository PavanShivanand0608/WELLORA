import { Router } from 'express'
import { createHealthController, databaseHealthController } from '../controllers/healthController.js'
import type { AppConfig } from '../config/env.js'

export function createHealthRouter(config: Pick<AppConfig, 'appEnv'>): Router {
  const router = Router()
  router.get('/', createHealthController(config))
  router.get('/db', databaseHealthController)
  return router
}
