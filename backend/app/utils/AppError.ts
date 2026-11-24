export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: unknown

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class ValidationAppError extends AppError {
  constructor(details: unknown) {
    super(400, 'VALIDATION_ERROR', 'Request validation failed.', details)
    this.name = 'ValidationAppError'
  }
}

export class DuplicateEmailError extends AppError {
  constructor() {
    super(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email address already exists.')
    this.name = 'DuplicateEmailError'
  }
}
