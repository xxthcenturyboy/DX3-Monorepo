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
import { CacheProvider } from '@emotion/react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import { renderToPipeableStream } from 'react-dom/server'
import { Provider as ReduxProvider } from 'react-redux'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'

import { createEmotionCache } from '../app/emotion-cache'
import { i18nActions } from '../app/i18n/i18n.reducer'
import { i18nService } from '../app/i18n/i18n.service'
import { createPublicRoutes } from '../app/routers/ssr.routes'
import { createSsrStore } from '../app/store/store-ssr.redux'
import { typographyOverridesCommon } from '../app/ui/mui-themes/components/common/typography-common'
import { muiLightComponentOverrides } from '../app/ui/mui-themes/components/light'
import { muiLightPalette } from '../app/ui/mui-themes/mui-light.palette'

import { metrics } from './metrics'

const app = express()

// Middleware
app.use(compression()) // Enable gzip/brotli compression (Phase 5)
app.use(cookieParser())
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
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024), // MB
    },
    metrics: metricsData,
    uptime: Math.round(uptime),
  })
})

// SSR handler
app.get('*', async (req, res) => {
  const requestStartTime = Date.now()
  const route = req.path

  // Track request
  metrics.increment('ssr.request', { route })

  try {
    // Skip SSR if auth cookie present (authenticated users get CSR)
    if (req.cookies?.dx3_session) {
      metrics.increment('ssr.csr_fallback', { reason: 'authenticated', route })
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
      store.dispatch(i18nActions.setCurrentLocale(locale as any))
      store.dispatch(i18nActions.setInitialized(true))
    } catch (error) {
      metrics.increment('ssr.i18n_error', { locale, route })
      console.error('Failed to load i18n translations:', error)
      // Continue with default translations
      store.dispatch(i18nActions.setInitialized(true))
    }

    const strings = store.getState()?.i18n?.translations || {}

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

    // Create MUI theme (default to light for SSR)
    const theme = createTheme({
      components: muiLightComponentOverrides,
      palette: muiLightPalette,
      typography: typographyOverridesCommon,
    })

    // Serialize Redux state for client hydration
    const preloadedState = store.getState()
    const serializedState = JSON.stringify(preloadedState).replace(/</g, '\\u003c')

    // NOTE: Emotion critical CSS extraction requires full HTML string, which conflicts
    // with streaming. For streaming SSR, we accept that initial render may have FOUC
    // until emotion hydrates on client. Future: consider extracting styles synchronously
    // before streaming or using a different CSS-in-JS solution.

    // Build HTML shell (head + opening body)
    const htmlStart = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DX3</title>
  <style id="emotion-ssr-styles">
    /* Emotion styles will be injected by client hydration */
    /* Streaming SSR trades critical CSS extraction for faster TTFB */
  </style>
</head>
<body>
  <div id="root">`

    const htmlEnd = `</div>
  <script>
    window.__PRELOADED_STATE__ = ${serializedState};
  </script>
  <script src="/static/js/runtime.js"></script>
  <script src="/static/js/vendor.react.js"></script>
  <script src="/static/js/vendor.mui.js"></script>
  <script src="/static/js/lib.js"></script>
  <script src="/static/js/vendor.main.js"></script>
  <script src="/static/js/client.js"></script>
</body>
</html>`

    // Set response headers before streaming
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate') // 60s TTL
    // Note: ETag not supported with streaming (requires full content upfront)

    // Create React element to render
    const reactApp = (
      <ReduxProvider store={store}>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <StaticRouterProvider
              context={context}
              router={router}
            />
          </ThemeProvider>
        </CacheProvider>
      </ReduxProvider>
    )

    // Track HTML size
    let htmlSize = htmlStart.length + htmlEnd.length

    // Stream the response using React's streaming API
    const { pipe, abort } = renderToPipeableStream(reactApp, {
      bootstrapScripts: [], // Scripts already in htmlEnd
      onShellReady() {
        // Shell is ready - start streaming immediately for best TTFB
        const shellTime = Date.now() - requestStartTime
        metrics.histogram('ssr.shell_time', shellTime, { route })

        res.write(htmlStart)
        pipe(res)
      },
      onShellError(error) {
        // Shell failed to render - fall back to CSR
        const shellTime = Date.now() - requestStartTime
        metrics.increment('ssr.shell_error', { route })
        metrics.histogram('ssr.shell_error_time', shellTime, { route })

        console.error('SSR shell error:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.send('<html><body><div id="root"></div></body></html>')
      },
      onAllReady() {
        // All content ready - write closing tags
        const totalTime = Date.now() - requestStartTime
        metrics.histogram('ssr.total_time', totalTime, { route })
        metrics.histogram('ssr.html_size', htmlSize, { route })
        metrics.increment('ssr.success', { route })

        res.write(htmlEnd)
        res.end()
      },
      onError(error) {
        // Non-fatal error during streaming
        metrics.increment('ssr.stream_error', { route })
        console.error('SSR streaming error:', error)
      },
    })

    // Handle client disconnect
    req.on('close', () => {
      metrics.increment('ssr.client_disconnect', { route })
      abort()
    })
  } catch (error) {
    const totalTime = Date.now() - requestStartTime
    metrics.increment('ssr.handler_error', { route })
    metrics.histogram('ssr.error_time', totalTime, { route })

    console.error('SSR handler error:', error)
    // Fall back to CSR shell on any error
    res.status(500)
    res.sendFile(path.join(__dirname, '../../web-app-dist/index.html'))
  }
})

const PORT = process.env.SSR_PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 SSR server listening on http://localhost:${PORT}`)
  console.log(`📦 Serving static files from: ${path.join(__dirname, '../../web-app-dist')}`)
  console.log(`🏠 Routes: Home, Shortlink, FAQ, About, Blog (server-side rendered)`)
  console.log(`⚡ Phase 5: Streaming SSR with renderToPipeableStream`)
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
