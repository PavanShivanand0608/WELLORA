import assert from 'node:assert/strict'
import request, { type SuperAgentTest } from 'supertest'
import { after, before, test } from 'node:test'
import { createApp } from '../app/app.js'
import { connectToMongo, disconnectFromMongo } from '../app/database/mongo.js'
import { Meal, Nutrition, RecommendationFeedback, User, UserSettings } from '../app/models/index.js'
import { isolatedTestConfig } from './helpers.js'

const settingsTestConfig = isolatedTestConfig('settings_recommendations')
if (!settingsTestConfig.mongoDatabase.endsWith('_test')) throw new Error('Settings and recommendation integration tests require an isolated *_test database.')
const app = createApp(settingsTestConfig)
const origin = settingsTestConfig.frontendOrigin
const agent = () => request.agent(app)
const password = 'Wellora-Phase35-Integration-2026!'

async function csrf(client: SuperAgentTest) {
  const response = await client.get('/api/auth/csrf').set('Origin', origin)
  assert.equal(response.status, 200)
  return response.body.csrfToken as string
}

async function sendJson(client: SuperAgentTest, method: 'post' | 'put' | 'delete', path: string, body: unknown = {}) {
  const token = await csrf(client)
  return client[method](path).set('Origin', origin).set('X-CSRF-Token', token).send(body)
}

async function register(client: SuperAgentTest, email: string, fullName: string) {
  const response = await sendJson(client, 'post', '/api/auth/register', { fullName, email, password, confirmPassword: password })
  assert.equal(response.status, 201)
  return response.body.user as { id: string; email: string }
}

function mealInput(offsetMinutes: number) {
  const loggedAt = new Date(Date.now() - 2 * 86_400_000 + offsetMinutes * 60_000)
  loggedAt.setUTCHours(18, 0, 0, 0)
  return {
    foodName: 'Vegetable dosa', mealType: 'DINNER', logType: 'UNPLANNED', loggedAt: loggedAt.toISOString(),
    quantity: 1, servingUnit: 'plate', calories: 320, proteinG: 12, carbsG: 44, fatG: 9,
    eatingCue: 'CRAVING', eatingCueDetail: 'CRAVINGS', hungerLevel: 3,
  }
}

before(async () => {
  await connectToMongo(settingsTestConfig)
  await Promise.all([User, UserSettings, Meal, Nutrition, RecommendationFeedback].map((model) => model.syncIndexes()))
})

after(async () => {
  if (settingsTestConfig.mongoDatabase.endsWith('_test') && User.db.readyState === 1 && User.db.name === settingsTestConfig.mongoDatabase) {
    await User.db.dropDatabase()
  }
  await disconnectFromMongo()
})

