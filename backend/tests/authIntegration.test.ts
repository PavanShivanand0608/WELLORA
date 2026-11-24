import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import request, { type SuperAgentTest } from 'supertest'
import { after, before, test } from 'node:test'
import { createApp } from '../app/app.js'
import { connectToMongo, disconnectFromMongo } from '../app/database/mongo.js'
import { Meal, Nutrition, RecommendationFeedback, EatingPattern, User, UserSettings } from '../app/models/index.js'
import { createPasswordResetToken } from '../app/services/authService.js'
import { verifyPassword } from '../app/services/passwordService.js'
import { isolatedTestConfig } from './helpers.js'

const authTestConfig = isolatedTestConfig('auth')
if (!authTestConfig.mongoDatabase.endsWith('_test')) {
  throw new Error('Authentication integration tests require a database name ending in _test.')
}

const app = createApp(authTestConfig)
const agent = (target = app) => request.agent(target)
const origin = authTestConfig.frontendOrigin

async function csrf(client: SuperAgentTest): Promise<string> {
  const response = await client.get('/api/auth/csrf').set('Origin', origin)
  assert.equal(response.status, 200)
  assert.match(response.headers['cache-control'], /no-store/i)
  assert.equal(typeof response.body.csrfToken, 'string')
  const csrfCookie = (response.headers['set-cookie'] as string[] | undefined)?.find((value) => value.startsWith('wellora_csrf='))
  if (csrfCookie) assert.match(csrfCookie, /HttpOnly/i)
  return response.body.csrfToken as string
}

async function postJson(client: SuperAgentTest, path: string, body: unknown) {
  const token = await csrf(client)
  return client.post(path).set('Origin', origin).set('X-CSRF-Token', token).send(body)
}

const strongPassword = 'Wellora-Phase32-Strong-2026!'
const validRegistration = {
  fullName: 'Phase 3.2 Test User',
  email: 'phase32.test.user@example.test',
  password: strongPassword,
  confirmPassword: strongPassword,
}

before(async () => {
  await connectToMongo(authTestConfig)
  await Promise.all([User, UserSettings, Meal, Nutrition, EatingPattern, RecommendationFeedback].map((model) => model.syncIndexes()))
})

after(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === authTestConfig.mongoDatabase && authTestConfig.mongoDatabase.endsWith('_test')) {
    await mongoose.connection.dropDatabase()
  }
  await disconnectFromMongo()
})

