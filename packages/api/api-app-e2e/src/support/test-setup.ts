/** biome-ignore-all lint/suspicious/noExplicitAny: ok for any in test */

import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

import type { AuthSuccessResponseType } from '@dx3/models-shared'

// Load environment variables from multiple .env files with variable expansion
// Root .env is loaded first (base config), then api-app/.env (overrides/extends)
// quiet: true suppresses dotenv's console.log "injecting env" messages
const rootEnvPath = path.resolve(__dirname, '../../../../../.env')
const rootEnv = dotenv.config({ path: rootEnvPath, quiet: true })
dotenvExpand.expand(rootEnv)

const apiAppEnvPath = path.resolve(__dirname, '../../../api-app/.env')
const apiEnv = dotenv.config({ path: apiAppEnvPath, quiet: true })
dotenvExpand.expand(apiEnv)

export type AuthRole = 'superadmin' | 'admin' | 'user'

interface RoleSession {
  accessToken: string
  cookies: Record<string, string>
  cookiesRaw: string[]
  profile: any
}

/**
 * Global type declarations for test authentication state
 * These are populated from the global-setup.ts auth cache
 */
declare global {
  var globalAuthSessions: Record<AuthRole, RoleSession | undefined>
  var globalAuthError: string | undefined
  var isAuthTestFile: boolean
}

interface AuthCache {
  superadmin?: RoleSession
  admin?: RoleSession
  user?: RoleSession
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
axios.defaults.headers.common['X-API-Version'] = '1'

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

/**
 * Auth test files (auth/auth-*.spec.ts) manage their own authentication.
 * They create AuthUtil instances directly and do not rely on the global cache.
 */
function detectAuthTestFile(): boolean {
  const testPath = (expect as any).getState?.()?.testPath || ''
  return testPath.includes('/auth/auth-')
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
  global.isAuthTestFile = detectAuthTestFile()

  // Warm-up request to ensure connection is established before any test logic runs.
  // This applies to ALL test files (including auth files that manage their own sessions).
  try {
    await axios.get('/api/livez', { timeout: 2000 })
  } catch (_e) {
    // Ignore warm-up errors
  }

  if (global.isAuthTestFile) {
    global.globalAuthSessions = { admin: undefined, superadmin: undefined, user: undefined }
    global.globalAuthError = undefined
    return
  }

  const authCache = loadAuthCache()

  if (authCache?.error) {
    global.globalAuthError = authCache.error
    global.globalAuthSessions = { admin: undefined, superadmin: undefined, user: undefined }
    return
  }

  global.globalAuthSessions = {
    admin: authCache?.admin ?? undefined,
    superadmin: authCache?.superadmin ?? undefined,
    user: authCache?.user ?? undefined,
  }
  global.globalAuthError = undefined
})

/**
 * Get auth headers for the given role.
 *
 * @example
 * const headers = getAuthHeaders('admin')
 * const headers = getAuthHeaders('user')
 */
export function getAuthHeaders(role: AuthRole): Record<string, string | string[]> {
  const session = global.globalAuthSessions?.[role]

  if (!session) {
    if (global.globalAuthError) {
      throw new Error(`Cannot get auth headers for ${role}: ${global.globalAuthError}`)
    }
    throw new Error(
      `No session found for role "${role}" — ensure global-setup authenticated this role`,
    )
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
    cookie: session.cookiesRaw || [],
  }
}

/**
 * Get auth response (accessToken + profile) for the given role.
 */
export function getAuthResponse(role: AuthRole): AuthSuccessResponseType {
  const session = global.globalAuthSessions?.[role]

  if (!session) {
    if (global.globalAuthError) {
      throw new Error(`Cannot get auth response for ${role}: ${global.globalAuthError}`)
    }
    throw new Error(`No session found for role "${role}"`)
  }

  return {
    accessToken: session.accessToken,
    profile: session.profile,
  }
}

/**
 * Backward-compatible alias for SUPER_ADMIN auth headers.
 * Prefer getAuthHeaders('superadmin') in new tests.
 */
export function getGlobalAuthHeaders(): Record<string, string | string[]> {
  return getAuthHeaders('superadmin')
}

/**
 * Backward-compatible alias for SUPER_ADMIN auth response.
 * Prefer getAuthResponse('superadmin') in new tests.
 */
export function getGlobalAuthResponse(): AuthSuccessResponseType {
  return getAuthResponse('superadmin')
}
