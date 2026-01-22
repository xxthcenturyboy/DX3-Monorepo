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
import type { StringKeyName } from './app/i18n'
import { createClientOnlyRoutes, createPublicRoutes } from './app/routers/ssr.routes'
import { persistor, store } from './app/store/store-web.redux'
import { ErrorBoundary } from './app/ui/error-boundary/error-boundary.component'

// Rehydrate Redux store from SSR preloaded state
interface PreloadedState {
  i18n?: {
    currentLocale?: string
    defaultLocale?: string
    defaultTranslations?: Record<string, string>
    error?: string | null
    isInitialized?: boolean
    isLoading?: boolean
    translations?: Record<string, string> | null
  }
}

declare global {
  interface Window {
    __PRELOADED_STATE__?: PreloadedState
    store: typeof store
  }
}

// Read preloaded state from SSR
const preloadedState = window.__PRELOADED_STATE__
if (preloadedState) {
  // Merge SSR state into store
  // Note: redux-persist will override this with persisted data after rehydration
  // For i18n, only currentLocale is persisted, so translations from SSR will be used
  // until I18nService loads them again
  console.log('Hydrating from SSR preloaded state:', preloadedState)
  delete window.__PRELOADED_STATE__
}

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
const router = createBrowserRouter([
  ...createPublicRoutes(strings),
  ...createClientOnlyRoutes(strings),
  // Phase 2+: Add auth routes and private routes
  // ...AuthWebRouterConfig.getRouter(),
  // ...PrivateWebRouterConfig.getRouter(),
])

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
        <PersistGate
          loading={<UiLoadingComponent pastDelay={true} />}
          persistor={persistor}
        >
          <CacheProvider value={emotionCache}>
            <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
              <RouterProvider router={router} />
            </Suspense>
          </CacheProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
