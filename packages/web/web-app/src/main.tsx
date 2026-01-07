import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

// Import global styles
import './css/styles.css'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import type { StringKeyName } from './app/i18n'
import { AppRouter } from './app/routers/app.router'
import { persistor, store } from './app/store/store-web.redux'
import { ErrorBoundary } from './app/ui/error-boundary/error-boundary.component'

// @ts-expect-error - store won't exist until we create it here.
window.store = store

const root = createRoot(document.getElementById('root') as HTMLElement)

const router = AppRouter.getRouter()

const getStringValue = (value: StringKeyName): string | undefined => {
  const s = store?.getState()
  if (s?.i18n?.translations) {
    const stringValue = s.i18n.translations[value]
    return stringValue
  }

  return
}

root.render(
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
          <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
            <RouterProvider router={router} />
          </Suspense>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
