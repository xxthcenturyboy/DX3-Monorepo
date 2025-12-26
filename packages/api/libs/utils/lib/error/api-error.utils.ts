/**
 * API Error Utilities
 *
 * Helper functions for creating standardized API errors with error codes.
 * These errors are parsed by the frontend to display localized messages.
 */

import { buildApiError, ERROR_CODES, type ErrorCodeType } from '@dx3/models-shared'

/**
 * Create an error with a standardized error code prefix.
 * The frontend will parse this to display a localized message.
 *
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message (for logging/debugging)
 * @returns Error object with formatted message
 *
 * @example
 * throw createApiError(ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED, 'File too large')
 * // Error message: "201 File too large"
 */
export function createApiError(code: ErrorCodeType, message: string): Error {
  return new Error(buildApiError(code, message))
}

/**
 * Create an error message string with a standardized error code prefix.
 *
 * @param code - Error code from ERROR_CODES
 * @param message - Human-readable error message
 * @returns Formatted error string
 */
export function createApiErrorMessage(code: ErrorCodeType, message: string): string {
  return buildApiError(code, message)
}

// Re-export ERROR_CODES for convenience
export { ERROR_CODES }
export type { ErrorCodeType }
