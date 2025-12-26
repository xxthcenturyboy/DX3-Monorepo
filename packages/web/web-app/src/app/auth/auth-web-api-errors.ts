/**
 * Auth API Error Messages
 *
 * Maps API error codes to localized error messages.
 */

import { selectTranslations } from '../i18n'
import { store } from '../store/store-web.redux'

/**
 * Get localized auth API error messages.
 *
 * @returns Record mapping error codes to localized messages
 */
export const getAuthApiErrors = (): Record<string, string> => {
  const state = store.getState()
  const translations = selectTranslations(state)

  return {
    '100': translations.COULD_NOT_LOG_YOU_IN,
  }
}
