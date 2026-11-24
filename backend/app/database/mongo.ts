import mongoose from 'mongoose'
import type { AppConfig } from '../config/env.js'

export async function connectToMongo(config: Pick<AppConfig, 'mongoUri' | 'mongoDatabase' | 'mongoServerSelectionTimeoutMs' | 'appEnv'>): Promise<void> {
  if (mongoose.connection.readyState === 1) return

  await mongoose.connect(config.mongoUri, {
    dbName: config.mongoDatabase,
    serverSelectionTimeoutMS: config.mongoServerSelectionTimeoutMs,
    autoIndex: config.appEnv !== 'production',
    bufferCommands: false,
  })
}

export async function disconnectFromMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1
}
