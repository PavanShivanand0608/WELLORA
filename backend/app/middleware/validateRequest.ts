import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { ValidationAppError } from '../utils/AppError.js'

export function validateBody<TSchema extends ZodType>(schema: TSchema): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body)
    if (!result.success) {
      next(new ValidationAppError(result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))))
      return
    }

    request.body = result.data
    next()
  }
}
