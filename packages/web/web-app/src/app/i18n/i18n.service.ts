/**
 * i18n Service
 *
 * Core service for loading and managing translations.
 * Handles async fetching of locale JSON files with fallback support.
 * Supports both browser (fetch) and Node.js (fs) environments for SSR.
 */

import { DEFAULT_LOCALE, DEFAULT_STRINGS, LOCALES_BASE_PATH } from './i18n.consts'
import type { LocaleCode, LocalesManifest, StringKeys } from './i18n.types'

/**
 * Check if running in Node.js environment (SSR)
 */
const isNode = typeof process !== 'undefined' && process.versions?.node !== undefined

/**
 * i18n Service class for managing translation loading.
 */
export class I18nService {
  private static instance: I18nService
  private cache: Map<string, StringKeys> = new Map()
  private manifest: LocalesManifest | null = null

  private constructor() {
    // Cache starts empty - translations are fetched from server
    // DEFAULT_STRINGS is only used as fallback when fetch fails
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService()
    }
    return I18nService.instance
  }

  public clearCache(): void {
    this.cache.clear()
    this.manifest = null
  }

  public async getPreferredLocale(): Promise<LocaleCode> {
    const browserLocales = navigator.languages || [navigator.language]
    const manifest = await this.loadManifest()

    for (const browserLocale of browserLocales) {
      const exactMatch = manifest.availableLocales.find((l) => l.code === browserLocale)
      if (exactMatch) {
        return exactMatch.code
      }

      const baseLocale = browserLocale.split('-')[0] as LocaleCode
      const baseMatch = manifest.availableLocales.find((l) => l.code === baseLocale)
      if (baseMatch) {
        return baseMatch.code
      }
    }

    return DEFAULT_LOCALE
  }

  public async isLocaleAvailable(locale: string): Promise<boolean> {
    const manifest = await this.loadManifest()
    return manifest.availableLocales.some((l) => l.code === locale)
  }

  public async loadLocale(locale: string): Promise<StringKeys> {
    const cached = this.cache.get(locale)
    if (cached) {
      return cached
    }

    try {
      let translations: StringKeys

      if (isNode) {
        // Node.js environment (SSR) - load from filesystem
        translations = await this.loadLocaleFromFs(locale)
      } else {
        // Browser environment - use fetch
        const response = await fetch(`${LOCALES_BASE_PATH}/${locale}.json`)

        if (!response.ok) {
          throw new Error(`Failed to load locale: ${locale} (${response.status})`)
        }

        translations = await response.json()
      }

      const mergedTranslations = this.mergeWithDefaults(translations)
      this.cache.set(locale, mergedTranslations)

      return mergedTranslations
    } catch (error) {
      console.error(`[i18n] Error loading locale ${locale}:`, error)

      if (locale !== DEFAULT_LOCALE) {
        console.warn(`[i18n] Falling back to default locale: ${DEFAULT_LOCALE}`)
        return this.loadLocale(DEFAULT_LOCALE)
      }

      console.warn('[i18n] Using bundled default translations')
      return DEFAULT_STRINGS
    }
  }

  /**
   * Load locale from filesystem (Node.js/SSR only)
   */
  private async loadLocaleFromFs(locale: string): Promise<StringKeys> {
    // Dynamic import to avoid bundling fs in browser code
    const fs = await import(/* webpackIgnore: true */ 'node:fs/promises')
    const path = await import(/* webpackIgnore: true */ 'node:path')

    // In SSR, locale files are in web-app-dist/assets/locales/
    // The server.js is in web-app-dist/ssr/server.js
    // So we need to go up one level (to web-app-dist) and into assets/locales
    const filePath = path.join(__dirname, '../assets/locales', `${locale}.json`)

    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as StringKeys
  }

  public async loadManifest(): Promise<LocalesManifest> {
    if (this.manifest) {
      return this.manifest
    }

    try {
      if (isNode) {
        // Node.js environment (SSR) - load from filesystem
        const fs = await import(/* webpackIgnore: true */ 'node:fs/promises')
        const path = await import(/* webpackIgnore: true */ 'node:path')
        const filePath = path.join(__dirname, '../assets/locales/manifest.json')
        const content = await fs.readFile(filePath, 'utf-8')
        this.manifest = JSON.parse(content) as LocalesManifest
      } else {
        // Browser environment - use fetch
        const response = await fetch(`${LOCALES_BASE_PATH}/manifest.json`)

        if (!response.ok) {
          throw new Error(`Failed to load locales manifest (${response.status})`)
        }

        this.manifest = await response.json()
      }

      return this.manifest as LocalesManifest
    } catch (error) {
      console.error('[i18n] Error loading manifest:', error)

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

  public async reloadLocale(locale: string): Promise<StringKeys> {
    this.cache.delete(locale)
    return this.loadLocale(locale)
  }

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
