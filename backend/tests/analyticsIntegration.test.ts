import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request, { type SuperAgentTest } from 'supertest'
import { after, before, test } from 'node:test'
import { createApp } from '../app/app.js'
import { connectToMongo, disconnectFromMongo } from '../app/database/mongo.js'
import { Meal, Nutrition, User, UserSettings } from '../app/models/index.js'
import { isolatedTestConfig } from './helpers.js'

const analyticsConfig = isolatedTestConfig('analytics')
if (!analyticsConfig.mongoDatabase.endsWith('_test')) throw new Error('Analytics integration tests require a dedicated *_test database.')

const app = createApp(analyticsConfig)
const origin = analyticsConfig.frontendOrigin
const agent = () => request.agent(app)
const password = 'Wellora-Phase34-Integration-2026!'

async function csrf(client: SuperAgentTest): Promise<string> {
  const response = await client.get('/api/auth/csrf').set('Origin', origin)
  assert.equal(response.status, 200)
  return response.body.csrfToken as string
}

async function register(client: SuperAgentTest, email: string, fullName: string) {
  const token = await csrf(client)
  const response = await client.post('/api/auth/register').set('Origin', origin).set('X-CSRF-Token', token)
    .send({ fullName, email, password, confirmPassword: password })
  assert.equal(response.status, 201)
  return response.body.user as { id: string }
}

async function createMeal(client: SuperAgentTest, overrides: Record<string, unknown> = {}) {
  const token = await csrf(client)
  const response = await client.post('/api/meals').set('Origin', origin).set('X-CSRF-Token', token).send({
    foodName: 'Idli and sambar', mealType: 'BREAKFAST', logType: 'REGULAR',
    loggedAt: '2026-11-24T07:00:00.000Z', quantity: 2, servingUnit: 'pieces',
    ...overrides,
  })
  assert.equal(response.status, 201)
  return response.body.meal as { id: string }
}

before(async () => {
  await connectToMongo(analyticsConfig)
  await Promise.all([User, UserSettings, Meal, Nutrition].map((model) => model.syncIndexes()))
})

after(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === analyticsConfig.mongoDatabase) {
    await mongoose.connection.dropDatabase()
  }
  await disconnectFromMongo()
})

