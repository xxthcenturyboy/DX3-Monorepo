/// <reference types="jest" />
/// <reference path="../../../types/express.d.ts" />

/**
 * Global test setup for all API tests
 * This file is loaded once before all test suites
 */

// Load environment variables from .env file
const dotenv = require('dotenv')
const path = require('node:path')

// Try loading from multiple possible locations
const envPaths = [
  path.resolve(__dirname, '../../.env'), // api-apps directory
]

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath, quiet: true })
  if (!result.error) {
    if (process.env.DEBUG_TESTS === 'true') {
      console.log(`✅ Loaded .env from: ${envPath}`)
    }
    break
  }
}

import { type ConsoleSpy, restoreConsoleSpy, setupConsoleSpy } from './helpers/console-spy'
import { customMatchers } from './helpers/test-utils'
// Import and setup all mocks
import { setupAllMocks } from './mocks/index'

// Initialize all global mocks
setupAllMocks()

// Add custom Jest matchers
expect.extend(customMatchers)

// Global console spy to suppress output during tests
// Set DEBUG_TESTS=true to see console output
let consoleSpy: ConsoleSpy | null = null

// Global test lifecycle hooks
beforeAll(() => {
  // Suppress console output unless DEBUG_TESTS is set
  if (process.env.DEBUG_TESTS === 'false') {
    consoleSpy = setupConsoleSpy(true)
  } else {
    console.log('🧪 Test suite initializing...')
  }
})

afterAll(() => {
  // Restore console methods
  if (consoleSpy) {
    restoreConsoleSpy(consoleSpy)
    consoleSpy = null
  }

  // Cleanup mocks
  jest.clearAllMocks()

  if (process.env.DEBUG_TESTS === 'true') {
    console.log('✅ Test suite completed')
  }
})

// Global beforeEach for test isolation
beforeEach(() => {
  // Clear mock calls between tests for isolation
  jest.clearAllMocks()
})

// Export test utilities for use in test files
export * from './helpers/test-utils'
export * from './mocks/index'
