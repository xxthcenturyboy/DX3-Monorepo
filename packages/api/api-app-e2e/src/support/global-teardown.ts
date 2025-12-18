import fs from 'node:fs'
import path from 'node:path'

/**
 * Global Teardown for API E2E Tests
 *
 * This runs ONCE after all test files complete.
 * Cleans up the auth cache file created by global-setup.ts
 */

const AUTH_CACHE_PATH = path.join(__dirname, '.auth-cache.json')

module.exports = async () => {
  // Clean up auth cache file
  try {
    if (fs.existsSync(AUTH_CACHE_PATH)) {
      fs.unlinkSync(AUTH_CACHE_PATH)
    }
  } catch (_error) {
    // Ignore cleanup errors
  }

  console.log('\n🧹 API E2E tests completed.\n')
}
