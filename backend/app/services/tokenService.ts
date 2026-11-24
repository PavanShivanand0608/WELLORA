import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { AppConfig } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const tokenIssuer = 'wellora-api'
const tokenAudience = 'wellora-client'

type TokenConfig = Pick<AppConfig, 'jwtSecret' | 'jwtAlgorithm' | 'jwtAccessTokenExpireMinutes'>

export function createAccessToken(userId: string, config: TokenConfig): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    algorithm: config.jwtAlgorithm,
    expiresIn: config.jwtAccessTokenExpireMinutes * 60,
    issuer: tokenIssuer,
    audience: tokenAudience,
  })
}

export function verifyAccessToken(token: string, config: TokenConfig): { userId: string } {
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
      issuer: tokenIssuer,
      audience: tokenAudience,
    }) as JwtPayload
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error('Token subject is missing')
    }
    return { userId: payload.sub }
  } catch {
    throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired.')
  }
}
