/**
 * i18n Service
 *
 * Core service for loading and managing translations.
 * Handles async fetching of locale JSON files with fallback support.
 */

import { DEFAULT_LOCALE, DEFAULT_STRINGS, LOCALES_BASE_PATH } from './i18n.consts'
import type { LocaleCode, LocalesManifest, StringKeys } from './i18n.types'

/**
 * i18n Service class for managing translation loading.
 */
export class I18nService {
  private static instance: I18nService
  private cache: Map<LocaleCode, StringKeys> = new Map()
  private manifest: LocalesManifest | null = null

  private constructor() {
    // Cache starts empty - translations are fetched from server
    // DEFAULT_STRINGS is only used as fallback when fetch fails
  }

  /**
   * Get singleton instance of I18nService.
   */
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService()
    }
    return I18nService.instance
  }

  /**
   * Load translations for a specific locale.
   * Implements fallback chain: requested locale → default locale → bundled defaults.
   *
   * @param locale - Locale code to load
   * @returns Promise resolving to loaded translations
   */
  public async loadLocale(locale: LocaleCode): Promise<StringKeys> {
    // Check cache first
    const cached = this.cache.get(locale)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${LOCALES_BASE_PATH}/${locale}.json`)

      if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale} (${response.status})`)
      }

      const translations: StringKeys = await response.json()

      // Merge with default translations to ensure all keys exist
      const mergedTranslations = this.mergeWithDefaults(translations)

      // Cache the loaded translations
      this.cache.set(locale, mergedTranslations)

      return mergedTranslations
    } catch (error) {
      console.error(`[i18n] Error loading locale ${locale}:`, error)

      // Fallback to default locale if different from requested
      if (locale !== DEFAULT_LOCALE) {
        console.warn(`[i18n] Falling back to default locale: ${DEFAULT_LOCALE}`)
        return this.loadLocale(DEFAULT_LOCALE)
      }

      // Ultimate fallback to bundled defaults
      console.warn('[i18n] Using bundled default translations')
      return DEFAULT_STRINGS
    }
  }

  /**
   * Load the locales manifest file.
   *
   * @returns Promise resolving to manifest data
   */
  public async loadManifest(): Promise<LocalesManifest> {
    if (this.manifest) {
      return this.manifest
    }

    try {
      const response = await fetch(`${LOCALES_BASE_PATH}/manifest.json`)

      if (!response.ok) {
        throw new Error(`Failed to load locales manifest (${response.status})`)
      }

      this.manifest = await response.json()
      return this.manifest as LocalesManifest
    } catch (error) {
      console.error('[i18n] Error loading manifest:', error)

      // Return default manifest
      return {
        availableLocales: [
          {
            code: DEFAULT_LOCALE,
            isRTL: false,
            name: 'English',
            nativeName: 'English',
          },
        ],
        defaultLocale: DEFAULT_LOCALE,
      }
    }
  }

  /**
   * Check if a locale is available.
   *
   * @param locale - Locale code to check
   * @returns Boolean indicating availability
   */
  public async isLocaleAvailable(locale: LocaleCode): Promise<boolean> {
    const manifest = await this.loadManifest()
    return manifest.availableLocales.some((l) => l.code === locale)
  }

  /**
   * Clear the translation cache.
   * Useful for forcing reload of translations from server.
   */
  public clearCache(): void {
    this.cache.clear()
    this.manifest = null
  }

  /**
   * Force reload translations for a locale from server.
   * Bypasses cache and fetches fresh translations.
   *
   * @param locale - Locale code to reload
   * @returns Promise resolving to fresh translations
   */
  public async reloadLocale(locale: LocaleCode): Promise<StringKeys> {
    // Remove from cache to force fresh fetch
    this.cache.delete(locale)
    return this.loadLocale(locale)
  }

  /**
   * Get browser's preferred locale that is available.
   *
   * @returns Preferred locale code or default
   */
  public async getPreferredLocale(): Promise<LocaleCode> {
    const browserLocales = navigator.languages || [navigator.language]
    const manifest = await this.loadManifest()

    for (const browserLocale of browserLocales) {
      // Try exact match first (e.g., 'en-US')
      const exactMatch = manifest.availableLocales.find((l) => l.code === browserLocale)
      if (exactMatch) {
        return exactMatch.code
      }

      // Try base language match (e.g., 'en' from 'en-US')
      const baseLocale = browserLocale.split('-')[0] as LocaleCode
      const baseMatch = manifest.availableLocales.find((l) => l.code === baseLocale)
      if (baseMatch) {
        return baseMatch.code
      }
    }

    return DEFAULT_LOCALE
  }

  /**
   * Merge loaded translations with defaults to ensure all keys exist.
   * This prevents undefined errors for missing translations.
   *
   * @param translations - Loaded translations
   * @returns Merged translations with all keys guaranteed
   */
  private mergeWithDefaults(translations: Partial<StringKeys>): StringKeys {
    return {
      ...DEFAULT_STRINGS,
      ...translations,
    }
  }
}

/**
 * Export singleton instance for convenience.
 */
export const i18nService = I18nService.getInstance()
