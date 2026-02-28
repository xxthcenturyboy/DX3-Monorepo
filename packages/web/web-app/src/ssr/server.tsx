/**
 * SSR Server Entry Point
 *
 * Express server for server-side rendering of public routes.
 * Falls back to CSR shell for authenticated routes and errors.
 *
 * Architecture:
 * - Request-scoped: Fresh store, cache, and context per request
 * - Stateless: No in-memory caches or singletons
 * - Portable: Core SSR logic uses Web APIs (fetch, Request, Response)
 *
 * Phase 1: Home route only
 * Phase 2: Shortlink with SSR loader
 * Phase 3: Socket.IO refactor
 * Phase 4: FAQ, About, Blog components
 * Phase 5: Caching, compression, streaming SSR
 */

import * as path from 'node:path'

import { config as loadDotenv } from 'dotenv'

// Load .env so API_URL and other vars are available for SSR loaders (blog, shortlink)
loadDotenv({ path: path.join(__dirname, '../../web-app/.env') })
import { Writable } from 'node:stream'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import { renderToPipeableStream } from 'react-dom/server'
import { Provider as ReduxProvider } from 'react-redux'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'

import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import { createEmotionCache } from '../app/emotion-cache'
import { DEFAULT_LOCALE } from '../app/i18n'
import type { LocaleCode, StringKeys } from '../app/i18n'
import { i18nActions } from '../app/i18n/i18n.reducer'
import { i18nService } from '../app/i18n/i18n.service'
import { startSsrKeyTracking, stopSsrKeyTracking } from '../app/i18n/i18n-ssr-tracker'
import { createPublicRoutes } from '../app/routers/ssr.routes'
import { createSsrStore } from '../app/store/store-ssr.redux'
import { ErrorBoundary } from '../app/ui/error-boundary/error-boundary.component'
import { metrics } from './metrics'

const app = express()

// Middleware
app.use(compression()) // Enable gzip/brotli compression (Phase 5)
app.use(cookieParser())

