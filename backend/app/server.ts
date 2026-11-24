import 'dotenv/config'
import { createApp } from './app.js'
import { loadConfig } from './config/env.js'
import { logger } from './config/logger.js'
import { connectToMongo, disconnectFromMongo } from './database/mongo.js'

async function main(): Promise<void> {
  const config = loadConfig()
  const app = createApp(config)
  const server = app.listen(config.port, config.host, () => {
    logger.info({ host: config.host, port: config.port, environment: config.appEnv }, 'WELLORA API listening')
  })

  void connectToMongo(config).then(() => {
    logger.info({ database: config.mongoDatabase }, 'MongoDB connection established')
  }).catch((error: unknown) => {
    logger.error({ errorName: error instanceof Error ? error.name : 'UnknownError' }, 'MongoDB connection failed; database health remains degraded')
  })

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Graceful shutdown started')
    server.close((error) => {
      void disconnectFromMongo().finally(() => {
        if (error) {
          logger.error({ errorName: error.name }, 'HTTP server shutdown failed')
          process.exitCode = 1
        }
      })
    })
  }
  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((error: unknown) => {
  logger.fatal({
    errorName: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : 'Unknown startup error',
  }, 'WELLORA API failed to start')
  process.exitCode = 1
})
