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
// Phase 2: Added auth routes and shortlink with SSR loader.

import Box from '@mui/material/Box'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import * as React from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { HEADER_API_VERSION_PROP } from '@dx3/models-shared'
import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'
import { RateLimitComponent } from '@dx3/web-libs/ui/global/rate-limit.component'

import { AboutComponent } from '../about/about-web.component'
import { BlogPostComponent } from '../blog/blog-post-web.component'
import { BlogComponent } from '../blog/blog-web.component'
import { WebConfigService } from '../config/config-web.service'
import { FaqComponent } from '../faq/faq-web.component'
import { HomeComponent } from '../home/home-web.component'
import { ShortlinkComponent } from '../shortlink/shortlink-web.component'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { AppNavBarSsr } from '../ui/menus/app-nav-bar-ssr.menu'
import { getThemeForMode } from '../ui/mui-themes/mui-theme.service'

/**
 * SSR Root wrapper with layout (navbar + content).
 * Simplified version without auth dependencies for public pages.
 * Uses AppNavBarSsr (SSR-safe navbar without Redux/Socket.IO dependencies).
 * Includes ThemeProvider to match client hydration structure.
 */
const SsrRoot: React.FC = () => {
  const topPixel = 64 // Height of navbar
  const themeState = useAppSelector((state) => state?.ui?.theme || 'light')

  // Create theme from Redux state (SSR-safe, doesn't read localStorage)
  const theme = React.useMemo(
    () => createTheme(getThemeForMode(themeState as 'light' | 'dark')),
    [themeState],
  )

  return (
    <ThemeProvider theme={theme}>
      <Box
        flexGrow={1}
        sx={{
          backgroundColor: 'background.default',
          height: '100vh',
          minHeight: '100vh',
          zIndex: 1,
        }}
      >
        <AppNavBarSsr />
        <Box
          sx={{
            height: `calc(100vh - ${topPixel}px)`,
            overflow: 'auto',
            position: 'relative',
            top: `${topPixel}px`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

/**
 * Creates public routes that can be server-side rendered.
 * These routes use static imports (not React.lazy) for SSR compatibility.
 *
 * Phase 1: Home route with minimal SSR wrapper
 * Phase 2: Shortlink with SSR loader
 * Phase 3: Socket.IO refactor completed (dynamic imports) - Auth routes remain CSR-only
 * Phase 4: FAQ, About, Blog components added with SSR support
 *
 * @param strings - i18n translations object passed from SSR or CSR context
 * @returns Route configuration for public (non-authenticated) routes
 */
export const createPublicRoutes = (strings: Record<string, string>): RouteObject[] => {
  const ROUTES = WebConfigService.getWebRoutes()
  const URLS = WebConfigService.getWebUrls()

  return [
    {
      children: [
        // Home route
        {
          element: <HomeComponent />,
          path: ROUTES.MAIN,
        },
        // NOTE: Auth routes (/login, /signup) remain CSR-only
        // Reason: Auth components deeply depend on Redux auth state (username, token, OTP, etc.)
        // which doesn't exist in SSR Redux store. Since auth forms provide no SEO value and
        // require client-side interaction anyway, CSR is the standard pattern for auth flows.
        // Socket.IO refactor (Phase 3) was completed successfully with dynamic imports.
        //
        // Shortlink route with SSR loader
        {
          element: <ShortlinkComponent />,
          errorElement: (
            <NotFoundComponent
              notFoundHeader={strings?.NOT_FOUND}
              notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
            />
          ),
          loader: async ({ params }) => {
            // SSR loader for shortlink data fetching
            const API_URL = `${URLS.API_URL}/api/`
            const token = params.token

            if (!token) {
              throw new Response('Not Found', { status: 404 })
            }

            try {
              const response = await fetch(`${API_URL}shortlink/${token}`, {
                headers: {
                  [HEADER_API_VERSION_PROP]: '1',
                  'Content-Type': 'application/json',
                },
                method: 'GET',
              })

              if (!response.ok) {
                throw new Response('Not Found', { status: 404 })
              }

              const targetUrl = await response.text()
              return { targetUrl, token }
            } catch (error) {
              console.error('Shortlink loader error:', error)
              throw new Response('Not Found', { status: 404 })
            }
          },
          path: `${ROUTES.SHORTLINK.MAIN}/:token`,
        },
        // FAQ route (Phase 4)
        {
          element: <FaqComponent />,
          path: ROUTES.FAQ,
        },
        // About route (Phase 4)
        {
          element: <AboutComponent />,
          path: ROUTES.ABOUT,
        },
        // Blog route (Phase 4)
        {
          element: <BlogComponent />,
          path: ROUTES.BLOG,
        },
        {
          element: <BlogPostComponent />,
          path: `${ROUTES.BLOG}/:slug`,
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
