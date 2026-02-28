import { DEV_ENV_NAME, PROD_ENV_NAME, STAGING_ENV_NAME } from '@dx3/models-shared'

export function getEnvironment() {
  return {
    ...process.env,
  }
}

export function isDebug() {
  const env = getEnvironment()

  if (env.NODE_ENV === 'production') {
    return false
  }

  if (typeof env.DEBUG !== 'undefined') {
    return typeof env.DEBUG === 'string' ? env.DEBUG === 'true' : !!env.DEBUG
  }

  return true
}

export function isDev() {
  const env = getEnvironment()
  return env.NODE_ENV === DEV_ENV_NAME
}

export function isTest() {
  const env = getEnvironment()
  return env.NODE_ENV === 'test'
}

export function isProd() {
  const env = getEnvironment()
  return env.NODE_ENV === PROD_ENV_NAME
}

export function isStaging() {
  const env = getEnvironment()
  return env.NODE_ENV === STAGING_ENV_NAME
}

/**
 * Returns true if the environment allows development fallbacks.
 * This includes local development and test environments.
 */
export function allowsDevFallbacks() {
  return isDev() || isTest()
}

export function webDomain() {
  const ENV = getEnvironment()
  if (ENV) {
    return ENV.WEB_APP_URL
  }

  return ''
}

export function webUrl() {
  const ENV = getEnvironment()
  if (ENV) {
    let url = ENV.WEB_APP_URL
    if (ENV.WEB_APP_PORT?.toString() !== '80') {
      url = `${url}:${ENV.WEB_APP_PORT}`
    }
    return url
  }

  return ''
}

/**
 * Returns allowed CORS origins. In dev, includes both the main web app URL and
 * the SSR server URL so client-side fetches from the SSR origin (e.g. localhost:3001)
 * are allowed. Uses WEB_APP_SSR_PORT if set, otherwise defaults to 3001 when web app
 * is on 3000 (common local SSR setup).
 */
export function allowedCorsOrigins(): string[] {
  const base = webUrl()
  if (!base) return []

  const origins = [base]

  if (isDev() || isTest()) {
    const ENV = getEnvironment()
    const ssrPort = ENV?.WEB_APP_SSR_PORT || '3001'
    const match = base.match(/^(https?:\/\/[^/:]+)(?::\d+)?\/?$/)
    if (match) {
      const host = match[1]
      const ssrOrigin = `${host}:${ssrPort}`
      if (!origins.includes(ssrOrigin)) {
        origins.push(ssrOrigin)
      }
    }
  }

  return origins
}
