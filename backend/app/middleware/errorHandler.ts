import type { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { logger } from '../config/logger.js'

function safeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error'
  return error.message
    .replace(/(mongodb(?:\+srv)?:\/\/)([^/@\s]+@)/gi, '$1[credentials-redacted]@')
    .replace(/\b(password|token|secret|authorization)\s*[:=]\s*([^\s,]+)/gi, '$1=[redacted]')
}

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
      requestId: request.id,
    })
    return
  }

  const parserError = typeof error === 'object' && error !== null
    ? error as { type?: unknown }
    : undefined

  if (parserError?.type === 'entity.too.large') {
    response.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds the 100 KB limit.' },
      requestId: request.id,
    })
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' },
      requestId: request.id,
    })
    return
  }

  logger.error({
    requestId: request.id,
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage: safeErrorMessage(error),
  }, 'Unhandled request error')
  response.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred.' },
    requestId: request.id,
  })
}
