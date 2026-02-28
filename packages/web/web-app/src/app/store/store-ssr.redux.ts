/**
 * SSR Redux Store Factory
 *
 * Creates a minimal Redux store for server-side rendering with only public-safe reducers.
 * This store is created fresh for each SSR request to avoid cross-request state pollution.
 *
 * IMPORTANT:
 * - Do NOT include auth (Login/Signup are CSR-only - auth components cause Emotion hydration errors)
 * - Do NOT include persisted user data (userProfile, privileges, etc.)
 *
 * Current included reducers:
 * - i18n: Translations and locale (public, safe to share)
 * - ui: Theme, window size (public)
 *
 * The client will rehydrate persisted data after initial render using redux-persist.
 */

import { configureStore } from '@reduxjs/toolkit'

import { i18nReducer } from '../i18n/i18n.reducer'
import { uiReducer } from '../ui/store/ui-web.reducer'

/**
 * Creates a fresh Redux store instance for SSR.
 * Each SSR request gets its own store to prevent state leakage between requests.
 *
 * @returns Configured Redux store for SSR with minimal public-safe state
 */
export const createSsrStore = () => {
  return configureStore({
    reducer: {
      i18n: i18nReducer,
      ui: uiReducer,
    },
  })
}

/**
 * Type helper for SSR store
 */
export type SsrStore = ReturnType<typeof createSsrStore>
export type SsrRootState = ReturnType<SsrStore['getState']>
export type SsrAppDispatch = SsrStore['dispatch']
