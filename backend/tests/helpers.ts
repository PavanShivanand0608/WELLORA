import { randomUUID } from 'node:crypto'
import type { AppConfig } from '../app/config/env.js'

export const testConfig: AppConfig = {
  mongoUri: 'mongodb://127.0.0.1:27017',
  mongoDatabase: 'wellora_phase32_test',
  mongoServerSelectionTimeoutMs: 500,
  host: '127.0.0.1',
  port: 8000,
  appEnv: 'test',
  frontendOrigin: 'http://localhost:5173',
  logLevel: 'silent',
  jwtSecret: 'test-secret-value-for-local-automated-checks-only',
  jwtAlgorithm: 'HS256',
  jwtAccessTokenExpireMinutes: 5,
  authRateLimitWindowMs: 900_000,
  authLoginRateLimitMax: 10,
  authRegisterRateLimitMax: 100,
  authResetRateLimitMax: 5,
  passwordResetTokenExpireMinutes: 15,
}

export function isolatedTestConfig(prefix: string): AppConfig {
  // MongoDB limits database names to 63 characters. Keep the readable prefix
  // within that limit even after adding the per-run UUID and `_test` suffix.
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 16)
  return {
    ...testConfig,
    mongoDatabase: `wellora_${safePrefix}_${randomUUID().replaceAll('-', '')}_test`,
  }
}
