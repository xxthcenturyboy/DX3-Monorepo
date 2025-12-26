/**
 * i18n Redux Slice
 *
 * Dedicated Redux slice for internationalization state management.
 * Handles locale switching, translation loading, and fallback logic.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX } from '@dx3/models-shared'

import { DEFAULT_LOCALE, DEFAULT_STRINGS, I18N_ENTITY_NAME } from './i18n.consts'
import type { I18nStateType, LocaleCode, StringKeys } from './i18n.types'

/**
 * Initial state for i18n slice.
 * English translations are bundled inline as the ultimate fallback.
 */
export const i18nInitialState: I18nStateType = {
  currentLocale: DEFAULT_LOCALE,
  defaultLocale: DEFAULT_LOCALE,
  defaultTranslations: DEFAULT_STRINGS,
  error: null,
  isInitialized: false,
  isLoading: false,
  translations: null,
}

/**
 * Persist configuration for i18n state.
 * Only persists the current locale preference, not the translations themselves.
 */
export const i18nPersistConfig: PersistConfig<I18nStateType> = {
  blacklist: [
    'translations',
    'defaultTranslations',
    'isLoading',
    'isInitialized',
    'error',
  ],
  key: `${APP_PREFIX}:${I18N_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

/**
 * i18n Redux slice with actions for managing internationalization state.
 */
const i18nSlice = createSlice({
  initialState: i18nInitialState,
  name: I18N_ENTITY_NAME,
  reducers: {
    /**
     * Set loading state while fetching translations.
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },

    /**
     * Set translations after successful load.
     */
    setTranslations(state, action: PayloadAction<StringKeys>) {
      state.translations = action.payload
      state.isLoading = false
      state.isInitialized = true
      state.error = null
    },

    /**
     * Set current locale code.
     */
    setCurrentLocale(state, action: PayloadAction<LocaleCode>) {
      state.currentLocale = action.payload
    },

    /**
     * Set error state when translation loading fails.
     */
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isLoading = false
      // Fall back to default translations on error
      state.translations = state.defaultTranslations
      state.isInitialized = true
    },

    /**
     * Reset i18n state to initial values.
     */
    reset(state) {
      state.currentLocale = DEFAULT_LOCALE
      state.translations = null
      state.isLoading = false
      state.isInitialized = false
      state.error = null
    },

    /**
     * Mark i18n system as initialized.
     */
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload
    },
  },
})

export const i18nActions = i18nSlice.actions

export const i18nReducer = i18nSlice.reducer