test('authenticated analytics aggregate owner-scoped Mongo records without treating missing nutrition as zero', async (t) => {
  const userAClient = agent()
  const userBClient = agent()
  const userA = await register(userAClient, 'phase34.analytics.a@example.test', 'Phase 3.4 A')
  await register(userBClient, 'phase34.analytics.b@example.test', 'Phase 3.4 B')
  await UserSettings.updateOne({ userId: userA.id }, { $set: { goals: { calories: 1_800, proteinG: 90 } } })

  await t.test('all analytics routes require a signed-in identity and validate date parameters', async () => {
    for (const path of [
      '/api/analytics/dashboard?date=2026-11-24',
      '/api/analytics/trends?range=7',
      '/api/analytics/patterns?range=7',
    ]) {
      const response = await request(app).get(path).set('Origin', origin)
      assert.equal(response.status, 401)
    }
    const invalidDate = await userAClient.get('/api/analytics/dashboard?date=not-a-date').set('Origin', origin)
    assert.equal(invalidDate.status, 400)
    const invalidTimezone = await userAClient.get('/api/analytics/trends?range=7&timezone=Not%2FAZone').set('Origin', origin)
    assert.equal(invalidTimezone.status, 400)
    const invalidRange = await userAClient.get('/api/analytics/patterns?startDate=2026-11-25&endDate=2026-11-24').set('Origin', origin)
    assert.equal(invalidRange.status, 400)
  })

  await t.test('dashboard uses saved meal totals, configured goals, and scoped daily meals', async () => {
    await createMeal(userAClient, { calories: 200, proteinG: 8, fatG: 3, carbsG: undefined })
    await createMeal(userAClient, {
      foodName: 'Evening roasted chana', mealType: 'SNACK', logType: 'UNPLANNED',
      loggedAt: '2026-11-24T19:30:00.000Z', eatingCue: 'CRAVING', eatingCueDetail: 'STRESS',
      hungerLevel: 4, moodBefore: 'Anxious', moodAfter: 'Calm', calories: 0, carbsG: 15,
    })
    await createMeal(userAClient, {
      foodName: 'Vegetable upma', mealType: 'LUNCH', loggedAt: '2026-11-23T12:00:00.000Z', calories: 100,
    })

    const response = await userAClient.get('/api/analytics/dashboard?date=2026-11-24&timezone=UTC').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.summary.mealCount, 2)
    assert.equal(response.body.summary.regularMealCount, 1)
    assert.equal(response.body.summary.unplannedMealCount, 1)
    assert.equal(response.body.summary.calories.total, 200)
    assert.equal(response.body.summary.calories.recordedCount, 2)
    assert.equal(response.body.summary.proteinG.total, 8)
    assert.equal(response.body.summary.carbsG.total, 15)
    assert.equal(response.body.summary.carbsG.recordedCount, 1)
    assert.equal(response.body.summary.remaining.calories, 1_600)
    assert.equal(response.body.summary.goals.proteinG, 90)
    assert.equal(response.body.meals.length, 2)
    assert.equal(response.body.meals.some((meal: { foodName: string }) => meal.foodName === 'Vegetable upma'), false)

    const emptyOwner = await userBClient.get('/api/analytics/dashboard?date=2026-11-24&timezone=UTC').set('Origin', origin)
    assert.equal(emptyOwner.status, 200)
    assert.equal(emptyOwner.body.summary.mealCount, 0)
    assert.equal(emptyOwner.body.summary.calories.total, null)
    assert.equal(emptyOwner.body.summary.remaining.calories, null)
    assert.equal(emptyOwner.body.meals.length, 0)

    const localDay = await userAClient.get('/api/analytics/dashboard?date=2026-11-25&timezone=Asia%2FKolkata').set('Origin', origin)
    assert.equal(localDay.status, 200)
    assert.equal(localDay.body.summary.mealCount, 1)
    assert.equal(localDay.body.summary.calories.total, 0)
    assert.equal(localDay.body.summary.proteinG.total, null)
    assert.equal(localDay.body.meals[0].foodName, 'Evening roasted chana')
  })

  await t.test('trends fill empty days and preserve null nutrition fields', async () => {
    const response = await userAClient.get('/api/analytics/trends?startDate=2026-11-23&endDate=2026-11-25&timezone=UTC').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.days.length, 3)
    assert.equal(response.body.days[0].mealCount, 1)
    assert.equal(response.body.days[0].caloriesTotal, 100)
    assert.equal(response.body.days[0].proteinGTotal, null)
    assert.equal(response.body.days[1].caloriesTotal, 200)
    assert.equal(response.body.days[1].carbsGTotal, 15)
    assert.equal(response.body.days[2].mealCount, 0)
    assert.equal(response.body.days[2].caloriesTotal, null)
    assert.equal(response.body.goals.calories, 1_800)

    for (const days of [7, 30, 90]) {
      const preset = await userAClient.get(`/api/analytics/trends?range=${days}&timezone=UTC`).set('Origin', origin)
      assert.equal(preset.status, 200)
      assert.equal(preset.body.days.length, days)
    }
    const otherUser = await userBClient.get('/api/analytics/trends?startDate=2026-11-23&endDate=2026-11-25&timezone=UTC').set('Origin', origin)
    assert.equal(otherUser.status, 200)
    assert.equal(otherUser.body.days.reduce((total: number, day: { mealCount: number }) => total + day.mealCount, 0), 0)
    assert.equal(otherUser.body.days[0].caloriesTotal, null)
  })

  await t.test('patterns compare matching periods and aggregate cue, hunger, timing, mood and daily data', async () => {
    const response = await userAClient.get('/api/analytics/patterns?startDate=2026-11-24&endDate=2026-11-24&timezone=UTC').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.mealCount, 2)
    assert.equal(response.body.previousMealCount, 1)
    assert.equal(response.body.unplannedCount, 1)
    assert.equal(response.body.previousUnplannedCount, 0)
    assert.equal(response.body.cueTaggedCount, 1)
    assert.equal(response.body.cueDistribution[0].key, 'STRESS')
    assert.equal(response.body.cueDistribution[0].percentage, 100)
    assert.equal(response.body.hungerDistribution[0].key, '4')
    assert.equal(response.body.averageHunger, 4)
    assert.equal(response.body.daypartDistribution.find((item: { key: string }) => item.key === 'Evening').count, 1)
    assert.equal(response.body.moodBeforeDistribution[0].key, 'anxious')
    assert.equal(response.body.moodAfterDistribution[0].key, 'calm')
    assert.equal(response.body.cueMoodAssociations[0].cue, 'STRESS')
    assert.equal(response.body.dailyTrend[0].mealCount, 2)
    assert.equal(response.body.dailyTrend[0].averageHunger, 4)

    const otherUserPatterns = await userBClient.get('/api/analytics/patterns?startDate=2026-11-24&endDate=2026-11-24&timezone=UTC').set('Origin', origin)
    assert.equal(otherUserPatterns.status, 200)
    assert.equal(otherUserPatterns.body.mealCount, 0)
    assert.deepEqual(otherUserPatterns.body.cueDistribution, [])
  })
})
