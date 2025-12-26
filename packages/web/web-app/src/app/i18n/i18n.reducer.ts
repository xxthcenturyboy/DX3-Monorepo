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
    'defaultTranslations',
    'error',
    'isInitialized',
    'isLoading',
    'translations',
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
    reset(state) {
      state.currentLocale = DEFAULT_LOCALE
      state.error = null
      state.isInitialized = false
      state.isLoading = false
      state.translations = null
    },
    setCurrentLocale(state, action: PayloadAction<LocaleCode>) {
      state.currentLocale = action.payload
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isInitialized = true
      state.isLoading = false
      state.translations = state.defaultTranslations
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setTranslations(state, action: PayloadAction<StringKeys>) {
      state.error = null
      state.isInitialized = true
      state.isLoading = false
      state.translations = action.payload
    },
  },
})

export const i18nActions = i18nSlice.actions

export const i18nReducer = i18nSlice.reducer
