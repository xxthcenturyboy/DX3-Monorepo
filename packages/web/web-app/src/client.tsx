/**
 * Client Hydration Entry Point
 *
 * This entry is used when the page is server-side rendered.
 * It hydrates the SSR HTML with React and rehydrates the Redux store.
 *
 * Differences from main.tsx (CSR entry):
 * - Uses hydrateRoot instead of createRoot
 * - Reads window.__PRELOADED_STATE__ from SSR
 * - Uses new route factories (createPublicRoutes, createClientOnlyRoutes)
 * - Same Redux store with redux-persist for user data
 */

import { CacheProvider } from '@emotion/react'
import { StrictMode, Suspense } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

// Import global styles
import './css/styles.css'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import { createEmotionCache } from './app/emotion-cache'
import type { StringKeyName, StringKeys } from './app/i18n'
import { i18nActions } from './app/i18n/i18n.reducer'
import { createClientOnlyRoutes, createPublicRoutes } from './app/routers/ssr.routes'
import { getPersistor, store } from './app/store/store-web.redux'
import { ErrorBoundary } from './app/ui/error-boundary/error-boundary.component'
import { uiActions } from './app/ui/store/ui-web.reducer'

// Rehydrate Redux store from SSR preloaded state
interface PreloadedState {
  i18n?: {
    currentLocale?: string
    defaultLocale?: string
    defaultTranslations?: Record<string, string>
    error?: string | null
    isInitialized?: boolean
    isLoading?: boolean
    translations?: StringKeys | null
  }
  ui?: {
    theme?: string
    [key: string]: any
  }
  [key: string]: any
}

declare global {
  interface Window {
    __PRELOADED_STATE__?: PreloadedState
    __ROUTER_STATE__?: any
    store: typeof store
  }
}

// Read preloaded state and router state from SSR
const preloadedState = window.__PRELOADED_STATE__
const routerState = window.__ROUTER_STATE__
const isSSR = !!preloadedState
if (preloadedState) {
  // Apply SSR state to store BEFORE starting redux-persist
  // This prevents persist rehydration from overwriting SSR state
  if (preloadedState.i18n) {
    if (preloadedState.i18n.translations) {
      store.dispatch(i18nActions.setTranslations(preloadedState.i18n.translations))
    }
    if (preloadedState.i18n.currentLocale) {
      store.dispatch(i18nActions.setCurrentLocale(preloadedState.i18n.currentLocale as any))
    }
    if (preloadedState.i18n.isInitialized !== undefined) {
      store.dispatch(i18nActions.setInitialized(preloadedState.i18n.isInitialized))
    }
  }
  // Apply UI state (especially theme) to match server rendering
  if (preloadedState.ui?.theme) {
    store.dispatch(uiActions.themeModeSet(preloadedState.ui.theme as any))
  }
  delete window.__PRELOADED_STATE__
  delete window.__ROUTER_STATE__
}

// Create persistor only for CSR, not during SSR hydration
// For SSR: delay persistor creation until after hydration completes to avoid state changes during hydration
// For CSR: create persistor immediately
const persistor = isSSR ? null : getPersistor()

window.store = store

// Create Emotion cache for client
const emotionCache = createEmotionCache()

// Get i18n strings from store
const getStringValue = (value: StringKeyName): string | undefined => {
  const s = store?.getState()
  if (s?.i18n?.translations) {
    const stringValue = s.i18n.translations[value]
    return stringValue
  }
  return undefined
}

// Create router using SSR-compatible route factories
const strings = store.getState()?.i18n?.translations || {}
const router = createBrowserRouter(
  [
    ...createPublicRoutes(strings),
    ...createClientOnlyRoutes(strings),
    // Phase 2+: Add auth routes and private routes
    // ...AuthWebRouterConfig.getRouter(),
    // ...PrivateWebRouterConfig.getRouter(),
  ],
  {
    // Pass hydration data from SSR to avoid hydration mismatch
    hydrationData: routerState || undefined,
  },
)

// Create app component tree
// Note: PersistGate is skipped during SSR hydration to match server structure
const AppContent = (
  <CacheProvider value={emotionCache}>
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <RouterProvider router={router} />
    </Suspense>
  </CacheProvider>
)

// Hydrate the app
hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <ErrorBoundary
      fallback={
        <NotFoundComponent
          notFoundHeader={getStringValue('NOT_FOUND')}
          notFoundText={getStringValue('WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR')}
        />
      }
    >
      <Provider store={store}>
        {isSSR ? (
          // SSR hydration: Skip PersistGate to match server structure
          // Persistor will be initialized after hydration completes
          AppContent
        ) : (
          // CSR: Include PersistGate for redux-persist
          <PersistGate
            loading={<UiLoadingComponent pastDelay={true} />}
            persistor={persistor!}
          >
            {AppContent}
          </PersistGate>
        )}
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)

// Post-hydration cleanup and initialization for SSR
if (isSSR) {
  // Use setTimeout to ensure this runs after hydration completes
  setTimeout(() => {
    // Remove server-side injected emotion styles
    const ssrStyles = document.getElementById('emotion-ssr-styles')
    if (ssrStyles) {
      ssrStyles.remove()
    }

    // Now that hydration is complete, initialize redux-persist
    // This allows localStorage rehydration without interfering with SSR hydration
    getPersistor()
  }, 0)
}
