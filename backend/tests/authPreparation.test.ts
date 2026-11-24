import assert from 'node:assert/strict'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { test } from 'node:test'
import { errorHandler } from '../app/middleware/errorHandler.js'
import { authorizeSelf, requireAuth } from '../app/middleware/requireAuth.js'
import { hashPassword, verifyPassword } from '../app/services/passwordService.js'
import { createAccessToken, verifyAccessToken } from '../app/services/tokenService.js'
import { notFoundHandler } from '../app/middleware/notFound.js'
import { testConfig } from './helpers.js'

test('password preparation stores only a one-way bcrypt hash', async () => {
  const password = 'Sample-Password-For-Test-Only-2026!'
  const hash = await hashPassword(password)
  assert.notEqual(hash, password)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('Different-test-password-2026!', hash), false)
})

test('access tokens are signed and verified with issuer, audience, and expiry', () => {
  const token = createAccessToken('507f1f77bcf86cd799439011', testConfig)
  assert.deepEqual(verifyAccessToken(token, testConfig), { userId: '507f1f77bcf86cd799439011' })
  assert.throws(() => verifyAccessToken(`${token}tampered`, testConfig))
})

test('protected-route middleware authenticates HttpOnly-cookie tokens and blocks cross-user access', async () => {
  const app = express()
  app.use(cookieParser())
  app.get('/users/:userId', requireAuth(testConfig), authorizeSelf, (request, response) => {
    response.json({ userId: request.auth?.userId })
  })
  app.use(notFoundHandler)
  app.use(errorHandler)

  const ownId = '507f1f77bcf86cd799439011'
  const ownToken = createAccessToken(ownId, testConfig)
  const allowed = await request(app).get(`/users/${ownId}`).set('Cookie', `wellora_access=${ownToken}`)
  assert.equal(allowed.status, 200)
  assert.equal(allowed.body.userId, ownId)

  const denied = await request(app).get('/users/507f1f77bcf86cd799439012').set('Cookie', `wellora_access=${ownToken}`)
  assert.equal(denied.status, 403)

  const missing = await request(app).get(`/users/${ownId}`)
  assert.equal(missing.status, 401)
})
