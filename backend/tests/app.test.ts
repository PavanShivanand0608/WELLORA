import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'
import { test } from 'node:test'
import { createApp } from '../app/app.js'
import { errorHandler } from '../app/middleware/errorHandler.js'
import { notFoundHandler } from '../app/middleware/notFound.js'
import { validateBody } from '../app/middleware/validateRequest.js'
import { loginSchema } from '../app/validators/auth.js'
import { testConfig } from './helpers.js'

test('GET /api/health returns an application liveness response and security headers', async () => {
  const response = await request(createApp(testConfig)).get('/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
  assert.equal(response.body.environment, 'test')
  assert.equal(response.headers['x-content-type-options'], 'nosniff')
  assert.equal(response.headers['x-powered-by'], undefined)
})

test('database health reports disconnected MongoDB without claiming success', async () => {
  const response = await request(createApp(testConfig)).get('/api/health/db')
  assert.equal(response.status, 503)
  assert.equal(response.body.status, 'degraded')
  assert.notEqual(response.body.dependencies.mongodb, 'connected')
})

test('CORS allows the configured frontend origin and rejects other browser origins', async () => {
  const app = createApp(testConfig)
  const allowed = await request(app).get('/api/health').set('Origin', testConfig.frontendOrigin)
  assert.equal(allowed.status, 200)
  assert.equal(allowed.headers['access-control-allow-origin'], testConfig.frontendOrigin)
  assert.equal(allowed.headers['access-control-allow-credentials'], 'true')

  const denied = await request(app).get('/api/health').set('Origin', 'https://untrusted.example')
  assert.equal(denied.status, 403)
  assert.equal(denied.body.error.code, 'CORS_ORIGIN_DENIED')
})

test('unknown endpoints use the centralized JSON 404 response', async () => {
  const response = await request(createApp(testConfig)).get('/api/missing')
  assert.equal(response.status, 404)
  assert.equal(response.body.error.code, 'NOT_FOUND')
  assert.ok(response.body.requestId)
})

test('invalid JSON receives a safe client error response', async () => {
  const response = await request(createApp(testConfig))
    .post('/api/health')
    .set('Content-Type', 'application/json')
    .send('{invalid')
  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'INVALID_JSON')
})

test('oversized JSON bodies receive an explicit 413 response', async () => {
  const response = await request(createApp(testConfig))
    .post('/api/health')
    .set('Content-Type', 'application/json')
    .send(`{"data":"${'x'.repeat(110_000)}"}`)
  assert.equal(response.status, 413)
  assert.equal(response.body.error.code, 'PAYLOAD_TOO_LARGE')
})

test('request validation reports fields and never echoes submitted credentials', async () => {
  const app = express()
  app.use(express.json())
  app.post('/login-validation', validateBody(loginSchema), (request, response) => response.json({ ok: true }))
  app.use(errorHandler)

  const response = await request(app).post('/login-validation').send({ email: 'bad-email', password: '' })
  assert.equal(response.status, 400)
  assert.equal(response.body.error.code, 'VALIDATION_ERROR')
  assert.ok(Array.isArray(response.body.error.details))
  assert.equal(JSON.stringify(response.body).includes('bad-email'), false)
})

test('unhandled errors return a generic server error instead of internal details', async () => {
  const app = express()
  app.get('/failure', () => { throw new Error('private internal information') })
  app.use(notFoundHandler)
  app.use(errorHandler)

  const response = await request(app).get('/failure')
  assert.equal(response.status, 500)
  assert.equal(response.body.error.code, 'INTERNAL_SERVER_ERROR')
  assert.equal(JSON.stringify(response.body).includes('private internal information'), false)
})
