import path from 'node:path'

import { APP_NAME, APP_PREFIX } from '@dx3/models-shared'

import { allowsDevFallbacks, getEnvironment } from './config-api.service'

const __API_ROOT_DIR__ = process.env.API_ROOT_DIR || process.env.PWD || process.cwd()

const env = getEnvironment()

/**
 * Retrieves a required environment variable or throws an error.
 * This ensures the application fails fast if critical secrets are missing.
 * In local development and test environments, allows fallback to a default value for convenience.
 */
function getRequiredEnvVar(name: string, devFallback?: string): string {
  const value = env[name]
  if (value) {
    return value
  }

  // Allow fallback only in local development and test environments
  if (allowsDevFallbacks() && devFallback !== undefined) {
    // Only warn in non-test environments to avoid noise in test output
    if (env.NODE_ENV !== 'test') {
      console.warn(
        `[DEV WARNING] Using fallback value for "${name}". ` +
          `Set this environment variable for production-like testing.`,
      )
    }
    return devFallback
  }

  throw new Error(
    `CRITICAL: Required environment variable "${name}" is not set. ` +
      `The application cannot start without this configuration.`,
  )
}

/**
 * Retrieves an optional environment variable with a default value.
 * Only use for non-sensitive configuration.
 */
function getOptionalEnvVar(name: string, defaultValue: string): string {
  return env[name] || defaultValue
}

// Application constants
export const API_APP_NAME = `${APP_NAME.toLowerCase()}-api`
export const API_ERROR = 'Could not complete the request.'
export const API_ROOT = __API_ROOT_DIR__
export const ERROR_MSG_API =
  "Oops! Something went wrong. It's probably nothing you did and most likely our fault. If it happens many times, please contact support."

function resolveMaxmindGeoIpPath(): string {
  const envPath = getOptionalEnvVar('MAXMIND_GEOIP_DB_PATH', '')
  if (envPath) {
    return path.join(__dirname, envPath)
  }

  return ''
}

// REQUIRED SECRETS - Application will not start without these in production
// Local development allows fallbacks for convenience
export const CRYPT_KEY = getRequiredEnvVar(
  'CRYPT_KEY',
  'dev-only-crypt-key-do-not-use-in-production-32chars!',
)
export const JWT_ACCESS_SECRET = getRequiredEnvVar(
  'JWT_ACCESS_SECRET',
  'dev-only-access-secret-do-not-use-in-production!',
)
export const JWT_REFRESH_SECRET = getRequiredEnvVar(
  'JWT_REFRESH_SECRET',
  'dev-only-refresh-secret-do-not-use-in-production!',
)
export const OTP_SALT = getRequiredEnvVar('OTP_SALT', 'dev-only-otp-salt')
export const SENDGRID_API_KEY = getRequiredEnvVar('SENDGRID_API_KEY', 'SG.dev-only-key')

// OPTIONAL - Safe to have defaults
export const MAXMIND_GEOIP_DB_PATH = resolveMaxmindGeoIpPath()
export const POSTGRES_URI = getOptionalEnvVar('POSTGRES_URI', '')
export const S3_ACCESS_KEY_ID = getOptionalEnvVar('S3_ACCESS_KEY_ID', '')
export const S3_APP_BUCKET_NAME = `${APP_PREFIX}-bucket`
export const S3_ENDPOINT = getOptionalEnvVar('S3_ENDPOINT', '')
export const S3_PROVIDER = getOptionalEnvVar('S3_PROVIDER', '')
export const S3_REGION = getOptionalEnvVar('S3_REGION', '')
export const S3_SECRET_ACCESS_KEY = getOptionalEnvVar('S3_SECRET_ACCESS_KEY', '')
export const SENDGRID_URL = getOptionalEnvVar('SENDGRID_URL', 'http://localhost:7000')
export const UPLOAD_MAX_FILE_SIZE = getOptionalEnvVar('UPLOAD_MAX_FILE_SIZE', '50')
