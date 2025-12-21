/** biome-ignore-all lint/suspicious/noExplicitAny: any ok for testing */
/* eslint-disable @typescript-eslint/no-require-imports */
// Register tsconfig-paths FIRST to resolve path aliases like @dx3/* in globalSetup context
const nodePath = require('node:path')
const { register } = require('tsconfig-paths')
const tsconfigBase = require('../../../../../tsconfig.base.json')

// Resolve the baseUrl to an absolute path (tsconfig.base.json is at monorepo root)
const monorepoRoot = nodePath.resolve(__dirname, '../../../../..')
register({
  baseUrl: monorepoRoot,
  paths: tsconfigBase.compilerOptions.paths,
})

// Load environment variables from multiple .env files with variable expansion
// Root .env is loaded first (base config), then api-app/.env (overrides/extends)
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

// Load root .env first (shared config: APP_DOMAIN, etc.)
const rootEnvPath = nodePath.resolve(__dirname, '../../.env')
const rootEnv = dotenv.config({ path: rootEnvPath })
dotenvExpand.expand(rootEnv)
console.log(`📁 Loading root .env from: ${rootEnvPath}`)

// Load api-app/.env second (API-specific config, can reference root vars)
const apiAppEnvPath = nodePath.resolve(__dirname, '../../../.env')
const apiEnv = dotenv.config({ path: apiAppEnvPath })
dotenvExpand.expand(apiEnv)
console.log(`📁 Loading api-app .env from: ${apiAppEnvPath}`)

// Now that paths are registered, we can require @dx3/* modules
const fs = require('node:fs')
const path = require('node:path')
const axios = require('axios').default
const { TEST_USER_DATA } = require('@dx3/test-data')

/**
 * Global Setup for API E2E Tests
 *
 * This runs ONCE before all test files in a separate process.
 * It ensures the API is ready and performs global authentication.
 *
 * Auth credentials are stored in a temp file to share with test files.
 */

// Configure axios for setup
const host = process.env.E2E_API_DOMAIN ?? 'localhost'
const port = process.env.E2E_API_PORT ?? '4000'
const schema = process.env.E2E_API_SCHEMA ?? 'http'
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
  const TEST_EXISTING_USERNAME = TEST_USER_DATA.SUPERADMIN.username
  const TEST_EXISTING_PASSWORD = TEST_USER_DATA.SUPERADMIN.password

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