// Proxy media requests BEFORE static - so /api/media/pub/* links work same-origin (download attribute)
// CSR uses Rspack devServer proxy; SSR needs this for links in blog posts
const API_BASE = process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:4000'
app.get('/api/media/pub/:mediaId/:variant', async (req, res) => {
  const { mediaId, variant } = req.params
  const url = `${API_BASE}/api/media/pub/${mediaId}/${variant}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return res.status(response.status).send(response.statusText)
    }
    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)
    const contentDisposition = response.headers.get('content-disposition')
    if (contentDisposition) res.setHeader('Content-Disposition', contentDisposition)
    const buffer = Buffer.from(await response.arrayBuffer())
    res.send(buffer)
  } catch (error) {
    console.error('[SSR] Media proxy error:', error)
    res.status(502).send('Bad Gateway')
  }
})

// Serve static assets but not index.html (SSR handles all routes)
app.use(express.static(path.join(__dirname, '../../web-app-dist'), { index: false }))

// Health check for load balancers
app.get('/health', (_req, res) => {
  res.status(200).send('OK')
})

// Metrics endpoint for monitoring
app.get('/metrics', (_req, res) => {
  const metricsData = metrics.getMetrics()
  const memory = metrics.getMemoryUsage()
  const uptime = metrics.getUptime()

  res.status(200).json({
    memory: {
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024), // MB
    },
    metrics: metricsData,
    uptime: Math.round(uptime),
  })
})

// Auth routes: skip SSR - auth components cause Emotion insertBefore hydration errors
const CSR_ONLY_PATHS = ['/login', '/signup']

// SSR handler
app.get('*', async (req, res) => {
  const requestStartTime = Date.now()
  const route = req.path

  // Track request
  metrics.increment('ssr.request', { route })

  try {
    // Skip non-app paths (Chrome DevTools, etc.)
    if (route.startsWith('/.well-known/')) {
      return res.status(404).send('Not Found')
    }

    // Skip SSR if auth cookie present (authenticated users get CSR)
    if (req.cookies?.dx3_session) {
      metrics.increment('ssr.csr_fallback', { reason: 'authenticated', route })
      console.log(`[SSR] Route ${route} → CSR fallback (authenticated)`)
      return res.sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
    }

    if (CSR_ONLY_PATHS.includes(route)) {
      metrics.increment('ssr.csr_fallback', { reason: 'auth_routes', route })
      console.log(`[SSR] Route ${route} → CSR fallback (auth route)`)
      return res.sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
    }

    // Create request-scoped instances (prevent cross-request pollution)
    const store = createSsrStore()
    const emotionCache = createEmotionCache()

    // Load i18n translations for SSR
    const locale = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en'
    const i18nStartTime = Date.now()
    try {
      const translations = await i18nService.loadLocale(locale)
      metrics.histogram('ssr.i18n_load_time', Date.now() - i18nStartTime, { locale, route })
      store.dispatch(i18nActions.setTranslations(translations))
      const localeCode: LocaleCode = locale === 'en' ? 'en' : DEFAULT_LOCALE
      store.dispatch(i18nActions.setCurrentLocale(localeCode))
      store.dispatch(i18nActions.setInitialized(true))
    } catch (error) {
      metrics.increment('ssr.i18n_error', { locale, route })
      console.error('Failed to load i18n translations:', error)
      // Continue with default translations
      store.dispatch(i18nActions.setInitialized(true))
    }

    const strings = store.getState()?.i18n?.translations || ({} as StringKeys)

    // Create public routes
    const publicRoutes = createPublicRoutes(strings)
    const staticHandler = createStaticHandler(publicRoutes)

    // Create Web Request from Express req
    const fetchRequest = new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
      headers: Object.entries(req.headers).reduce(
        (acc, [k, v]) => {
          if (typeof v === 'string') acc[k] = v
          return acc
        },
        {} as Record<string, string>,
      ),
      method: req.method,
    })

    // Run loaders and get routing context
    const context = await staticHandler.query(fetchRequest)

    // Handle redirects
    if (context instanceof Response) {
      if (context.status === 301 || context.status === 302) {
        return res.redirect(context.status, context.headers.get('Location') || '/')
      }
      // Handle other Response types (errors, etc.)
      return res.status(context.status).send(await context.text())
    }

    // Create static router
    const router = createStaticRouter(staticHandler.dataRoutes, context)

    // Don't serialize state yet - we need to track which i18n keys are used first

    // Helper to get string value for error boundary
    const getStringValue = (key: keyof StringKeys): string | undefined => {
      return strings[key]
    }

    // Build HTML shell template (Emotion styles injected after render)
    // Container div for Emotion - must be in body (div not valid in head)
    const buildHtmlStart = (emotionStyles: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DX3</title>
  <link rel="preload" href="/static/js/runtime.js" as="script">
  <link rel="preload" href="/static/js/vendor.react.js" as="script">
  <link rel="preload" href="/static/js/client.js" as="script">
  <style>
    /* Critical CSS - applied immediately before external stylesheets load */
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }
    /* SSR hydration loader - visible until client.js runs, fades out then removed by client */
    #ssr-hydration-loader {
      align-items: center;
      background: rgba(255,255,255,0.9);
      display: flex;
      inset: 0;
      justify-content: center;
      opacity: 1;
      position: fixed;
      transition: opacity 0.3s ease-out;
      z-index: 99999;
    }
    #ssr-hydration-loader.ssr-hydration-loader--fade-out {
      opacity: 0;
      pointer-events: none;
    }
    #ssr-hydration-loader::after {
      animation: ssr-spin 0.8s linear infinite;
      border: 3px solid #e0e0e0;
      border-radius: 50%;
      border-top-color: #1976d2;
      content: '';
      height: 40px;
      width: 40px;
    }
    @keyframes ssr-spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="ssr-hydration-loader" aria-hidden="true"></div>
  <div id="emotion-insertion-point">${emotionStyles}</div>
  <div id="root">`

    // Do NOT set headers here - defer until we know success (onAllReady) or error (onError).
    // Setting headers early causes "Can't set headers after they are sent" when onError tries sendFile.

    // Create React element to render - MUST match client.tsx hydration structure
    // Note: ThemeProvider is inside SsrRoot component (in routes), not at top level
    // StrictMode disabled - double-render can cause Emotion class name order mismatch (React 418)
    const reactApp = (
      <ErrorBoundary
            fallback={
            <NotFoundComponent
              notFoundHeader={getStringValue('NOT_FOUND')}
              notFoundText={getStringValue('WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR')}
            />
            }
          >
            <ReduxProvider store={store}>
            {/* Note: PersistGate skipped in SSR - no persisted data to rehydrate on server */}
            {/* Note: No Suspense - causes hydration mismatch (React 418) */}
            <CacheProvider value={emotionCache}>
              <StaticRouterProvider
                context={context}
                router={router}
              />
            </CacheProvider>
          </ReduxProvider>
        </ErrorBoundary>
    )

    // Start tracking i18n key access for minimal state serialization
    startSsrKeyTracking()

    // Render React app using streaming SSR (renderToPipeableStream)
    const renderStartTime = Date.now()
    let responseSent = false
    const safeSendResponse = (fn: () => void) => {
      if (responseSent) return
      responseSent = true
      fn()
    }
    try {
      const { pipe } = renderToPipeableStream(reactApp, {
        onAllReady() {
          safeSendResponse(() => {
            const renderTime = Date.now() - renderStartTime
          metrics.histogram('ssr.render_time', renderTime, { route })

          // Stop tracking and get the keys that were actually used
          const usedI18nKeys = stopSsrKeyTracking()
          console.log(`[SSR] Route ${route} used ${usedI18nKeys.length} i18n keys:`, usedI18nKeys)

          // Serialize full translations for hydration (minimal caused empty content on client)
          const fullTranslations = store.getState().i18n?.translations || ({} as StringKeys)

          const preloadedState = {
            ...store.getState(),
            i18n: {
              ...store.getState().i18n,
              defaultTranslations: {},
              translations: fullTranslations,
            },
          }
          const serializedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c')

          // Serialize hydration data: loaderData, actionData, errors (createBrowserRouter format)
          const hydrationData = {
            actionData: (context as { actionData?: unknown }).actionData,
            errors: (context as { errors?: unknown }).errors,
            loaderData: (context as { loaderData?: unknown }).loaderData,
          }
          const serializedRouterState = JSON.stringify(hydrationData).replace(/</g, '\\u003c')

          const htmlEndWithState = `</div>
  <script>
    window.__PRELOADED_STATE__ = ${serializedState};
    window.__ROUTER_STATE__ = ${serializedRouterState};
  </script>
  <script defer src="/static/js/runtime.js"></script>
  <script defer src="/static/js/vendor.react.js"></script>
  <script defer src="/static/js/vendor.mui.js"></script>
  <script defer src="/static/js/lib.js"></script>
  <script defer src="/static/js/vendor.main.js"></script>
  <script defer src="/static/js/client.js"></script>
</body>
</html>`

          // Buffer React stream, extract Emotion CSS, then send full response
          const chunks: Buffer[] = []
          const bufferStream = new Writable({
            final(callback) {
              const reactHtml = Buffer.concat(chunks).toString('utf8')

              // Extract critical Emotion CSS from rendered HTML and consolidate in head.
              // Emotion 11 default mode may inject styles in-body; extraction consolidates for faster FCP.
              const emotionServer = createEmotionServer(emotionCache)
              const emotionChunks = emotionServer.extractCriticalToChunks(reactHtml)
              const emotionStylesTag = emotionServer.constructStyleTagsFromChunks(emotionChunks)
              // Add id to first style tag for client removal (client.tsx removes #emotion-ssr-styles).
              // If extraction returns empty (e.g. Emotion default mode), placeholder remains; body styles still apply.
              const emotionStyles =
                emotionStylesTag.length > 0
                  ? emotionStylesTag.replace('<style', '<style id="emotion-ssr-styles"')
                  : '<style id="emotion-ssr-styles"></style>'

              const htmlStart = buildHtmlStart(emotionStyles)
              const fullHtml = htmlStart + reactHtml + htmlEndWithState

              res.statusCode = 200
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate')
              res.write(fullHtml)
              res.end()

              const totalTime = Date.now() - requestStartTime
              metrics.histogram('ssr.total_time', totalTime, { route })
              metrics.histogram('ssr.html_size', fullHtml.length, { route })
              metrics.histogram('ssr.i18n_keys_used', usedI18nKeys.length, { route })
              metrics.increment('ssr.success', { route })

              callback()
            },
            write(chunk: Buffer | string, _encoding, callback) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
              callback()
            },
          })

          pipe(bufferStream)
          })
        },
        onError(error) {
          stopSsrKeyTracking()
          metrics.increment('ssr.render_error', { route })
          console.error('SSR render error:', error)
          safeSendResponse(() => {
            if (!res.headersSent) {
              try {
                res.status(500)
                res.sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
              } catch (sendError) {
                if (!res.headersSent) throw sendError
              }
            }
          })
        },
      })
    } catch (error) {
      stopSsrKeyTracking()
      metrics.increment('ssr.render_error', { route })
      console.error('SSR render error:', error)
      if (!res.headersSent) {
        try {
          return res.status(500).sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
        } catch (sendError) {
          if (!res.headersSent) throw sendError
        }
      }
    }
  } catch (error) {
    const totalTime = Date.now() - requestStartTime
    metrics.increment('ssr.handler_error', { route })
    metrics.histogram('ssr.error_time', totalTime, { route })

    console.error('SSR handler error:', error)
    if (!res.headersSent) {
      try {
        res.status(500)
        res.sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
      } catch (sendError) {
        if (!res.headersSent) throw sendError
      }
    }
  }
})

