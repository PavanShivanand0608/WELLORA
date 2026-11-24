import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EnvironmentConfigError, parseEnvironment } from '../app/config/env.js'

const requiredEnvironment = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017',
  MONGODB_DATABASE: 'wellora_test',
  JWT_SECRET: 'a-test-secret-with-at-least-thirty-two-characters',
}

test('environment parser supplies documented non-secret defaults', () => {
  const config = parseEnvironment(requiredEnvironment)
  assert.equal(config.port, 8000)
  assert.equal(config.frontendOrigin, 'http://localhost:5173')
  assert.equal(config.jwtAlgorithm, 'HS256')
})

test('environment parser rejects missing required values without echoing secrets', () => {
  assert.throws(() => parseEnvironment({}), (error: unknown) => {
    assert.ok(error instanceof EnvironmentConfigError)
    assert.ok(error.message.includes('MONGODB_URI'))
    assert.ok(error.message.includes('JWT_SECRET'))
    return true
  })
})

test('environment parser rejects invalid MongoDB URIs and weak JWT secrets', () => {
  assert.throws(() => parseEnvironment({
    ...requiredEnvironment,
    MONGODB_URI: 'https://example.test/db',
    JWT_SECRET: 'short',
  }), EnvironmentConfigError)
})

test('environment parser rejects invalid ports and frontend origins', () => {
  assert.throws(() => parseEnvironment({
    ...requiredEnvironment,
    BACKEND_PORT: '70000',
    FRONTEND_ORIGIN: 'not-a-url',
  }), EnvironmentConfigError)
})
