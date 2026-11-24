import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request, { type SuperAgentTest } from 'supertest'
import { after, before, test } from 'node:test'
import { createApp } from '../app/app.js'
import { connectToMongo, disconnectFromMongo } from '../app/database/mongo.js'
import { Meal, Nutrition, User, UserSettings } from '../app/models/index.js'
import { isolatedTestConfig } from './helpers.js'

const mealTestConfig = isolatedTestConfig('meals')
if (!mealTestConfig.mongoDatabase.endsWith('_test')) throw new Error('Meal integration tests require a dedicated *_test database.')

const app = createApp(mealTestConfig)
const origin = mealTestConfig.frontendOrigin
const agent = () => request.agent(app)
const password = 'Wellora-Phase33-Integration-2026!'

async function csrf(client: SuperAgentTest): Promise<string> {
  const response = await client.get('/api/auth/csrf').set('Origin', origin)
  assert.equal(response.status, 200)
  return response.body.csrfToken as string
}

async function sendJson(client: SuperAgentTest, method: 'post' | 'put' | 'delete', path: string, body: unknown = {}) {
  const token = await csrf(client)
  return client[method](path).set('Origin', origin).set('X-CSRF-Token', token).send(body)
}

async function register(client: SuperAgentTest, email: string, fullName: string) {
  const result = await sendJson(client, 'post', '/api/auth/register', { fullName, email, password, confirmPassword: password })
  assert.equal(result.status, 201)
  return result.body.user as { id: string; email: string }
}

function mealInput(overrides: Record<string, unknown> = {}) {
  return {
    foodName: 'Idli and sambar',
    mealType: 'BREAKFAST',
    logType: 'REGULAR',
    loggedAt: '2026-11-24T03:15:00.000Z',
    quantity: 2,
    servingUnit: 'pieces',
    calories: 0,
    proteinG: 8.5,
    carbsG: 35,
    fatG: 3,
    ...overrides,
  }
}

before(async () => {
  await connectToMongo(mealTestConfig)
  await Promise.all([User, UserSettings, Meal, Nutrition].map((model) => model.syncIndexes()))
})

after(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === mealTestConfig.mongoDatabase) {
    await mongoose.connection.dropDatabase()
  }
  await disconnectFromMongo()
})

