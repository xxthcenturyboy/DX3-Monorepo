/**
 * Error Module - Barrel Export
 *
 * Centralized error code system for API and frontend.
 */

export { ERROR_CODE_TO_I18N_KEY, ERROR_CODES } from './error-shared.consts'
export type { ApiErrorResponseType, ErrorCodeType, ParsedApiErrorType } from './error-shared.types'
export { buildApiError, isValidErrorCode, parseApiError } from './error-shared.utils'