const PORT = process.env.SSR_PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 SSR server listening on http://localhost:${PORT}`)
  console.log(`📦 Serving static files from: ${path.join(__dirname, '../../web-app-dist')}`)
  console.log(`🏠 Routes: Home, Shortlink, FAQ, About, Blog (server-side rendered)`)
  console.log(`⚡ Phase 5: Streaming SSR with renderToPipeableStream enabled`)
  console.log(`🗜️  Compression: gzip/brotli enabled`)
  console.log(`💾 Cache-Control: public, max-age=60s`)
  console.log(`📊 Metrics: Enabled (summary logged every 60s)\n`)

  // Memory monitoring - track every 30 seconds
  setInterval(() => {
    const memory = metrics.getMemoryUsage()
    metrics.gauge('ssr.memory.heap_used', memory.heapUsed)
    metrics.gauge('ssr.memory.heap_total', memory.heapTotal)
    metrics.gauge('ssr.memory.rss', memory.rss)
    metrics.gauge('ssr.memory.external', memory.external)

    // Warn if memory usage is high
    const heapUsedMB = memory.heapUsed / 1024 / 1024
    if (heapUsedMB > 500) {
      console.warn(`⚠️  High memory usage: ${heapUsedMB.toFixed(1)}MB heap used`)
    }
  }, 30000)

  // Log metrics summary every 60 seconds
  setInterval(() => {
    metrics.logSummary()
  }, 60000)

  // Also log on process signals for debugging
  process.on('SIGINT', () => {
    console.log('\n📊 Final metrics before shutdown:')
    metrics.logSummary()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n📊 Final metrics before shutdown:')
    metrics.logSummary()
    process.exit(0)
  })
})
