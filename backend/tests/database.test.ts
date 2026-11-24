import assert from 'node:assert/strict'
import { test } from 'node:test'
import { connectToMongo, disconnectFromMongo } from '../app/database/mongo.js'
import { testConfig } from './helpers.js'

test('MongoDB connection helper rejects an unreachable database instead of masking it', async () => {
  await assert.rejects(connectToMongo({
    ...testConfig,
    mongoUri: 'mongodb://127.0.0.1:27019',
    mongoServerSelectionTimeoutMs: 300,
  }))
  await disconnectFromMongo()
})
