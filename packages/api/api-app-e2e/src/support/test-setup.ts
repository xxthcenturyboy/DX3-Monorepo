/** biome-ignore-all lint/suspicious/noExplicitAny: ok for any in test */
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'

import type { AuthSuccessResponseType } from '@dx3/models-shared'

/**
 * Global type declarations for test authentication state
 * These are populated from the global-setup.ts auth cache
 */
declare global {
  var globalAuthAccessToken: string | undefined
  var globalAuthCookies: Record<string, string> | undefined
  var globalAuthCookiesRaw: string[] | undefined
  var globalAuthProfile: any
  var globalAuthError: string | undefined
  var isAuthTestFile: boolean
}

interface AuthCache {
  accessToken?: string
  cookies?: Record<string, string>
  cookiesRaw?: string[]
  profile?: any
  error?: string
}

// Path to auth credentials cache (created by global-setup.ts)
const AUTH_CACHE_PATH = path.join(__dirname, '.auth-cache.json')

// Configure axios for tests
const host = process.env.HOST ?? 'localhost'
const port = process.env.PORT ?? '4000'
const schema = process.env.SCHEMA ?? 'http'
const baseURL = `${schema}://${host}:${port}`

axios.defaults.baseURL = baseURL
axios.defaults.timeout = 10000 // 10 second timeout for E2E tests

// Add request/response interceptors for better debugging
axios.interceptors.request.use(
  (config) => {
    // Uncomment for debugging: console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    return config
  },
  (error) => {
    // Uncomment for debugging: console.error('❌ Request error:', error.message);
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => {
    // Uncomment for debugging: console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response
  },
  (error) => {
    // Uncomment for debugging: console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    return Promise.reject(error)
  },
)

// Export configured axios instance for tests
global.axios = axios

/**
 * Determines if the current test file is an auth test that should
 * skip global login (since it tests auth functionality itself)
 */
function isAuthFlowTest(): boolean {
  // Jest sets expect.getState().testPath with the current test file path
  const testPath = (expect as any).getState?.()?.testPath || ''
  return testPath.includes('auth-flow') || testPath.includes('auth/auth-flow')
}

/**
 * Load auth credentials from cache file (created by global-setup.ts)
 */
function loadAuthCache(): AuthCache | null {
  try {
    if (fs.existsSync(AUTH_CACHE_PATH)) {
      const content = fs.readFileSync(AUTH_CACHE_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Failed to load auth cache:', error)
  }
  return null
}

/**
 * Setup runs before each test file
 * Loads cached auth credentials from global-setup.ts
 */
beforeAll(async () => {
  // Determine if this is an auth test file that should handle its own auth
  global.isAuthTestFile = isAuthFlowTest()

  if (global.isAuthTestFile) {
    // Auth test files handle their own authentication
    global.globalAuthAccessToken = undefined
    global.globalAuthCookies = undefined
    global.globalAuthCookiesRaw = undefined
    global.globalAuthProfile = undefined
    global.globalAuthError = undefined
    return
  }

  // Load auth from cache (created by global-setup.ts)
  const authCache = loadAuthCache()

  if (authCache?.error) {
    global.globalAuthError = authCache.error
    global.globalAuthAccessToken = undefined
    global.globalAuthCookies = undefined
    global.globalAuthCookiesRaw = undefined
    global.globalAuthProfile = undefined
    return
  }

  if (authCache?.accessToken) {
    global.globalAuthAccessToken = authCache.accessToken
    global.globalAuthCookies = authCache.cookies
    global.globalAuthCookiesRaw = authCache.cookiesRaw
    global.globalAuthProfile = authCache.profile
    global.globalAuthError = undefined

    // Warm-up request to ensure connection is established
    // This prevents the first actual test request from failing
    try {
      await axios.get('/api/livez', { timeout: 2000 })
    } catch (_e) {
      // Ignore warm-up errors
    }
  } else {
    global.globalAuthError = 'No auth cache found - global-setup may have failed'
    global.globalAuthAccessToken = undefined
    global.globalAuthCookies = undefined
    global.globalAuthCookiesRaw = undefined
    global.globalAuthProfile = undefined
  }
})

/**
 * Helper function to get auth headers from global auth state
 * Use this in tests instead of creating new AuthUtil instances
 *
 * @example
 * const request = { url: '/api/v1/user/list', headers: getGlobalAuthHeaders(), ... };
 */
export function getGlobalAuthHeaders(): Record<string, string | string[]> {
  if (global.globalAuthError) {
    throw new Error(`Cannot get auth headers: ${global.globalAuthError}`)
  }
  if (!global.globalAuthAccessToken) {
    throw new Error(
      'Global auth not initialized - ensure test file is not excluded from global login',
    )
  }
  return {
    Authorization: `Bearer ${global.globalAuthAccessToken}`,
    cookie: global.globalAuthCookiesRaw || [],
  }
}

/**
 * Get the global auth response (includes profile, accessToken)
 */
export function getGlobalAuthResponse(): AuthSuccessResponseType {
  if (global.globalAuthError) {
    throw new Error(`Cannot get auth response: ${global.globalAuthError}`)
  }
  if (!global.globalAuthAccessToken || !global.globalAuthProfile) {
    throw new Error('Global auth response not available - authentication may have failed')
  }
  return {
    accessToken: global.globalAuthAccessToken,
    profile: global.globalAuthProfile,
  }
}
