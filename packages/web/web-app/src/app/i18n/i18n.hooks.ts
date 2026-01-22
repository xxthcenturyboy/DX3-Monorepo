/**
 * i18n React Hooks
 *
 * Custom hooks for consuming translations in React components.
 * Provides type-safe translation access with interpolation support.
 */

import { useCallback, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { DEFAULT_STRINGS, INTERPOLATION_REGEX } from './i18n.consts'
import { i18nActions } from './i18n.reducer'
import {
  selectCurrentLocale,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectTranslations,
} from './i18n.selectors'
import { i18nService } from './i18n.service'
import type {
  InterpolationParams,
  LocaleCode,
  StringKeyName,
  StringKeys,
  TranslateFn,
} from './i18n.types'

/**
 * Return type for useI18n hook.
 */
export type UseI18nResult = {
  changeLocale: (locale: LocaleCode) => Promise<void>
  error: string | null
  isInitialized: boolean
  isLoading: boolean
  locale: LocaleCode
  t: TranslateFn
  translations: StringKeys
}

/**
 * Primary hook for internationalization.
 * Provides translation function and locale management.
 *
 * @example
 * ```tsx
 * const { t, locale, changeLocale } = useI18n()
 *
 * // Simple translation
 * <span>{t('LOGIN')}</span>
 *
 * // With interpolation
 * <span>{t('GREETING', { name: 'Dan' })}</span>
 *
 * // Change locale
 * await changeLocale('es')
 * ```
 */
export function useI18n(): UseI18nResult {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(selectCurrentLocale)
  const isLoading = useAppSelector(selectIsLoading)
  const isInitialized = useAppSelector(selectIsInitialized)
  const error = useAppSelector(selectError)
  const translations = useAppSelector(selectTranslations)

  /**
   * Translation function with interpolation support.
   * Memoized to prevent unnecessary re-renders.
   */
  const t: TranslateFn = useCallback(
    <K extends StringKeyName>(key: K, params?: InterpolationParams): string => {
      // Get value from translations with fallback chain
      let value = translations[key]

      // Fallback to default strings
      if (value === undefined || value === null) {
        value = DEFAULT_STRINGS[key]
      }

      // Ultimate fallback: return key itself
      if (value === undefined || value === null) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing translation for key: ${key}`)
        }
        return key
      }

      // Apply interpolation if params provided
      if (params) {
        value = value.replace(INTERPOLATION_REGEX, (_match, paramKey: string) => {
          const replacement = params[paramKey]
          if (replacement !== undefined) {
            return String(replacement)
          }
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[i18n] Missing interpolation param: ${paramKey} for key: ${key}`)
          }
          return `{${paramKey}}`
        })
      }

      return value
    },
    [translations],
  )

  /**
   * Change current locale and load translations.
   */
  const changeLocale = useCallback(
    async (newLocale: LocaleCode): Promise<void> => {
      if (newLocale === locale) {
        return
      }

      dispatch(i18nActions.setLoading(true))
      dispatch(i18nActions.setCurrentLocale(newLocale))

      try {
        const loadedTranslations = await i18nService.loadLocale(newLocale)
        dispatch(i18nActions.setTranslations(loadedTranslations))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load translations'
        dispatch(i18nActions.setError(errorMessage))
      }
    },
    [dispatch, locale],
  )

  return useMemo(
    () => ({
      changeLocale,
      error,
      isInitialized,
      isLoading,
      locale,
      t,
      translations,
    }),
    [changeLocale, error, isInitialized, isLoading, locale, t, translations],
  )
}

/**
 * Lightweight hook for translation function only.
 * Use this when you only need the translation function, not locale management.
 *
 * @example
 * ```tsx
 * const t = useTranslation()
 * return <button>{t('SUBMIT')}</button>
 * ```
 */
export function useTranslation(): TranslateFn {
  const translations = useAppSelector(selectTranslations)

  return useCallback(
    <K extends StringKeyName>(key: K, params?: InterpolationParams): string => {
      let value = translations[key]

      if (value === undefined || value === null) {
        value = DEFAULT_STRINGS[key]
      }

      if (value === undefined || value === null) {
        return key
      }

      if (params) {
        value = value.replace(INTERPOLATION_REGEX, (_match, paramKey: string) => {
          const replacement = params[paramKey]
          return replacement !== undefined ? String(replacement) : `{${paramKey}}`
        })
      }

      return value
    },
    [translations],
  )
}

/**
 * Hook to get a single translation value.
 * Useful for simple cases where you need one string.
 *
 * @param key - Translation key
 * @param params - Optional interpolation params
 * @returns Translated string
 *
 * @example
 * ```tsx
 * const loginLabel = useString('LOGIN')
 * const greeting = useString('GREETING', { name: 'Dan' })
 * ```
 */
export function useString<K extends StringKeyName>(key: K, params?: InterpolationParams): string {
  const t = useTranslation()
  return useMemo(() => t(key, params), [t, key, params])
}

/**
 * Hook to get multiple translation values at once.
 * More efficient than multiple useString calls.
 *
 * @param keys - Array of translation keys
 * @returns Object mapping keys to translated values
 *
 * @example
 * ```tsx
 * const strings = useStrings(['LOGIN', 'PASSWORD', 'USERNAME'])
 * // strings.LOGIN, strings.PASSWORD, strings.USERNAME
 * ```
 */
export function useStrings<K extends StringKeyName>(keys: K[]): Record<K, string> {
  const t = useTranslation()

  return useMemo(() => {
    const result = {} as Record<K, string>
    for (const key of keys) {
      result[key] = t(key)
    }
    return result
  }, [t, keys])
}
