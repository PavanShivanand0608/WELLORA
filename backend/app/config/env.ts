import { z } from 'zod'

const environmentSchema = z.object({
  MONGODB_URI: z.string().url().refine(
    (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    'MONGODB_URI must use mongodb:// or mongodb+srv://',
  ),
  MONGODB_DATABASE: z.string().trim().min(1),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().min(250).max(60_000).default(5_000),
  BACKEND_HOST: z.string().trim().min(1).default('127.0.0.1'),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65_535).default(8_000),
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  JWT_SECRET: z.string().min(32).refine((value) => !/\s/.test(value), 'JWT_SECRET must not contain whitespace'),
  JWT_ALGORITHM: z.literal('HS256').default('HS256'),
  JWT_ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().int().min(1).max(1_440).default(15),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1_000).max(86_400_000).default(900_000),
  AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(10),
  AUTH_REGISTER_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(5),
  AUTH_RESET_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(5),
  PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
})

export type AppConfig = {
  mongoUri: string
  mongoDatabase: string
  mongoServerSelectionTimeoutMs: number
  host: string
  port: number
  appEnv: 'development' | 'test' | 'production'
  frontendOrigin: string
  logLevel: z.infer<typeof environmentSchema>['LOG_LEVEL']
  jwtSecret: string
  jwtAlgorithm: 'HS256'
  jwtAccessTokenExpireMinutes: number
  authRateLimitWindowMs: number
  authLoginRateLimitMax: number
  authRegisterRateLimitMax: number
  authResetRateLimitMax: number
  passwordResetTokenExpireMinutes: number
}

export class EnvironmentConfigError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`Invalid backend environment configuration: ${issues.join('; ')}`)
    this.name = 'EnvironmentConfigError'
    this.issues = issues
  }
}

export function parseEnvironment(environment: NodeJS.ProcessEnv | Record<string, string | undefined>): AppConfig {
  const result = environmentSchema.safeParse(environment)
  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const field = issue.path.join('.') || 'environment'
      return `${field}: ${issue.message}`
    })
    throw new EnvironmentConfigError(issues)
  }

  return {
    mongoUri: result.data.MONGODB_URI,
    mongoDatabase: result.data.MONGODB_DATABASE,
    mongoServerSelectionTimeoutMs: result.data.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    host: result.data.BACKEND_HOST,
    port: result.data.BACKEND_PORT,
    appEnv: result.data.APP_ENV,
    frontendOrigin: result.data.FRONTEND_ORIGIN,
    logLevel: result.data.LOG_LEVEL,
    jwtSecret: result.data.JWT_SECRET,
    jwtAlgorithm: result.data.JWT_ALGORITHM,
    jwtAccessTokenExpireMinutes: result.data.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    authRateLimitWindowMs: result.data.AUTH_RATE_LIMIT_WINDOW_MS,
    authLoginRateLimitMax: result.data.AUTH_LOGIN_RATE_LIMIT_MAX,
    authRegisterRateLimitMax: result.data.AUTH_REGISTER_RATE_LIMIT_MAX,
    authResetRateLimitMax: result.data.AUTH_RESET_RATE_LIMIT_MAX,
    passwordResetTokenExpireMinutes: result.data.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
  }
}

export function loadConfig(): AppConfig {
  return parseEnvironment(process.env)
}
