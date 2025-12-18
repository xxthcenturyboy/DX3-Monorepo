/** biome-ignore-all lint/suspicious/noExplicitAny: any ok for testing */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'

/**
 * Global Setup for API E2E Tests
 *
 * This runs ONCE before all test files in a separate process.
 * It ensures the API is ready and performs global authentication.
 *
 * Auth credentials are stored in a temp file to share with test files.
 */

// Configure axios for setup
const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ?? '4000'
const schema = process.env.SCHEMA ?? 'http'
const baseURL = `${schema}://${host}:${port}`
axios.defaults.baseURL = baseURL
axios.defaults.timeout = 10000

// Path to store auth credentials for sharing between processes
const AUTH_CACHE_PATH = path.join(__dirname, '.auth-cache.json')

interface AuthCache {
  accessToken: string
  cookies: Record<string, string>
  cookiesRaw: string[]
  profile: any
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForApi(): Promise<void> {
  console.log(`⏳ Waiting for API at ${baseURL}...`)

  const maxRetries = 30
  let retries = maxRetries

  while (retries > 0) {
    try {
      const response = await axios.get(`/api/livez`, { timeout: 1000 })
      if (response.status === 200) {
        console.log('✅ API is ready!')
        return
      }
    } catch (_error) {
      console.log(`⏳ API not ready yet (${retries}s remaining)...`)
      await sleep(1000)
      retries--
    }
  }

  throw new Error(`❌ API failed to start within ${maxRetries}s timeout period`)
}

async function performGlobalLogin(): Promise<AuthCache | null> {
  // Test credentials for global auth (from libs/test-data)
  // These are hardcoded here because globalSetup runs in a separate process
  // without access to TypeScript path aliases
  const TEST_EXISTING_USERNAME = 'admin'
  const TEST_EXISTING_PASSWORD = 'advancedbasics1'

  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        password: TEST_EXISTING_PASSWORD,
        value: TEST_EXISTING_USERNAME,
      })

      if (response.data?.accessToken) {
        // Parse cookies from response
        const cookiesRaw = response.headers['set-cookie'] || []
        const cookies: Record<string, string> = {}

        if (Array.isArray(cookiesRaw)) {
          for (const cookie of cookiesRaw) {
            const property = cookie.slice(0, cookie.indexOf('='))
            const value = cookie.slice(cookie.indexOf('=') + 1)
            cookies[property] = value
          }
        }

        return {
          accessToken: response.data.accessToken,
          cookies,
          cookiesRaw,
          profile: response.data.profile,
        }
      }

      // No token returned - retry
      if (attempt < maxRetries) {
        const delay = attempt * 2000
        console.log(
          `⏳ Login attempt ${attempt}/${maxRetries}: No token received, retrying in ${delay}ms...`,
        )
        await sleep(delay)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error'

      if (attempt < maxRetries) {
        const delay = attempt * 2000
        console.log(
          `⏳ Login attempt ${attempt}/${maxRetries} failed (${errorMessage}), retrying in ${delay}ms...`,
        )
        await sleep(delay)
      } else {
        console.error(`❌ Login attempt ${attempt}/${maxRetries} failed: ${errorMessage}`)
      }
    }
  }

  return null
}

module.exports = async () => {
  console.log('\n🚀 Setting up API E2E environment...\n')

  // Wait for API to be ready
  await waitForApi()

  // Perform global login
  console.log('🔐 Performing global authentication...')
  const authCache = await performGlobalLogin()

  if (authCache) {
    // Store auth credentials to file for test files to read
    fs.writeFileSync(AUTH_CACHE_PATH, JSON.stringify(authCache, null, 2))
    console.log('✅ Global authentication successful\n')
  } else {
    // Write empty cache to indicate auth failed
    fs.writeFileSync(AUTH_CACHE_PATH, JSON.stringify({ error: 'Authentication failed' }))
    console.error('❌ Global authentication failed\n')
  }
}
