import { REDACTED_VALUE } from '@dx3/models-shared'

/**
 * Utility for sanitizing sensitive data from log output.
 * Prevents accidental exposure of secrets, passwords, tokens, etc.
 */

/**
 * Fields that should never be logged.
 * Uses lowercase for case-insensitive matching.
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordconfirm',
  'oldpassword',
  'newpassword',
  'code',
  'otpcode',
  'otp',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'apikey',
  'api_key',
  'signature',
  'hashword',
  'hashanswer',
  'authorization',
  'cookie',
  'creditcard',
  'credit_card',
  'cvv',
  'ssn',
  'socialsecuritynumber',
  'value',
] as const

/**
 * Sanitizes an object by redacting sensitive fields.
 * Returns a new object safe for logging.
 *
 * @param obj - The object to sanitize
 * @returns A new object with sensitive fields redacted
 */
export function sanitizeForLogging<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null
        ? sanitizeForLogging(item as Record<string, unknown>)
        : item,
    ) as unknown as T
  }

  const sanitized = { ...obj }

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()

    if (SENSITIVE_FIELDS.includes(lowerKey as (typeof SENSITIVE_FIELDS)[number])) {
      ;(sanitized as Record<string, unknown>)[key] = REDACTED_VALUE
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      ;(sanitized as Record<string, unknown>)[key] = sanitizeForLogging(
        sanitized[key] as Record<string, unknown>,
      )
    }
  }

  return sanitized
}

/**
 * Safely stringifies an object for logging, redacting sensitive fields.
 *
 * @param obj - The object to stringify
 * @param space - Number of spaces for indentation (optional)
 * @returns A JSON string with sensitive fields redacted
 */
export function safeStringify(obj: unknown, space?: number): string {
  if (obj === null || obj === undefined) {
    return String(obj)
  }

  if (typeof obj !== 'object') {
    return String(obj)
  }

  try {
    return JSON.stringify(sanitizeForLogging(obj as Record<string, unknown>), null, space)
  } catch {
    return '[Unable to stringify object]'
  }
}
