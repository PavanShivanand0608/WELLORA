import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { CookieOptions, Response } from 'express'
import type { AppConfig } from '../config/env.js'

export const authCookieName = 'wellora_access'
export const csrfCookieName = 'wellora_csrf'

function sameSiteCookieOptions(config: Pick<AppConfig, 'appEnv'>): CookieOptions {
  return {
    secure: config.appEnv === 'production',
    sameSite: 'strict',
    path: '/api',
  }
}

export function setAccessCookie(response: Response, token: string, config: AppConfig): void {
  response.cookie(authCookieName, token, {
    ...sameSiteCookieOptions(config),
    httpOnly: true,
    maxAge: config.jwtAccessTokenExpireMinutes * 60_000,
  })
}

export function clearAccessCookie(response: Response, config: Pick<AppConfig, 'appEnv'>): void {
  response.clearCookie(authCookieName, {
    ...sameSiteCookieOptions(config),
    httpOnly: true,
  })
}

function csrfSignature(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('base64url')
}

export function issueCsrfCookie(response: Response, token: string, config: Pick<AppConfig, 'appEnv' | 'jwtSecret'>): void {
  response.cookie(csrfCookieName, `${token}.${csrfSignature(token, config.jwtSecret)}`, {
    ...sameSiteCookieOptions(config),
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000,
  })
}

export function createCsrfToken(): string {
  return randomBytes(32).toString('base64url')
}

export function csrfTokenFromCookie(cookieValue: string | undefined, secret: string): string | undefined {
  if (!cookieValue) return undefined
  const separator = cookieValue.lastIndexOf('.')
  if (separator < 1) return undefined
  const token = cookieValue.slice(0, separator)
  const signature = cookieValue.slice(separator + 1)
  const expected = csrfSignature(token, secret)
  const actualBytes = Buffer.from(signature)
  const expectedBytes = Buffer.from(expected)
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return undefined
  return token
}

export function csrfTokensMatch(cookieValue: string | undefined, headerToken: string | undefined, secret: string): boolean {
  const signedToken = csrfTokenFromCookie(cookieValue, secret)
  if (!signedToken || !headerToken) return false
  const cookieBytes = Buffer.from(signedToken)
  const headerBytes = Buffer.from(headerToken)
  return cookieBytes.length === headerBytes.length && timingSafeEqual(cookieBytes, headerBytes)
}
