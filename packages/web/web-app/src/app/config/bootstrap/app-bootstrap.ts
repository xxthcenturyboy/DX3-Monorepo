/**
 * Application Bootstrap
 *
 * Initializes application-wide services and state before rendering.
 * This function is called once during app startup.
 */

import { FingerprintWebService } from '@dx3/web-libs/utils/fingerprint-web.service'

import { i18nActions, i18nService } from '../../i18n'
import { store } from '../../store/store-web.redux'

/**
 * Bootstrap the application.
 * Initializes i18n system with user's preferred or persisted locale.
 */
export async function appBootstrap(): Promise<void> {
  await initializeI18n()
  new FingerprintWebService()
}

/**
 * Initialize the internationalization system.
 * Loads translations for the current locale with fallback support.
 */
async function initializeI18n(): Promise<void> {
  const state = store.getState()
  const persistedLocale = state.i18n?.currentLocale

  // Set loading state
  store.dispatch(i18nActions.setLoading(true))

  try {
    // Use persisted locale or detect from browser preferences
    const locale = persistedLocale || (await i18nService.getPreferredLocale())

    // Update locale in state if detected from browser
    if (!persistedLocale) {
      store.dispatch(i18nActions.setCurrentLocale(locale))
    }

    // Load translations for the locale
    const translations = await i18nService.loadLocale(locale)

    // Update state with loaded translations
    store.dispatch(i18nActions.setTranslations(translations))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize i18n'
    console.error('[app-bootstrap] i18n initialization error:', errorMessage)

    // Set error state - fallback translations will be used automatically
    store.dispatch(i18nActions.setError(errorMessage))
  }
}
