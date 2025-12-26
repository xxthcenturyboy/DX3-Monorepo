/**
 * i18n Selectors
 *
 * Memoized selectors for accessing i18n state from Redux store.
 */

import { createSelector } from 'reselect'

import type { RootState } from '../store/store-web.redux'
import { DEFAULT_STRINGS, INTERPOLATION_REGEX } from './i18n.consts'
import type {
  I18nStateType,
  InterpolationParams,
  LocaleCode,
  StringKeyName,
  StringKeys,
} from './i18n.types'

/**
 * Base selector to get i18n state slice.
 */
const selectI18nState = (state: RootState): I18nStateType => state.i18n

/**
 * Create a selector for a specific translation key with interpolation support.
 * This is a factory function that returns a selector.
 *
 * @param key - The string key to translate
 * @param params - Optional interpolation parameters
 * @returns Memoized selector returning the translated string
 */
export const makeSelectTranslation = (
  key: StringKeyName,
  params?: InterpolationParams
) =>
  createSelector([selectTranslations], (translations): string => {
    let value = translations[key]

    if (value === undefined || value === null) {
      value = DEFAULT_STRINGS[key]
    }

    if (value === undefined || value === null) {
      console.warn(`[i18n] Missing translation for key: ${key}`)
      return key
    }

    if (params) {
      value = value.replace(INTERPOLATION_REGEX, (_match, paramKey: string) => {
        const replacement = params[paramKey]
        if (replacement !== undefined) {
          return String(replacement)
        }
        console.warn(`[i18n] Missing interpolation param: ${paramKey} for key: ${key}`)
        return `{${paramKey}}`
      })
    }

    return value
  })

/**
 * Select current locale code.
 */
export const selectCurrentLocale = createSelector(
  [selectI18nState],
  (i18n): LocaleCode => i18n.currentLocale
)

/**
 * Select any loading error.
 */
export const selectError = createSelector(
  [selectI18nState],
  (i18n): string | null => i18n.error
)

/**
 * Select whether i18n system is initialized.
 */
export const selectIsInitialized = createSelector(
  [selectI18nState],
  (i18n): boolean => i18n.isInitialized
)

/**
 * Select whether translations are loading.
 */
export const selectIsLoading = createSelector(
  [selectI18nState],
  (i18n): boolean => i18n.isLoading
)

/**
 * Select active translations with fallback chain.
 * Priority: loaded translations → default translations → bundled defaults
 */
export const selectTranslations = createSelector(
  [selectI18nState],
  (i18n): StringKeys => {
    return i18n.translations ?? i18n.defaultTranslations ?? DEFAULT_STRINGS
  }
)
