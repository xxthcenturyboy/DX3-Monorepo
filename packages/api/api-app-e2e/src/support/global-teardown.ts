import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { isRunningInContainer } from '@dx3/api-libs/config/config-api.service'
import { getPostgresUriForEnvironment } from '@dx3/api-libs/pg'
import { getRedisUrlForEnvironment } from '@dx3/api-libs/redis'

/**
 * Global Teardown for API E2E Tests
 *
 * This runs ONCE after all test files complete.
 * - Cleans up the auth cache file created by global-setup.ts
 * - Resets the database to its seeded state (removes all test data)
 *
 * This approach eliminates the need for individual test cleanup routes
 * like /test/:id, keeping test infrastructure out of production code.
 */

const AUTH_CACHE_PATH = path.join(__dirname, '.auth-cache.json')
const MONOREPO_ROOT = path.resolve(__dirname, '../../../../..')

/**
 * Reset database to seeded state after all E2E tests complete.
 * This ensures a clean slate for the next test run and removes
 * any data created during tests.
 */
async function resetDatabase(): Promise<void> {
  // Skip database reset if explicitly disabled (useful for debugging)
  if (process.env.E2E_SKIP_DB_RESET === 'true') {
    console.log('⏭️  Database reset skipped (E2E_SKIP_DB_RESET=true)')
    return
  }

  console.log('🔄 Resetting database to seeded state...')

  const inContainer = isRunningInContainer()
  console.log(`[Teardown] Detected ${inContainer ? 'container' : 'host'} environment`)

  try {
    // Get the correct URIs for the current environment
    // These parse from .env and swap hostname to localhost when on host
    const postgresUri = getPostgresUriForEnvironment()
    const redisUrl = getRedisUrlForEnvironment()

    // Run the seeder with --reset flag to drop tables and re-seed
    execSync('pnpm --filter @dx3/api db:seed --reset', {
      cwd: MONOREPO_ROOT,
      env: {
        ...process.env,
        // Override with environment-appropriate URIs
        POSTGRES_URI: postgresUri,
        REDIS_PORT: process.env.REDIS_PORT ?? '6379',
        REDIS_URL: redisUrl,
      },
      stdio: 'inherit',
    })

    console.log('✅ Database reset complete - ready for next test run')
  } catch (error) {
    // Log error but don't fail - database reset is best-effort cleanup
    console.error('⚠️  Database reset failed:', (error as Error).message)
    console.error('   Run "make db-reset" manually to restore seeded state')
  }
}

module.exports = async () => {
  console.log('\n🧹 Cleaning up API E2E test environment...\n')

  // Clean up auth cache file
  try {
    if (fs.existsSync(AUTH_CACHE_PATH)) {
      fs.unlinkSync(AUTH_CACHE_PATH)
      console.log('✅ Auth cache cleaned up')
    }
  } catch (_error) {
    // Ignore cleanup errors
  }

  // Reset database to remove test data
  await resetDatabase()

  console.log('\n✨ API E2E tests completed.\n')
}
