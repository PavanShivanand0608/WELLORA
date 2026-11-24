import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EatingPattern, Meal, Nutrition, RecommendationFeedback, User, UserSettings } from '../app/models/index.js'

test('all required Mongoose models are defined with timestamps and user-scoped indexes', () => {
  const models = [User, Meal, Nutrition, UserSettings, EatingPattern, RecommendationFeedback]
  assert.equal(models.length, 6)
  for (const model of models) {
    assert.equal(model.schema.options.timestamps, true, `${model.modelName} timestamps`)
  }

  assert.ok(User.schema.indexes().some(([fields, options]) => fields.email === 1 && options?.unique === true))
  for (const model of [Meal, Nutrition, UserSettings, EatingPattern, RecommendationFeedback]) {
    assert.ok(model.schema.path('userId'), `${model.modelName} must be scoped to a user`)
  }
  assert.ok(Nutrition.schema.indexes().some(([fields, options]) => fields.userId === 1 && fields.mealId === 1 && options?.unique === true))
  assert.ok(RecommendationFeedback.schema.indexes().some(([fields, options]) => fields.userId === 1 && fields.recommendationKey === 1 && options?.unique === true))
})

test('meal cue and pattern date-window constraints are enforced by Mongoose', async () => {
  const invalidRegularMeal = new Meal({
    userId: '507f1f77bcf86cd799439011',
    foodName: 'Demo meal',
    mealType: 'SNACK',
    logType: 'REGULAR',
    quantity: 1,
    servingUnit: 'serving',
    loggedAt: new Date(),
    eatingCue: 'CRAVING',
  })
  await assert.rejects(invalidRegularMeal.validate(), /Eating cues can only be attached to unplanned meals/)

  const invalidPattern = new EatingPattern({
    userId: '507f1f77bcf86cd799439011',
    weekStart: new Date('2026-11-30T00:00:00.000Z'),
    weekEnd: new Date('2026-11-23T00:00:00.000Z'),
    patternType: 'DEMO',
    description: 'Test only',
    evidenceCount: 1,
    confidence: 0.5,
  })
  await assert.rejects(invalidPattern.validate(), /Pattern window end must not precede its start/)
})