test('authenticated settings and recommendations persist safely per user', async (t) => {
  const clientA = agent()
  const clientB = agent()
  const userA = await register(clientA, 'phase35.a@example.test', 'Phase 3.5 User A')
  const userB = await register(clientB, 'phase35.b@example.test', 'Phase 3.5 User B')

  await t.test('settings and profile endpoints require authentication and reject cross-user fields', async () => {
    const anonymous = await request(app).get('/api/settings').set('Origin', origin)
    assert.equal(anonymous.status, 401)
    const defaults = await clientA.get('/api/settings').set('Origin', origin)
    assert.equal(defaults.status, 200)
    assert.equal(defaults.body.settings.profile.email, userA.email)
    assert.equal(defaults.body.settings.foodPreferences.foodStyle, 'NOT_SET')
    assert.equal(defaults.body.settings.applicationPreferences.timezone, 'UTC')
    assert.equal(defaults.body.settings.goals.objectives.length, 0)
    assert.equal('passwordHash' in defaults.body.settings, false)

    const noCsrf = await clientA.put('/api/settings').set('Origin', origin).send({ goals: { calories: 2100 } })
    assert.equal(noCsrf.status, 403)
    const forgedOwner = await sendJson(clientA, 'put', '/api/settings', { userId: userB.id, goals: { calories: 2100 } })
    assert.equal(forgedOwner.status, 400)
  })

  await t.test('profile and preferences persist, validate, preserve omitted fields, and remain user scoped', async () => {
    const saved = await sendJson(clientA, 'put', '/api/settings', {
      profile: { fullName: 'Updated Account Name', age: 31, heightCm: 170, weightKg: 68 },
      goals: { calories: 2100, proteinG: 85, objectives: ['Plan simple lunches'] },
      foodPreferences: { foodStyle: 'VEGAN', allergies: ['milk'], dietaryPreferences: ['Gluten-free preference'], foodsToAvoid: ['peanuts'], favouriteCategories: ['Lunch'] },
      applicationPreferences: { timezone: 'Asia/Kolkata', notificationsEnabled: true, mealReminderEnabled: true, mealReminderTime: '08:30' },
    })
    assert.equal(saved.status, 200)
    assert.equal(saved.body.settings.profile.fullName, 'Updated Account Name')
    assert.equal(saved.body.settings.goals.calories, 2100)
    assert.equal(saved.body.settings.foodPreferences.foodStyle, 'VEGAN')
    assert.equal(saved.body.settings.applicationPreferences.timezone, 'Asia/Kolkata')

    const partial = await sendJson(clientA, 'put', '/api/settings', { goals: { proteinG: 90 } })
    assert.equal(partial.status, 200)
    assert.equal(partial.body.settings.goals.calories, 2100)
    assert.equal(partial.body.settings.goals.proteinG, 90)
    assert.equal(partial.body.settings.foodPreferences.foodStyle, 'VEGAN')
    const invalid = await sendJson(clientA, 'put', '/api/profile', { age: 0 })
    assert.equal(invalid.status, 400)

    const updatedProfile = await sendJson(clientA, 'put', '/api/profile', { fullName: 'A Profile Name', age: 32 })
    assert.equal(updatedProfile.status, 200)
    assert.equal(updatedProfile.body.profile.fullName, 'A Profile Name')
    const profile = await clientA.get('/api/profile').set('Origin', origin)
    assert.equal(profile.status, 200)
    assert.equal(profile.body.profile.age, 32)
    assert.equal(profile.body.profile.email, userA.email)
    assert.equal('passwordHash' in profile.body.profile, false)

    const otherSettings = await clientB.get('/api/settings').set('Origin', origin)
    assert.equal(otherSettings.body.settings.profile.fullName, 'Phase 3.5 User B')
    assert.notEqual(otherSettings.body.settings.profile.fullName, profile.body.profile.fullName)
  })

  await t.test('general recommendations are separate and excluded when they conflict with account restrictions', async () => {
    const response = await clientA.get('/api/recommendations').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.plan.mealCount, 0)
    assert.deepEqual(response.body.plan.personalized, [])
    assert.ok(response.body.plan.general.length > 0)
    assert.equal(response.body.plan.general.some((item: { title: string }) => item.title.includes('curd')), false)
    assert.equal(response.body.plan.general.some((item: { title: string }) => item.title.includes('upma')), false)
    assert.ok(response.body.plan.general.every((item: { source: string }) => item.source === 'general'))
  })

  let recommendationId = ''
  await t.test('real meal analytics generate explainable personalized suggestions for the owning user', async () => {
    for (let index = 0; index < 3; index += 1) {
      const created = await sendJson(clientB, 'post', '/api/meals', mealInput(index * 10))
      assert.equal(created.status, 201)
    }
    const response = await clientB.get('/api/recommendations').set('Origin', origin)
    assert.equal(response.status, 200)
    assert.equal(response.body.plan.mealCount, 3)
    assert.ok(response.body.plan.personalized.length > 0)
    assert.ok(response.body.plan.personalized.every((item: { whySuggested: string; source: string }) => item.whySuggested.length > 0 && item.source === 'personalized'))
    recommendationId = response.body.plan.personalized[0].id as string
    assert.match(recommendationId, /^rec_[a-f\d]{32}$/)
    const foreignRecommendation = await clientA.get(`/api/recommendations/${recommendationId}`).set('Origin', origin)
    assert.equal(foreignRecommendation.status, 404)
  })

  await t.test('feedback and saved recommendations persist, remain isolated, and recheck new food restrictions', async () => {
    const detail = await clientB.get(`/api/recommendations/${recommendationId}`).set('Origin', origin)
    assert.equal(detail.status, 200)
    const feedback = await sendJson(clientB, 'post', `/api/recommendations/${recommendationId}/feedback`, { helpful: true, relevant: true })
    assert.equal(feedback.status, 200)
    assert.equal(feedback.body.recommendation.feedback.helpful, true)

    const forbiddenFeedback = await sendJson(clientA, 'post', `/api/recommendations/${recommendationId}/feedback`, { helpful: true })
    assert.equal(forbiddenFeedback.status, 404)

    const saved = await sendJson(clientB, 'post', `/api/recommendations/${recommendationId}/save`)
    assert.equal(saved.status, 200)
    assert.equal(saved.body.recommendation.saved, true)
    const savedList = await clientB.get('/api/recommendations/saved').set('Origin', origin)
    assert.equal(savedList.status, 200)
    assert.equal(savedList.body.recommendations.length, 1)
    const foreignSaved = await clientA.get('/api/recommendations/saved').set('Origin', origin)
    assert.deepEqual(foreignSaved.body.recommendations, [])

    const prefs = await sendJson(clientB, 'put', '/api/settings', { foodPreferences: { allergies: ['legumes'] } })
    assert.equal(prefs.status, 200)
    const safeSaved = await clientB.get('/api/recommendations/saved').set('Origin', origin)
    assert.equal(safeSaved.body.recommendations.some((item: { id: string }) => item.id === recommendationId), false)
    const deleted = await sendJson(clientB, 'delete', `/api/recommendations/${recommendationId}/save`)
    assert.equal(deleted.status, 200)
    assert.equal(await RecommendationFeedback.countDocuments({ userId: userB.id, recommendationKey: recommendationId, saved: true }), 0)
  })
})
