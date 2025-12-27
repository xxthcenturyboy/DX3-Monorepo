import fs from 'node:fs'

import { DEV_ENV_NAME, PROD_ENV_NAME, STAGING_ENV_NAME } from '@dx3/models-shared'

export function getEnvironment() {
  return {
    ...process.env,
  }
}

/**
 * Detect if the current process is running inside a Docker container.
 * Uses two detection methods:
 * 1. Checks for ROOT_DIR env var set to '/app' (configured in docker-compose.yml)
 * 2. Checks for /.dockerenv file (created by Docker runtime)
 *
 * @returns true if running inside a Docker container, false otherwise
 */
export function isRunningInContainer(): boolean {
  // Check for ROOT_DIR which is set in docker-compose.yml
  if (process.env.ROOT_DIR === '/app') {
    return true
  }

  // Check for Docker environment file
  try {
    fs.accessSync('/.dockerenv')
    return true
  } catch {
    return false
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