test('authentication HTTP integration with the dedicated real MongoDB test database', async (t) => {
  await t.test('CSRF and unauthenticated access are enforced', async () => {
    const client = agent()
    const noCsrf = await client.post('/api/auth/login').set('Origin', origin).send({ email: 'a@example.test', password: 'x' })
    assert.equal(noCsrf.status, 403)
    assert.equal(noCsrf.body.error.code, 'CSRF_VALIDATION_FAILED')
    const unauthenticated = await client.get('/api/auth/me').set('Origin', origin)
    assert.equal(unauthenticated.status, 401)
  })

  await t.test('registration validates fields, normalizes email, hashes password and creates default settings', async () => {
    const client = agent()
    const csrfToken = await csrf(client)
    const invalidEmail = await client.post('/api/auth/register').set('Origin', origin).set('X-CSRF-Token', csrfToken).send({ ...validRegistration, email: 'not-an-email' })
    assert.equal(invalidEmail.status, 400)
    const oversizedLoginPassword = await client.post('/api/auth/login').set('Origin', origin).set('X-CSRF-Token', csrfToken).send({ email: validRegistration.email, password: 'é'.repeat(37) })
    assert.equal(oversizedLoginPassword.status, 400)
    const weakPassword = await client.post('/api/auth/register').set('Origin', origin).set('X-CSRF-Token', csrfToken).send({ ...validRegistration, email: 'weak@example.test', password: 'weak', confirmPassword: 'weak' })
    assert.equal(weakPassword.status, 400)
    const mismatch = await client.post('/api/auth/register').set('Origin', origin).set('X-CSRF-Token', csrfToken).send({ ...validRegistration, email: 'mismatch@example.test', confirmPassword: 'different' })
    assert.equal(mismatch.status, 400)

    const created = await client.post('/api/auth/register').set('Origin', origin).set('X-CSRF-Token', csrfToken).send({ ...validRegistration, email: ' Phase32.Test.User@Example.Test ' })
    assert.equal(created.status, 201)
    assert.equal(created.body.user.email, 'phase32.test.user@example.test')
    assert.equal(created.body.user.fullName, validRegistration.fullName)
    assert.equal(typeof created.body.user.id, 'string')
    assert.equal(typeof created.body.user.createdAt, 'string')
    assert.equal('passwordHash' in created.body.user, false)
    assert.equal('accessToken' in created.body, false)
    assert.equal(JSON.stringify(created.body).includes(strongPassword), false)
    const authCookie = (created.headers['set-cookie'] as string[]).find((value) => value.startsWith('wellora_access='))
    assert.ok(authCookie)
    assert.match(authCookie, /HttpOnly/i)
    assert.match(authCookie, /SameSite=Strict/i)
    assert.doesNotMatch(authCookie, /Secure/i, 'development cookie is not Secure over local HTTP')

    const storedUser = await User.findOne({ email: validRegistration.email }).select('+passwordHash')
    assert.ok(storedUser?.passwordHash)
    assert.notEqual(storedUser.passwordHash, strongPassword)
    assert.equal(await verifyPassword(strongPassword, storedUser.passwordHash), true)
    const settings = await UserSettings.findOne({ userId: storedUser._id })
    assert.ok(settings, 'default UserSettings record should be created')
    assert.deepEqual(settings.foodPreferences.allergies, [])
  })

  await t.test('duplicate registration returns a conflict without exposing credentials', async () => {
    const response = await postJson(agent(), '/api/auth/register', validRegistration)
    assert.equal(response.status, 409)
    assert.equal(response.body.error.code, 'EMAIL_ALREADY_REGISTERED')
    assert.equal(JSON.stringify(response.body).includes(strongPassword), false)
  })

  await t.test('login uses a generic error and restores identity from the HttpOnly cookie', async () => {
    const client = agent()
    const bad = await postJson(client, '/api/auth/login', { email: validRegistration.email, password: 'wrong-password' })
    assert.equal(bad.status, 401)
    assert.equal(bad.body.error.code, 'INVALID_CREDENTIALS')
    const good = await postJson(client, '/api/auth/login', { email: 'PHASE32.TEST.USER@example.test', password: strongPassword })
    assert.equal(good.status, 200)
    assert.equal(good.body.user.email, validRegistration.email)
    assert.equal('accessToken' in good.body, false)
    const current = await client.get('/api/auth/me').set('Origin', origin)
    assert.equal(current.status, 200)
    assert.equal(current.body.user.id, good.body.user.id)
    assert.match(current.headers['cache-control'], /no-store/i)
  })

  await t.test('invalid and expired JWT cookies cannot access the current-user endpoint', async () => {
    const invalid = await request(app).get('/api/auth/me').set('Cookie', 'wellora_access=invalid.token.value').set('Origin', origin)
    assert.equal(invalid.status, 401)
    const expiredToken = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, authTestConfig.jwtSecret, {
      algorithm: 'HS256', issuer: 'wellora-api', audience: 'wellora-client', expiresIn: -1,
    })
    const expired = await request(app).get('/api/auth/me').set('Cookie', `wellora_access=${expiredToken}`).set('Origin', origin)
    assert.equal(expired.status, 401)
    assert.equal(expired.body.error.code, 'INVALID_ACCESS_TOKEN')
  })

  await t.test('each browser identity remains isolated even when a client supplies another user id', async () => {
    const firstClient = agent()
    const secondClient = agent()
    const firstLogin = await postJson(firstClient, '/api/auth/login', { email: validRegistration.email, password: strongPassword })
    assert.equal(firstLogin.status, 200)
    const firstUser = firstLogin.body.user
    const secondRegistration = await postJson(secondClient, '/api/auth/register', {
      ...validRegistration,
      fullName: 'Second Test User',
      email: 'phase32.second.user@example.test',
    })
    assert.equal(secondRegistration.status, 201)
    const firstWithUntrustedQuery = await firstClient.get(`/api/auth/me?userId=${secondRegistration.body.user.id}`).set('Origin', origin)
    assert.equal(firstWithUntrustedQuery.status, 200)
    assert.equal(firstWithUntrustedQuery.body.user.id, firstUser.id)
    assert.notEqual(firstWithUntrustedQuery.body.user.id, secondRegistration.body.user.id)
  })

  await t.test('logout clears the cookie and requires a new login', async () => {
    const client = agent()
    const loggedIn = await postJson(client, '/api/auth/login', { email: validRegistration.email, password: strongPassword })
    assert.equal(loggedIn.status, 200)
    const logout = await postJson(client, '/api/auth/logout', {})
    assert.equal(logout.status, 200)
    assert.match(logout.body.message, /browser access cookie was cleared/i)
    const clearingCookie = (logout.headers['set-cookie'] as string[]).find((value) => value.startsWith('wellora_access='))
    assert.ok(clearingCookie)
    assert.match(clearingCookie, /Expires=Thu, 01 Jan 1970/i)
    const afterLogout = await client.get('/api/auth/me').set('Origin', origin)
    assert.equal(afterLogout.status, 401)
  })

  await t.test('forgot password is non-enumerating and reset tokens are hashed and expiring', async () => {
    const existing = await postJson(agent(), '/api/auth/password/forgot', { email: validRegistration.email })
    const missing = await postJson(agent(), '/api/auth/password/forgot', { email: 'missing@example.test' })
    assert.equal(existing.status, 202)
    assert.deepEqual(existing.body, missing.body)
    assert.match(existing.body.message, /No email was sent/i)

    const rawToken = await createPasswordResetToken(validRegistration.email, authTestConfig)
    assert.ok(rawToken)
    const userWithReset = await User.findOne({ email: validRegistration.email }).select('+passwordResetTokenHash +passwordResetExpiresAt')
    assert.ok(userWithReset?.passwordResetTokenHash)
    assert.notEqual(userWithReset.passwordResetTokenHash, rawToken)
    userWithReset.passwordResetExpiresAt = new Date(Date.now() - 1_000)
    await userWithReset.save()
    const expired = await postJson(agent(), '/api/auth/password/reset', { token: rawToken, password: strongPassword, confirmPassword: strongPassword })
    assert.equal(expired.status, 400)
    assert.equal(expired.body.error.code, 'INVALID_RESET_TOKEN')

    const usableToken = await createPasswordResetToken(validRegistration.email, authTestConfig)
    assert.ok(usableToken)
    const resetPassword = 'Updated-Wellora-Phase32-2026!'
    const reset = await postJson(agent(), '/api/auth/password/reset', { token: usableToken, password: resetPassword, confirmPassword: resetPassword })
    assert.equal(reset.status, 200)
    const staleLogin = await postJson(agent(), '/api/auth/login', { email: validRegistration.email, password: strongPassword })
    assert.equal(staleLogin.status, 401)
    const newLogin = await postJson(agent(), '/api/auth/login', { email: validRegistration.email, password: resetPassword })
    assert.equal(newLogin.status, 200)
  })

  await t.test('authentication requests are rate limited', async () => {
    const limitedApp = createApp({ ...authTestConfig, authLoginRateLimitMax: 1 })
    const client = agent(limitedApp)
    const first = await postJson(client, '/api/auth/login', { email: validRegistration.email, password: 'wrong' })
    const second = await postJson(client, '/api/auth/login', { email: validRegistration.email, password: 'wrong' })
    assert.equal(first.status, 401)
    assert.equal(second.status, 429)
    assert.equal(second.body.error.code, 'RATE_LIMITED')
  })
})
