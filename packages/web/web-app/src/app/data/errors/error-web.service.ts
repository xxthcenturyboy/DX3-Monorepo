/**
 * Error Web Service
 *
 * Service for resolving API error codes to localized messages.
 */

import {
  ERROR_CODE_TO_I18N_KEY,
  type ErrorCodeType,
  isValidErrorCode,
  parseApiError,
} from '@dx3/models-shared'

import { DEFAULT_STRINGS } from '../../i18n'
import { selectTranslations } from '../../i18n/i18n.selectors'
import type { InterpolationParams, StringKeyName } from '../../i18n/i18n.types'
import { store } from '../../store/store-web.redux'

/**
 * Default fallback error message.
 */
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.'

/**
 * Error resolution service for the frontend.
 * Converts API error codes to localized user-facing messages.
 */
export class ErrorWebService {
  /**
   * Get the i18n key for an error code.
   *
   * @param code - Error code
   * @returns i18n string key or null
   */
  static getI18nKey(code: ErrorCodeType | string | null): StringKeyName | null {
    if (!code || !isValidErrorCode(code)) {
      return null
    }

    const key = ERROR_CODE_TO_I18N_KEY[code]
    return key as StringKeyName | null
  }

  /**
   * Get a localized error message for an error code.
   *
   * @param code - Error code from API
   * @param fallbackMessage - Fallback if no localized message exists
   * @param params - Interpolation parameters
   * @returns Localized error message
   */
  static getLocalizedMessage(
    code: ErrorCodeType | string | null,
    fallbackMessage?: string,
    params?: InterpolationParams,
  ): string {
    const i18nKey = ErrorWebService.getI18nKey(code)

    if (!i18nKey) {
      return fallbackMessage || DEFAULT_ERROR_MESSAGE
    }

    const state = store.getState()
    const translations = selectTranslations(state)
    let message = translations[i18nKey] || DEFAULT_STRINGS[i18nKey]

    if (!message) {
      return fallbackMessage || DEFAULT_ERROR_MESSAGE
    }

    // Apply interpolation if params provided
    if (params) {
      message = message.replace(/\{(\w+)\}/g, (_match, paramKey: string) => {
        const replacement = params[paramKey]
        return replacement !== undefined ? String(replacement) : `{${paramKey}}`
      })
    }

    return message
  }

  /**
   * Parse an API error response and get a localized message.
   *
   * @param errorMessage - Raw error message from API (may contain code prefix)
   * @param params - Interpolation parameters
   * @returns Object with code and localized message
   */
  static resolveApiError(
    errorMessage: string,
    params?: InterpolationParams,
  ): { code: ErrorCodeType | null; localizedMessage: string; originalMessage: string } {
    const { code, message } = parseApiError(errorMessage)

    return {
      code,
      localizedMessage: ErrorWebService.getLocalizedMessage(code, message, params),
      originalMessage: message,
    }
  }
}
