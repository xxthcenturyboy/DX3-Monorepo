/**
 * Error Web Service
 *
 * Service for resolving API error codes to localized messages.
 */

import type { SerializedError } from '@reduxjs/toolkit'

import {
  ERROR_CODE_TO_I18N_KEY,
  type ErrorCodeType,
  isValidErrorCode,
  parseApiError,
} from '@dx3/models-shared'

import { DEFAULT_STRINGS } from '../../i18n'
import { selectTranslations } from '../../i18n/i18n.selectors'
import type { InterpolationParams, StringKeyName } from '../../i18n/i18n.types'
import type { CustomResponseErrorType } from '../rtk-query'

/**
 * Default fallback error message.
 */
const DEFAULT_ERROR_MESSAGE = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG

export const getErrorStringFromApiResponse = (res?: CustomResponseErrorType | SerializedError) => {
  if (res) {
    if ('localizedMessage' in res && res.localizedMessage) {
      return res.localizedMessage
    } else if ('error' in res) {
      return res.error
    }
  }

  return DEFAULT_ERROR_MESSAGE
}

/**
 * Lazy import store to avoid circular dependency issues.
 * The store imports apiWeb which may not be available during test setup.
 */
async function getStore() {
  const { store } = await import('../../store/store-web.redux')
  return store
}

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
   * Uses DEFAULT_STRINGS as fallback if store is not available.
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

    // Use DEFAULT_STRINGS directly since store access is async
    // For real-time translations, use the useApiError hook instead
    let message = DEFAULT_STRINGS[i18nKey]

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
   * Get a localized error message for an error code (async version).
   * This version accesses the store for real-time translations.
   *
   * @param code - Error code from API
   * @param fallbackMessage - Fallback if no localized message exists
   * @param params - Interpolation parameters
   * @returns Promise resolving to localized error message
   */
  static async getLocalizedMessageAsync(
    code: ErrorCodeType | string | null,
    fallbackMessage?: string,
    params?: InterpolationParams,
  ): Promise<string> {
    const i18nKey = ErrorWebService.getI18nKey(code)

    if (!i18nKey) {
      return fallbackMessage || DEFAULT_ERROR_MESSAGE
    }

    try {
      const store = await getStore()
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
    } catch {
      // Fallback to DEFAULT_STRINGS if store is not available
      let message = DEFAULT_STRINGS[i18nKey]

      if (!message) {
        return fallbackMessage || DEFAULT_ERROR_MESSAGE
      }

      if (params) {
        message = message.replace(/\{(\w+)\}/g, (_match, paramKey: string) => {
          const replacement = params[paramKey]
          return replacement !== undefined ? String(replacement) : `{${paramKey}}`
        })
      }

      return message
    }
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
