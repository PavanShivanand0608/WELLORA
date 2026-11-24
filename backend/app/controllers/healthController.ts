import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
import type { AppConfig } from '../config/env.js'

export function createHealthController(config: Pick<AppConfig, 'appEnv'>): RequestHandler {
  return (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'wellora-api',
      environment: config.appEnv,
      timestamp: new Date().toISOString(),
    })
  }
}

export const databaseHealthController: RequestHandler = async (request, response) => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    response.status(503).json({
      status: 'degraded',
      dependencies: { mongodb: 'disconnected' },
      timestamp: new Date().toISOString(),
    })
    return
  }

  try {
    await mongoose.connection.db.admin().ping()
    response.status(200).json({
      status: 'ok',
      dependencies: { mongodb: 'connected' },
      timestamp: new Date().toISOString(),
    })
  } catch {
    request.log.warn({ requestId: request.id }, 'MongoDB health probe failed')
    response.status(503).json({
      status: 'degraded',
      dependencies: { mongodb: 'unavailable' },
      timestamp: new Date().toISOString(),
    })
  }
}
