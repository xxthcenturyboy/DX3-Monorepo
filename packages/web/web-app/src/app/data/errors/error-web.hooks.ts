/**
 * Error Web Hooks
 *
 * React hooks for error handling and localized error messages.
 */

import { useCallback, useMemo } from 'react'

import {
  ERROR_CODE_TO_I18N_KEY,
  type ErrorCodeType,
  isValidErrorCode,
  parseApiError,
} from '@dx3/models-shared'

import { useTranslation } from '../../i18n'
import type { InterpolationParams, StringKeyName } from '../../i18n/i18n.types'
import type { ResolvedErrorType } from './error-web.types'

/**
 * Default fallback error message.
 */
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.'

/**
 * Hook for resolving API errors to localized messages.
 *
 * @returns Object with error resolution functions
 *
 * @example
 * ```tsx
 * const { getErrorMessage, resolveApiError } = useApiError()
 *
 * // From error code directly
 * const message = getErrorMessage('200', 'Upload failed')
 *
 * // From raw API response
 * const { localizedMessage } = resolveApiError('200 File too large')
 * ```
 */
export function useApiError() {
  const t = useTranslation()

  /**
   * Get a localized error message for an error code.
   */
  const getErrorMessage = useCallback(
    (
      code: ErrorCodeType | string | null,
      fallbackMessage?: string,
      params?: InterpolationParams,
    ): string => {
      if (!code || !isValidErrorCode(code)) {
        return fallbackMessage || DEFAULT_ERROR_MESSAGE
      }

      const i18nKey = ERROR_CODE_TO_I18N_KEY[code] as StringKeyName | undefined

      if (!i18nKey) {
        return fallbackMessage || DEFAULT_ERROR_MESSAGE
      }

      return t(i18nKey, params)
    },
    [t],
  )

  /**
   * Parse and resolve a raw API error message.
   */
  const resolveApiError = useCallback(
    (errorMessage: string, params?: InterpolationParams): ResolvedErrorType => {
      const { code, message } = parseApiError(errorMessage)

      return {
        code,
        localizedMessage: getErrorMessage(code, message, params),
        originalMessage: message,
      }
    },
    [getErrorMessage],
  )

  /**
   * Get the i18n key for an error code (for advanced use cases).
   */
  const getI18nKey = useCallback((code: ErrorCodeType | string | null): StringKeyName | null => {
    if (!code || !isValidErrorCode(code)) {
      return null
    }
    return ERROR_CODE_TO_I18N_KEY[code] as StringKeyName | null
  }, [])

  return useMemo(
    () => ({
      getErrorMessage,
      getI18nKey,
      resolveApiError,
    }),
    [getErrorMessage, getI18nKey, resolveApiError],
  )
}