test('meal and nutrition CRUD integration uses authenticated identities and a dedicated MongoDB test database', async (t) => {
  const userAClient = agent()
  const userBClient = agent()
  const userA = await register(userAClient, 'phase33.user.a@example.test', 'Phase 3.3 User A')
  const userB = await register(userBClient, 'phase33.user.b@example.test', 'Phase 3.3 User B')

  await t.test('meal endpoints require an authenticated cookie', async () => {
    const response = await request(app).get('/api/meals').set('Origin', origin)
    assert.equal(response.status, 401)
    assert.equal(response.body.error.code, 'AUTHENTICATION_REQUIRED')
  })

  let createdId = ''
  await t.test('create validates input, persists a meal and keeps zero distinct from missing nutrition', async () => {
    const invalid = await sendJson(userAClient, 'post', '/api/meals', mealInput({ calories: -1 }))
    assert.equal(invalid.status, 400)
    const untrustedOwner = await sendJson(userAClient, 'post', '/api/meals', mealInput({ userId: userB.id }))
    assert.equal(untrustedOwner.status, 400)

    const created = await sendJson(userAClient, 'post', '/api/meals', mealInput({ carbsG: undefined, notes: 'Freshly prepared' }))
    assert.equal(created.status, 201)
    createdId = created.body.meal.id as string
    assert.match(createdId, /^[a-f\d]{24}$/i)
    assert.equal(created.body.meal.nutrition.calories, 0)
    assert.equal(created.body.meal.nutrition.proteinG, 8.5)
    assert.equal('carbsG' in created.body.meal.nutrition, false)
    assert.equal(created.body.meal.userId, undefined)
    const nutrition = await Nutrition.findOne({ mealId: new mongoose.Types.ObjectId(createdId) }).lean()
    assert.equal(nutrition?.calories, 0)
    assert.equal(nutrition?.carbsG, undefined)
  })

  await t.test('list supports date, category, cue, log type, search, pagination and stable sorting', async () => {
    await sendJson(userAClient, 'post', '/api/meals', mealInput({
      foodName: 'Evening roasted chana', mealType: 'SNACK', logType: 'UNPLANNED',
      loggedAt: '2026-11-24T14:00:00.000Z', eatingCue: 'CRAVING', eatingCueDetail: 'CRAVINGS', hungerLevel: 2,
    })).then((response) => assert.equal(response.status, 201))
    await sendJson(userAClient, 'post', '/api/meals', mealInput({
      foodName: 'Vegetable upma', mealType: 'BREAKFAST', loggedAt: '2026-11-23T04:00:00.000Z',
    })).then((response) => assert.equal(response.status, 201))

    const dateFilter = await userAClient.get('/api/meals?date=2026-11-24&mealType=BREAKFAST&search=idli&page=1&limit=1&sort=asc').set('Origin', origin)
    assert.equal(dateFilter.status, 200)
    assert.equal(dateFilter.body.pagination.total, 1)
    assert.equal(dateFilter.body.meals[0].id, createdId)
    const rangeFilter = await userAClient.get('/api/meals?startDate=2026-11-24T00:00:00.000Z&endDate=2026-11-24T23:59:59.999Z&sort=asc').set('Origin', origin)
    assert.equal(rangeFilter.status, 200)
    assert.equal(rangeFilter.body.pagination.total, 2)
    const pageOne = await userAClient.get('/api/meals?date=2026-11-24&page=1&limit=1&sort=asc').set('Origin', origin)
    const pageTwo = await userAClient.get('/api/meals?date=2026-11-24&page=2&limit=1&sort=asc').set('Origin', origin)
    assert.equal(pageOne.body.pagination.total, 2)
    assert.equal(pageOne.body.pagination.totalPages, 2)
    assert.equal(pageOne.body.meals.length, 1)
    assert.equal(pageTwo.body.meals.length, 1)
    assert.notEqual(pageOne.body.meals[0].id, pageTwo.body.meals[0].id)
    const cueFilter = await userAClient.get('/api/meals?eatingCueDetail=CRAVINGS&logType=UNPLANNED').set('Origin', origin)
    assert.equal(cueFilter.status, 200)
    assert.equal(cueFilter.body.pagination.total, 1)
    assert.equal(cueFilter.body.meals[0].eatingCue, 'CRAVING')
    const invalidRange = await userAClient.get('/api/meals?startDate=2026-11-25T00:00:00.000Z&endDate=2026-11-24T00:00:00.000Z').set('Origin', origin)
    assert.equal(invalidRange.status, 400)
  })

  await t.test('summary aggregates only recorded nutrition and returns the authenticated user goals', async () => {
    const response = await userAClient.get('/api/meals/summary?startDate=2026-11-24T00:00:00.000Z&endDate=2026-11-24T23:59:59.999Z').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.summary.mealCount, 2)
    assert.equal(response.body.summary.calories.total, 0)
    assert.equal(response.body.summary.calories.recordedCount, 2)
    assert.equal(response.body.summary.carbsG.total, 35)
    assert.equal(response.body.summary.carbsG.recordedCount, 1)
    assert.equal(response.body.summary.goals.calories, undefined)
  })

  await t.test('read, update and delete are owner scoped; invalid IDs use a client error', async () => {
    const one = await userAClient.get(`/api/meals/${createdId}`).set('Origin', origin)
    assert.equal(one.status, 200)
    assert.equal(one.body.meal.id, createdId)

    const foreignRead = await userBClient.get(`/api/meals/${createdId}`).set('Origin', origin)
    assert.equal(foreignRead.status, 404)
    const foreignUpdate = await sendJson(userBClient, 'put', `/api/meals/${createdId}`, mealInput({ foodName: 'Changed by another user' }))
    assert.equal(foreignUpdate.status, 404)
    const foreignDelete = await sendJson(userBClient, 'delete', `/api/meals/${createdId}`)
    assert.equal(foreignDelete.status, 404)
    const badId = await userAClient.get('/api/meals/not-a-meal-id').set('Origin', origin)
    assert.equal(badId.status, 400)

    const update = await sendJson(userAClient, 'put', `/api/meals/${createdId}`, mealInput({ foodName: 'Idli with sambar', calories: 180, proteinG: undefined, carbsG: 30, fatG: 2 }))
    assert.equal(update.status, 200)
    assert.equal(update.body.meal.foodName, 'Idli with sambar')
    assert.equal(update.body.meal.nutrition.calories, 180)
    assert.equal('proteinG' in update.body.meal.nutrition, false)
    assert.equal((await Nutrition.countDocuments({ userId: userA.id, mealId: createdId })), 1)

    const deleted = await sendJson(userAClient, 'delete', `/api/meals/${createdId}`)
    assert.equal(deleted.status, 200)
    assert.equal(await Meal.exists({ _id: createdId }), null)
    assert.equal(await Nutrition.exists({ mealId: createdId }), null)
    const missing = await userAClient.get(`/api/meals/${createdId}`).set('Origin', origin)
    assert.equal(missing.status, 404)
  })

  await t.test('list and summary never include another user’s meal records', async () => {
    const ownMeal = await sendJson(userBClient, 'post', '/api/meals', mealInput({ foodName: 'User B dal and rice' }))
    assert.equal(ownMeal.status, 201)
    const userAList = await userAClient.get('/api/meals?search=dal').set('Origin', origin)
    const userBList = await userBClient.get('/api/meals?search=dal').set('Origin', origin)
    assert.equal(userAList.body.pagination.total, 0)
    assert.equal(userBList.body.pagination.total, 1)
    assert.notEqual(userBList.body.meals[0].id, createdId)
  })
})
