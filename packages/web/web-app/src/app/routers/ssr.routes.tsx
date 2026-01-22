// MIGRATION NOTE: This factory replaces the current AppRouter.getRouter() pattern.
// Current pattern reads store at module level:
//   const strings = store.getState()?.i18n?.translations
// New pattern receives strings as parameter for SSR compatibility.
//
// LAZY LOADING MIGRATION:
// Current pattern uses React.lazy() for all routes:
//   const HomeComponent = React.lazy(() => import('../home/home-web.component'))
// SSR routes MUST use static imports to render synchronously on the server:
//   import { HomeComponent } from '../home/home-web.component'
// CSR-only routes (clientOnlyRoutes) can continue using React.lazy().
//
// PHASE 1 NOTE:
// Using simplified SSR-only Root wrapper to avoid Redux dependencies on
// auth, userProfile, and other CSR-only state.
// Phase 2+ will integrate with full app routing and Root component.

import * as React from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'
import { RateLimitComponent } from '@dx3/web-libs/ui/global/rate-limit.component'

import { WebConfigService } from '../config/config-web.service'
import { HomeComponent } from '../home/home-web.component'

/**
 * Minimal SSR Root wrapper - Phase 1 only.
 * Avoids Redux dependencies on auth, userProfile, etc.
 * Phase 2+ will integrate with the full Root component.
 */
const SsrRoot: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Outlet />
    </div>
  )
}

/**
 * Creates public routes that can be server-side rendered.
 * These routes use static imports (not React.lazy) for SSR compatibility.
 *
 * Phase 1: Only Home route with minimal SSR wrapper
 * Phase 2+: Add auth routes, shortlink, integrate with full Root component
 *
 * @param strings - i18n translations object passed from SSR or CSR context
 * @returns Route configuration for public (non-authenticated) routes
 */
export const createPublicRoutes = (strings: Record<string, string>): RouteObject[] => {
  const ROUTES = WebConfigService.getWebRoutes()

  return [
    {
      children: [
        {
          element: <HomeComponent />,
          path: ROUTES.MAIN,
        },
      ],
      element: <SsrRoot />,
      errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
    },
  ]
}

/**
 * Creates CSR-only routes that should never be server-side rendered.
 * These routes can use React.lazy() for code splitting.
 *
 * @param strings - i18n translations object
 * @returns Route configuration for CSR-only routes (rate limit, not found, etc.)
 */
export const createClientOnlyRoutes = (strings: Record<string, string>): RouteObject[] => {
  const ROUTES = WebConfigService.getWebRoutes()

  return [
    {
      element: (
        <NotFoundComponent
          notFoundHeader={strings?.NOT_FOUND}
          notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
        />
      ),
      path: ROUTES.NOT_FOUND,
    },
    {
      element: (
        <RateLimitComponent
          bodyText={strings?.YOU_HAVE_MADE_TOO_MANY_REQUESTS}
          headerText={strings?.TIMEOUT_TURBO}
        />
      ),
      path: ROUTES.LIMITED,
    },
    {
      element: (
        <NotFoundComponent
          notFoundHeader={strings?.NOT_FOUND}
          notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
        />
      ),
      path: '*',
    },
  ]
}
