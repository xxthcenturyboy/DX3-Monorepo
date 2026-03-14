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
// quiet: true suppresses dotenv's console.log "injecting env" messages
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

// Load root .env first (shared config: APP_DOMAIN, etc.)
const rootEnvPath = nodePath.resolve(__dirname, '../../.env')
const rootEnv = dotenv.config({ path: rootEnvPath, quiet: true })
dotenvExpand.expand(rootEnv)

// Load api-app/.env second (API-specific config, can reference root vars)
const apiAppEnvPath = nodePath.resolve(__dirname, '../../../.env')
const apiEnv = dotenv.config({ path: apiAppEnvPath, quiet: true })
dotenvExpand.expand(apiEnv)

// Now that paths are registered, we can require @dx3/* modules
const fs = require('node:fs')
const path = require('node:path')
const axios = require('axios').default
const { TEST_USER_DATA } = require('@dx3/test-data')

/**
 * Global Setup for API E2E Tests
 *
 * This runs ONCE before all test files in a separate process.
 * It ensures the API is ready and performs authentication for all 3 in-scope roles:
 * - superadmin (USER + ADMIN + SUPER_ADMIN)
 * - admin (USER + ADMIN)
 * - user (USER)
 *
 * All role sessions are stored in .auth-cache.json for test files to read.
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

interface RoleSession {
  accessToken: string
  cookies: Record<string, string>
  cookiesRaw: string[]
  profile: any
}

interface AuthCache {
  superadmin?: RoleSession
  admin?: RoleSession
  user?: RoleSession
  error?: string
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

async function loginAs(email: string, password: string): Promise<RoleSession | null> {
  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post('/api/auth/login', {
        password,
        value: email,
      })

      if (response.data?.accessToken) {
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

  await waitForApi()

  // Set version header after health check — /api/livez is on baseRouter (no version header needed)
  axios.defaults.headers.common['X-API-Version'] = '1'

  console.log('🔐 Authenticating all role sessions...')

  const authCache: AuthCache = {}

  const superadminSession = await loginAs(
    TEST_USER_DATA.SUPERADMIN.email,
    TEST_USER_DATA.SUPERADMIN.password,
  )
  if (superadminSession) {
    authCache.superadmin = superadminSession
    console.log('  ✅ SUPER_ADMIN authenticated')
  } else {
    console.error('  ❌ SUPER_ADMIN authentication failed')
  }

  const adminSession = await loginAs(TEST_USER_DATA.ADMIN.email, TEST_USER_DATA.ADMIN.password)
  if (adminSession) {
    authCache.admin = adminSession
    console.log('  ✅ ADMIN authenticated')
  } else {
    console.error('  ❌ ADMIN authentication failed')
  }

  const userSession = await loginAs(TEST_USER_DATA.USER.email, TEST_USER_DATA.USER.password)
  if (userSession) {
    authCache.user = userSession
    console.log('  ✅ USER authenticated')
  } else {
    console.error('  ❌ USER authentication failed')
  }

  if (!authCache.superadmin && !authCache.admin && !authCache.user) {
    authCache.error = 'All authentications failed'
    console.error('❌ All role authentications failed\n')
  } else {
    console.log('✅ Role authentication complete\n')
  }

  fs.writeFileSync(AUTH_CACHE_PATH, JSON.stringify(authCache, null, 2))
}
