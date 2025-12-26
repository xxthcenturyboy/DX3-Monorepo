/**
 * Error Shared Utilities
 *
 * Utility functions for building and parsing API error messages.
 */

import type { ErrorCodeType, ParsedApiErrorType } from './error-shared.types'

/**
 * Regex pattern to match error code at start of message.
 * Matches: "100 Error message here"
 */
const ERROR_CODE_REGEX = /^(\d{3})\s+(.*)$/

/**
 * Build a structured API error message with code prefix.
 * Format: "{code} {message}"
 *
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 * @returns Formatted error string
 *
 * @example
 * buildApiError('200', 'File upload count exceeded.')
 * // Returns: "200 File upload count exceeded."
 */
export function buildApiError(code: ErrorCodeType, message: string): string {
  return `${code} ${message}`
}

/**
 * Parse an API error message to extract code and message.
 *
 * @param errorMessage - Raw error message from API
 * @returns Parsed error with code and message
 *
 * @example
 * parseApiError('200 File upload count exceeded.')
 * // Returns: { code: '200', message: 'File upload count exceeded.' }
 *
 * parseApiError('Something went wrong')
 * // Returns: { code: null, message: 'Something went wrong' }
 */
export function parseApiError(errorMessage: string): ParsedApiErrorType {
  if (!errorMessage) {
    return { code: null, message: '' }
  }

  const match = errorMessage.match(ERROR_CODE_REGEX)

  if (match) {
    return {
      code: match[1] as ErrorCodeType,
      message: match[2],
    }
  }

  return { code: null, message: errorMessage }
}

/**
 * Check if a string is a valid error code.
 *
 * @param code - String to check
 * @returns Boolean indicating if code is valid
 */
export function isValidErrorCode(code: string | null | undefined): code is ErrorCodeType {
  if (!code) return false
  return /^\d{3}$/.test(code)
}
