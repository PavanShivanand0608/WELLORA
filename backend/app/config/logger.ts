import pino from 'pino'
import { randomUUID } from 'node:crypto'
import { pinoHttp } from 'pino-http'

const allowedLevels = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
const requestedLevel = process.env.LOG_LEVEL

export const logger = pino({
  level: requestedLevel && allowedLevels.has(requestedLevel) ? requestedLevel : 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]'],
    censor: '[Redacted]',
  },
})

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  serializers: {
    req: (request) => ({
      id: request.id,
      method: request.method,
      url: request.url.split('?')[0],
    }),
    res: (response) => ({ statusCode: response.statusCode }),
  },
})
