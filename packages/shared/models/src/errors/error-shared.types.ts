/**
 * Error Shared Types
 *
 * Type definitions for the centralized error code system.
 */

import type { ERROR_CODES } from './error-shared.consts'

/**
 * Union type of all valid error codes.
 */
export type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Parsed API error structure.
 */
export type ParsedApiErrorType = {
  code: ErrorCodeType | null
  message: string
}

/**
 * Structured API error response.
 */
export type ApiErrorResponseType = {
  code: ErrorCodeType | null
  data?: unknown
  error: string
  i18nKey: string | null
  status: number
}
