import type { RequestHandler } from 'express'
import type { AppConfig } from '../config/env.js'
import { User } from '../models/User.js'
import {
  createPasswordResetToken,
  findAuthenticatedUser,
  loginUser,
  registerUser,
  resetPassword,
} from '../services/authService.js'
import { clearAccessCookie, createCsrfToken, csrfTokenFromCookie, csrfCookieName, issueCsrfCookie, setAccessCookie } from '../utils/authCookies.js'
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '../validators/auth.js'
import { AppError } from '../utils/AppError.js'

export function createCsrfController(config: AppConfig): RequestHandler {
  return (request, response) => {
    const existingToken = csrfTokenFromCookie(request.cookies?.[csrfCookieName] as string | undefined, config.jwtSecret)
    const csrfToken = existingToken ?? createCsrfToken()
    if (!existingToken) issueCsrfCookie(response, csrfToken, config)
    response.status(200).json({ csrfToken })
  }
}

export function createRegisterController(config: AppConfig): RequestHandler<unknown, unknown, RegisterInput> {
  return async (request, response) => {
    const result = await registerUser(request.body, config)
    setAccessCookie(response, result.accessToken, config)
    response.status(201).json({ user: result.user })
  }
}

export function createLoginController(config: AppConfig): RequestHandler<unknown, unknown, LoginInput> {
  return async (request, response) => {
    const result = await loginUser(request.body, config)
    setAccessCookie(response, result.accessToken, config)
    response.status(200).json({ user: result.user })
  }
}

export function createLogoutController(config: AppConfig): RequestHandler {
  return (_request, response) => {
    clearAccessCookie(response, config)
    response.status(200).json({ message: 'Signed out. The browser access cookie was cleared.' })
  }
}

export const currentUserController: RequestHandler = async (request, response) => {
  if (!request.auth) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid sign-in is required.')
  const user = await findAuthenticatedUser(request.auth.userId)
  response.status(200).json({ user })
}

export function createForgotPasswordController(config: AppConfig): RequestHandler<unknown, unknown, ForgotPasswordInput> {
  return async (request, response) => {
    await createPasswordResetToken(request.body.email, config)
    response.status(202).json({ message: 'If an account matches that email, reset instructions will be available when email delivery is configured. No email was sent.' })
  }
}

export function createResetPasswordController(config: AppConfig): RequestHandler<unknown, unknown, ResetPasswordInput> {
  return async (request, response) => {
    await resetPassword(request.body)
    clearAccessCookie(response, config)
    response.status(200).json({ message: 'Password reset successfully. Sign in with your new password.' })
  }
}
