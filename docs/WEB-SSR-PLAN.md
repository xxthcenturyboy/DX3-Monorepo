# Web SSR Plan (React Router v7) for Non-Authenticated Routes

## 1. Goals
*   Server-side render all non-authenticated routes for faster first paint, SEO, and consistent metadata.
*   Keep authenticated routes client-rendered only, with no SSR data access to private user data.
*   Preserve current routing conventions while introducing a parallel SSR entry for public routes.

## 2. Non-Goals
*   No SSR for authenticated routes (`/app/*`, `/admin/*`) in this phase.
*   No large-scale redesign of app state management or existing route layouts.

## 3. Route Classification
*   **Public (SSR - Initial Scope):** Home (`/`), Auth routes (from `AuthWebRouterConfig`), Shortlink (`/shortlink/:token`), FAQ (`/faq`), About (`/about`), and Blog (`/blog`).
*   **Authenticated (CSR only):** `/app/*`, `/admin/*`, and any route that requires session or token (aligned to `PrivateWebRouterConfig` and related routers).
*   **Always CSR (Global UX):** Rate-limit, Not Found, and Global Error views remain client-rendered only.
*   **Mixed Behavior:** If a route is public but behaves differently for logged-in users, SSR should render the public variant and enhance client-side after hydration.

### 3.1 Router Mapping Table
| Router / Source | Example Paths | Auth Requirement | Component Status | SSR / CSR | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AppRouter.getRouter` | All routes | Mixed | ✅ EXISTS | CSR | Current primary router using `createBrowserRouter`. Will be refactored to consume shared route definitions. |
| `AuthWebRouterConfig` | `/login`, `/signup` | Public | ✅ EXISTS | SSR | SSR allowed; uses WebAuthWrapper component. |
| `AuthenticatedRouter` | `/` plus auth routes | Public | ✅ EXISTS | SSR | SSR renders public variant; client redirect if already authenticated. |
| `PrivateWebRouterConfig` | `/app/*` | Auth | ✅ EXISTS | CSR | Always client-rendered; no SSR loaders. |
| `AdminWebRouterConfig` | `/admin/*` | Auth (Admin) | ✅ EXISTS | CSR | Always client-rendered; no SSR loaders. |
| `SudoWebRouterConfig` | `/sudo/*` | Auth (SuperAdmin) | ✅ EXISTS | CSR | Always client-rendered; no SSR loaders. |
| Home | `/` | Public | ✅ EXISTS | SSR | Initial SSR target - ready for conversion. |
| Shortlink | `/shortlink/:token` | Public | ✅ EXISTS | SSR | Initial SSR target - uses RTK Query, needs loader. |
| FAQ | `/faq` | Public | ❌ NEEDS CREATION | SSR | Future - requires component + API endpoint. |
| About | `/about` | Public | ❌ NEEDS CREATION | SSR | Future - requires component creation. |
| Blog | `/blog` | Public | ❌ NEEDS CREATION | SSR | Future - requires component + API endpoint. |
| `RateLimitComponent` | `/limited` | Public | ✅ EXISTS | CSR | Explicit CSR-only global view. |
| `NotFoundComponent` | `/not-found`, `*` | Public | ✅ EXISTS | CSR | Explicit CSR-only global view. |
| `GlobalErrorComponent` | Route errors | Public | ✅ EXISTS | CSR | Explicit CSR-only global error UX. |

### 3.2 Migration Path from `app.router.tsx`
The existing `AppRouter.getRouter()` will be refactored to consume shared route definitions from `ssr.routes.tsx`:
1.  Extract route objects into `ssr.routes.tsx` as `publicRoutes`, `privateRoutes`, and `clientOnlyRoutes`.
2.  Update `AppRouter.getRouter()` to import and merge these shared routes.
3.  SSR entry imports only `publicRoutes`; CSR entry imports all three.
4.  Existing tests continue to pass as the route structure is unchanged.

#### 3.2.1 Architectural Challenges

**Module-Level Store Access**
The current `AppRouter.getRouter()` calls `store.getState()` to retrieve i18n strings at router creation time. This pattern is incompatible with SSR's request-scoped architecture.

**Current Pattern:**
```tsx
const strings = store.getState()?.i18n?.translations
return createBrowserRouter([...])
```

**SSR-Compatible Pattern:**
Route factories must accept strings as parameters instead of reading from module-level store:
```tsx
export const createPublicRoutes = (strings: Record<string, string>) => [...]
```

**Lazy Loading Pattern**
All routes currently use `React.lazy()` for code splitting. SSR routes must use static imports to render synchronously on the server. CSR-only routes can continue using lazy loading.

### 3.3 Current Architecture Snapshot (Pre-SSR)

#### Routing
*   **Single entry point:** `main.tsx` uses `createRoot()` with CSR only
*   **Router creation:** `AppRouter.getRouter()` returns `createBrowserRouter()` instance
*   **Lazy loading:** All routes use `React.lazy()` for code splitting
*   **Module-level state access:** Router reads from Redux store at creation time

#### Build
*   **Single rspack config:** Only web bundle (`target: 'web'`)
*   **Entry:** `./src/main.tsx`
*   **Output:** `../web-app-dist/`
*   **Code splitting:** MUI, React, and libs split into separate chunks

#### State Management
*   **Redux Toolkit:** 15 reducers, 10 with redux-persist
*   **RTK Query:** `apiWeb` slice for API communication
*   **i18n:** Service-based with manifest, caching, and fallback chain

#### Styling
*   **MUI v7:** Theme provider with light/dark modes from localStorage
*   **Emotion v11:** Integrated with MUI, no custom cache
*   **No SSR styling setup:** Critical CSS extraction not implemented

This architecture is **pure CSR**. SSR implementation is entirely greenfield.

## 4. Architecture Overview
*   **Server Entry:** Create a dedicated SSR entry that uses `react-router` v7 static routing APIs to resolve loaders and render HTML for public routes only.
*   **Client Entry:** Keep the existing `createBrowserRouter` entry (`AppRouter.getRouter`) for CSR and add hydration support for SSR-enabled public routes.
*   **Route Split:** Define a shared route tree where SSR-enabled public routes are separate from CSR-only routes, including a deliberate CSR-only group for rate-limit, not found, and global error UI.

## 5. Routing Strategy (React Router v7)
*   **Shared Route Objects:** Define route objects once and split into `publicRoutes` and `privateRoutes`.
*   **SSR Router:** Use `createStaticHandler`, `createStaticRouter`, and `StaticRouterProvider` for `publicRoutes` only.
*   **CSR Router:** Continue using `createBrowserRouter` in `AppRouter.getRouter`, and keep `RateLimitComponent`, `NotFoundComponent`, and `GlobalErrorComponent` as CSR-only elements.
*   **Authenticated Boundary:** Preserve the existing `AuthenticatedRouter` behavior (redirects authenticated users away from public routes).
*   **No Lazy Loading in SSR:** SSR routes must not use `React.lazy()`. Import components directly for SSR routes. Lazy loading is only used for CSR-only routes.

## 6. Data Loading Strategy
*   **Public Loaders Only:** Only public routes may define SSR loaders. Private routes must not rely on server loaders.
*   **No Sensitive Data:** Public loaders must avoid reading session cookies or user-specific data unless explicitly allowed and audited.
*   **Dehydration:** Serialize loader data into the HTML response via `window.__LOADER_DATA__` and rehydrate on the client.
*   **Loader Examples:**
    *   Shortlink: Fetch shortlink metadata by token.
    *   FAQ: Fetch FAQ list from API.
    *   Blog: Fetch blog post list or single post.

## 7. SSR Server Implementation
*   **Runtime:** Add a small Node.js server (Express or Fastify) for SSR inside `packages/web/web-app`.
*   **Request Handling:** For each request, determine whether it matches a public SSR-enabled route (`/`, auth routes, `/shortlink/:token`, `/faq`, `/about`, `/blog`).
*   **SSR Path:** Public routes use `createStaticHandler` to run loaders and render with `renderToPipeableStream` (React 19, Node.js streams).
*   **CSR Fallback:** Private routes, rate-limit, not found, and global error views return the standard client entry HTML with no server rendering.
*   **Error Handling:** Use `StaticRouterProvider` errors to render route-specific error boundaries or fallback HTML for public routes only.
*   **Rate Limiting:** Apply rate limiting to the SSR server itself (e.g., 100 req/s per IP) to prevent resource exhaustion.
*   **Health Check:** Expose `/health` endpoint for load balancer readiness probes.

### 7.1 Auth Cookie Detection
If the SSR server detects an auth cookie (e.g., `dx3_session`), it should:
1.  Skip SSR and return the CSR shell HTML immediately.
2.  Let the client handle authentication state and routing.
3.  This avoids SSR rendering a page the user will immediately be redirected away from.

### 7.2 Cookie Forwarding Policy
*   **Default:** Do not forward any cookies to SSR loaders.
*   **Exception:** Locale preference cookies may be forwarded for i18n.
*   **Never Forward:** Auth tokens, session cookies, or any user-identifying cookies.

### 7.3 Deployment Strategy: Node.js Now, Edge Later
The initial deployment uses a standalone Node.js server for simplicity and faster iteration. The architecture is designed to allow future migration to edge/serverless without major rewrites.

**Phase 1 (Current): Standalone Node.js**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CDN /     │────▶│  SSR Server │────▶│  NestJS API │
│   Nginx     │     │  (Node.js)  │     │  (existing) │
└─────────────┘     │  Port 3001  │     └─────────────┘
                    └─────────────┘
```
*   Deploy as a Docker container or PM2 process alongside the API.
*   Scale horizontally behind a load balancer as traffic grows.
*   Monitor SSR latency, error rates, and cache hit ratios.

**Phase 2 (Future): Edge/Serverless Migration**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CDN Edge  │────▶│  SSR Worker │────▶│  NestJS API │
│   (Global)  │     │  (Edge Fn)  │     │  (Origin)   │
└─────────────┘     └─────────────┘     └─────────────┘
```
*   Migrate to Cloudflare Workers, Vercel Edge Functions, or AWS Lambda@Edge.
*   Benefits: Global distribution, auto-scaling, reduced latency, pay-per-invocation.
*   Triggers: High traffic requiring global scale, cost optimization, or latency SLAs.

**Portability Guidelines (follow now to ease future migration):**
1.  **Use Web Fetch API** — Loaders should use `fetch()` instead of Node-specific HTTP clients (e.g., `axios` with Node adapters).
2.  **Avoid Node-only APIs** — Keep SSR render logic free of `fs`, `path`, or other Node built-ins. Use environment variables for config.
3.  **Isolate Express layer** — Keep Express-specific code (middleware, `req`/`res`) in a thin adapter. Core SSR logic should accept a Web `Request` and return a `Response`.
4.  **Use `renderToReadableStream` optionally** — The proposed code uses `renderToPipeableStream` (Node streams). When migrating to edge, swap to `renderToReadableStream` (Web streams). Abstract this behind a `renderSsr()` function.
5.  **Stateless SSR** — No in-memory caches or singletons. Each request is independent.

**Migration Checklist (for future reference):**
- [ ] Replace Express adapter with edge runtime adapter (e.g., `@cloudflare/workers-types`).
- [ ] Swap `renderToPipeableStream` for `renderToReadableStream`.
- [ ] Update build config for edge bundle (no Node externals).
- [ ] Test loaders work with edge `fetch` (no Node `http` agent).
- [ ] Deploy to edge and validate latency/error rates.
- [ ] Update CDN routing to point to edge functions.

## 8. HTML Document and Assets
*   **Head Management:** Use route-level metadata to generate title, description, canonical URL, and robots tags.
*   **JSON-LD:** For FAQ and other eligible routes, inject `FAQPage` schema where applicable.
*   **Asset Links:** Ensure SSR output uses the same bundles as CSR and includes preloads for critical CSS and fonts.
*   **Preload Directives:** Include `<link rel="preload">` for critical JS chunks, CSS, and fonts in the SSR HTML head.

## 9. Localization and i18n

### 9.1 Current i18n Implementation

The web app has a production-ready i18n system that SSR can leverage directly:

**I18nService (Singleton)**
*   Loads `/assets/locales/manifest.json` for available locales
*   Fetches translations dynamically via `/assets/locales/{locale}.json`
*   In-memory Map-based cache to avoid repeated fetches
*   Fallback chain: Browser preference → Base language → `en` → DEFAULT_STRINGS

**Redux Integration**
*   i18n reducer with `currentLocale`, `translations`, and initialization state
*   Only `currentLocale` persisted to localStorage (key: `dx3:i18n`)
*   Bootstrap flow in `app-bootstrap.ts` loads locale on app startup

**SSR Integration Path**
1.  Create SSR-specific bootstrap that calls `I18nService.loadLocale()` before rendering
2.  Pass loaded translations to `createPublicRoutes(strings)` factory
3.  Serialize locale data in `window.__PRELOADED_STATE__`
4.  Client rehydrates with same locale for consistency

### 9.2 Server-Side Locale Detection
*   **Locale Detection:** Determine locale on the server (path prefix, domain, or `Accept-Language` header).
*   **SSR Locale:** Load i18n resources on the server for public routes and include the locale in the hydration payload (`window.__LOCALE__`).
*   **Fallback:** Enforce default locale (`en`) if the requested locale is not available.

## 10. Caching and Performance
*   **Public Cache:** Enable CDN or reverse-proxy caching for public routes with short TTLs (60s) and ETag.
*   **Streaming:** Use streaming SSR (`renderToPipeableStream`) for faster first byte on heavy pages.
*   **Compression:** Ensure gzip or brotli on SSR responses.

## 11. Security
*   **Strict Separation:** Never execute private loaders in SSR.
*   **Sanitization:** Sanitize Markdown or MDX outputs server-side for public routes.
*   **Headers:** Add security headers (CSP, X-Content-Type-Options, Referrer-Policy).
*   **CSRF:** Public SSR routes are read-only; no mutations. CSRF protection is not required for SSR responses.

## 12. Redux Store SSR Hydration
The app uses Redux with `redux-persist`. SSR requires special handling:

### 12.1 Server-Side Store
*   Create a fresh Redux store instance per SSR request to avoid cross-request state leakage.
*   Populate the store with public-only data (i18n translations, feature flags).
*   Do not include any user-specific or authenticated data.

### 12.2 State Serialization
*   Serialize the Redux state into the HTML as `window.__PRELOADED_STATE__`.
*   Ensure the serialized state is JSON-safe (no functions, circular refs, or sensitive data).

### 12.3 Client-Side Hydration
*   On the client, read `window.__PRELOADED_STATE__` and pass it as the initial state to `configureStore`.
*   Allow `redux-persist` to rehydrate persisted user data after initial render.

### 12.4 Current Redux Persist Configuration

The web app already uses redux-persist extensively with 10 of 15 reducers persisted:

**Persisted Reducers:**
*   `auth` - Authentication state (tokens, session)
*   `featureFlags` - Feature flag evaluations
*   `i18n` - Current locale and translations
*   `media` - Media management state
*   `privileges` - User privilege set
*   `stats` - Stats/analytics state
*   `ui` - Theme, menu, dialogs
*   `userAdmin` - Admin user management
*   `userProfile` - User profile data

**Non-Persisted Reducers:**
*   `apiWeb` - RTK Query cache (ephemeral)
*   `dashboard`, `featureFlagsAdmin`, `home`, `notification` - Session-scoped only

**SSR Store Strategy:**
For SSR, create a minimal store with only public-safe reducers (`i18n` only). Do NOT include any persisted user data in SSR state. The client will rehydrate persisted data after initial render.

## 13. MUI/Emotion SSR Setup
MUI with Emotion requires SSR-specific configuration to avoid flash of unstyled content (FOUC):

### 13.1 Server Setup
*   Create an Emotion cache per request using `createCache` from `@emotion/cache`.
*   Wrap the app in `CacheProvider` with the request-scoped cache.
*   Use `createEmotionServer` from `@emotion/server` to extract critical CSS.
*   Inject extracted `<style>` tags into the HTML `<head>`.

### 13.2 Client Setup
*   Create a client-side Emotion cache with the same `key` as the server cache.
*   Wrap the app in `CacheProvider` to ensure hydration matches.

## 14. Build Configuration (rspack)
SSR requires separate server and client bundles:

### 14.1 Server Bundle
*   **Entry:** `packages/web/web-app/src/ssr/server.tsx`
*   **Target:** `node` (CommonJS or ESM for Node.js)
*   **Externals:** Exclude `node_modules` from the bundle (use `externalsPresets: { node: true }`)
*   **Output:** `dist/server/server.js`

### 14.2 Client Bundle
*   **Entry:** `packages/web/web-app/src/client.tsx`
*   **Target:** `web`
*   **Output:** `dist/client/` with asset manifest

### 14.3 Asset Manifest
*   Generate an asset manifest (`manifest.json`) during client build.
*   SSR server reads the manifest to inject correct `<script>` and `<link>` tags.

### 14.4 Shared Config
*   Use a shared rspack config base for common settings (aliases, loaders, plugins).
*   Extend with server-specific or client-specific overrides.

## 15. Development Workflow

### 15.1 Dev Server
*   Run client dev server with HMR on port 3000.
*   Run SSR dev server on port 3001 with watch mode.
*   Proxy `/api` requests to the backend.

### 15.2 Hot Module Replacement
*   Client HMR works as usual via rspack dev server.
*   SSR server restarts on file changes (use `nodemon` or similar).

### 15.3 Source Maps
*   Enable source maps for both server and client bundles in development.
*   Disable or use hidden source maps in production.

## 16. Graceful Degradation

### 16.1 SSR Server Failure
If the SSR server is down or overloaded:
*   CDN or reverse proxy falls back to serving the static CSR shell.
*   Client renders the page entirely client-side.

### 16.2 Loader Failure
If an SSR loader throws:
*   Catch the error and render the error boundary HTML.
*   Log the error for monitoring.
*   Optionally fall back to CSR shell if error is transient.

### 16.3 Hydration Mismatch
If hydration fails on the client:
*   React logs a warning in development.
*   In production, React recovers by re-rendering the mismatched subtree.
*   Monitor hydration errors and fix root causes.

## 17. Testing Plan
*   **Unit Tests:** Validate public route loaders and SSR HTML generation for key routes.
*   **Integration Tests:** Verify SSR path returns HTML with expected content and metadata.
*   **E2E Tests:** Validate public SSR rendering, SEO metadata presence, and hydration behavior.
*   **Auth Boundary Tests:** Confirm private routes never return SSR HTML.
*   **Hydration Tests:** Verify no hydration mismatches for SSR routes.
*   **Graceful Degradation Tests:** Verify CSR fallback when SSR server is unavailable.

## 18. Rollout Plan
*   **Phase 1:** ✅ **COMPLETED** - Implemented SSR for Home (`/`) to validate plumbing, build config, and hydration. SSR server running on port 3001 with critical CSS extraction and Redux state serialization.
*   **Phase 2:** ✅ **COMPLETED** - Added SSR for Shortlink (`/l/:token`) with loader data fetching.
*   **Phase 3:** ✅ **COMPLETED** - Socket.IO refactored to use dynamic imports (lazy loading). Auth routes remain CSR-only (standard pattern for interactive forms with no SEO value).
*   **Phase 4:** ✅ **COMPLETED** - Created FAQ, About, and Blog components with SSR support. All three routes render server-side with placeholder content.
*   **Phase 5:** Add caching (ETag, short TTL), streaming, and compression tuning.
*   **Phase 6:** Monitor errors, performance, and SEO improvements with dashboards and alerts.

### 18.1 Phase 1 Implementation Summary (2026-01-21)

**Status:** ✅ Successfully completed and tested

**What Was Built:**
1. **SSR Infrastructure Files:**
   - `src/app/routers/ssr.routes.tsx` - Route factory functions with string parameters (SSR-compatible pattern)
   - `src/app/emotion-cache.ts` - Emotion cache factory for SSR and CSR consistency
   - `src/app/store/store-ssr.redux.ts` - Minimal SSR store with only public-safe reducers (i18n, ui)
   - `src/ssr/server.tsx` - Express SSR server with React Router v7 static APIs
   - `src/client.tsx` - Client hydration entry point using `hydrateRoot`
   - `rspack.config.server.js` - Server bundle config (Node.js target, 6.54 MiB)
   - `rspack.config.client.js` - Client hydration bundle config (web target)

2. **Browser API Compatibility Fixes:**
   - `src/app/config/env.ts` - Added `typeof window !== 'undefined'` guard for window.WEB_APP_ENV
   - `src/app/ui/store/ui-web.reducer.ts` - Added SSR-safe defaults for window dimensions (1920x1080)
   - `src/app/root-web.component.tsx` - Guarded window.addEventListener/removeEventListener calls
   - `src/app/ui/mui-themes/mui-theme.service.ts` - Added localStorage guard with 'light' default

3. **Build Scripts Added:**
   - `pnpm build:ssr` - Build both server and client bundles for production
   - `pnpm build:ssr:server` / `pnpm build:ssr:client` - Individual bundle builds for development
   - `pnpm dev:ssr` - Build and start SSR server
   - `pnpm start:ssr` - Start SSR server (assumes bundles are built)

**Key Architectural Decisions:**

1. **Simplified SSR Root Wrapper:**
   - Created minimal `SsrRoot` component instead of using full `Root` component
   - Avoids Redux dependencies on auth, userProfile, privileges (intentionally excluded from SSR store)
   - Phase 2+ will address full Root component integration

2. **Minimal SSR Store:**
   - Only includes `i18n` and `ui` reducers (public, safe to share)
   - Excludes all persisted user data (auth, userProfile, media, stats, etc.)
   - Client rehydrates persisted data after initial render using redux-persist

3. **Emotion Cache Key:**
   - Changed from 'dx3' to 'css' to satisfy Emotion validation (lowercase alphabetical only)
   - Same key used on both server and client for proper hydration

4. **Request-Scoped Architecture:**
   - Fresh Redux store created per SSR request to prevent state leakage
   - Fresh Emotion cache per request for critical CSS extraction
   - i18n translations loaded from Accept-Language header (fallback: 'en')

5. **Auth Cookie Detection:**
   - Server checks for `dx3_session` cookie
   - If present, serves static index.html for CSR (avoids SSR for authenticated users)
   - Public users get SSR-rendered HTML

**Verified Functionality:**
- ✅ SSR server starts successfully on http://localhost:3001
- ✅ Home route (`/`) returns server-rendered HTML with Home component
- ✅ Critical CSS injected in `<style data-emotion>` tag
- ✅ Redux state serialized in `window.__PRELOADED_STATE__` (i18n + ui reducers)
- ✅ React Router hydration data in `window.__staticRouterHydrationData`
- ✅ Client bundle scripts correctly referenced (runtime, vendor.react, vendor.mui, lib, vendor.main, client)
- ✅ Static files served correctly from `/static/js/` (HTTP 200)

**Known Limitations (Deferred to Phase 2+):**
- Full `Root` component integration (requires addressing Redux dependencies)
- Route loaders for data fetching (Shortlink, etc.)
- Route metadata (title, description, canonical, JSON-LD)
- Error handling and fallback to CSR on SSR failure
- Hydration error boundary
- Auth route SSR (login, signup)
- Performance monitoring and metrics

### 18.2 Phase 2 Implementation Summary (2026-01-21)

**Status:** ✅ Partially completed - Shortlink SSR added, Auth routes deferred

**What Was Built:**
1. **Shortlink SSR Route:**
   - Added `/l/:token` route to `createPublicRoutes()` in `src/app/routers/ssr.routes.tsx`
   - Implemented SSR loader that fetches shortlink target from API server-side
   - Loader uses native `fetch()` API with proper headers (`HEADER_API_VERSION_PROP`)
   - Error handling: Throws 404 Response if token is invalid or API fetch fails
   - Error element renders `NotFoundComponent` with proper i18n strings

2. **Socket.IO Externalization:**
   - Updated `rspack.config.server.js` to externalize `socket.io-client` and `engine.io-client`
   - Prevents browser-specific Socket.IO code from being bundled in SSR server
   - Reduced server bundle size from 6.14 MiB to 4.88 MiB

**Architectural Decisions:**

1. **Auth Routes Deferred to Phase 3:**
   - Auth components (`WebAuthWrapper`, `WebLogin`, `WebSignup`) import `loginBootstrap`
   - `loginBootstrap` imports Socket.IO socket classes at top level
   - Socket.IO client uses browser-specific APIs that break SSR bundle compilation
   - **Solution for Phase 3:** Refactor Socket.IO imports to be lazy/conditional (dynamic imports)

2. **SSR Loader Pattern:**
   - Uses native `fetch()` instead of axios for SSR compatibility (Web API standard)
   - Fetches from `${URLS.API_URL}/api/shortlink/${token}`
   - Returns `{ targetUrl, token }` object for client hydration
   - Throws React Router `Response` object for proper error boundary handling

3. **Error Handling:**
   - SSR loader errors are caught and rendered as error boundaries
   - Error data serialized in `window.__staticRouterHydrationData` for client hydration
   - Client-side ShortlinkComponent handles redirect logic after hydration

**Verified Functionality:**
- ✅ SSR server starts successfully on http://localhost:3001
- ✅ Home route (`/`) returns server-rendered HTML (from Phase 1)
- ✅ Shortlink route (`/l/:token`) accessible and returns SSR HTML
- ✅ Invalid shortlink tokens render error boundary with "Not Found" message
- ✅ Critical CSS injected in `<style data-emotion>` tag
- ✅ Redux state serialized in `window.__PRELOADED_STATE__`
- ✅ React Router hydration data includes error state for failed loaders
- ✅ No Socket.IO bundling errors in server build

**Known Limitations (Deferred to Phase 3+):**
- Auth routes SSR requires Socket.IO refactor
- Route metadata (title, description, canonical) not yet implemented
- No caching headers (ETag, Cache-Control) on SSR responses
- Shortlink loader always fetches (no cache, relies on API-side caching)
- Performance monitoring not yet implemented

### 18.3 Phase 3 Implementation Summary (2026-01-21)

**Status:** ✅ Completed - Socket.IO refactor successful, auth routes remain CSR-only by design

**What Was Built:**
1. **Socket.IO Dynamic Import Refactor:**
   - Refactored `packages/web/web-app/src/app/config/bootstrap/login-bootstrap.ts:57-92`
   - Removed top-level imports of `NotificationWebSockets` and `FeatureFlagWebSockets`
   - Implemented `connectToSockets()` as async function with dynamic imports using `Promise.all()`
   - Added browser environment check: `if (typeof window === 'undefined') return`
   - Socket imports now code-split into separate chunks (20.3 KiB and 18.3 KiB)
   - Sockets connect at identical moments (post-login, post-signup, app mount for authenticated users)

2. **SSR Bundle Optimization:**
   - Socket.IO externalized in `rspack.config.server.js` (prevents browser-specific APIs in Node bundle)
   - Server bundle reduced from 6.11 MiB (with auth components) to 4.88 MiB (final)
   - Dynamic imports only load client-side, never during SSR rendering

**Architectural Decisions:**

1. **Auth Routes Remain CSR-Only (By Design):**
   - Investigation revealed auth components deeply depend on Redux `auth` state (username, token, OTP, etc.)
   - SSR Redux store only includes public-safe reducers (i18n, ui) - no `auth` reducer
   - Auth forms provide zero SEO value (search engines don't need to see login forms)
   - Interactive forms require client-side state management anyway
   - **Industry Standard:** Auth routes are CSR-only in most production SSR implementations
   - Attempted SSR resulted in: `Cannot read properties of undefined (reading 'username')`
   - **Decision:** Document auth as CSR-only in `ssr.routes.tsx:67-72` with clear rationale

2. **Socket.IO Refactor Success:**
   - Dynamic imports prevent SSR bundle compilation errors
   - Browser-only code never executes during SSR (guarded by `typeof window`)
   - No impact on user experience - sockets connect at same moments as before
   - Solves original Phase 2 blocker without compromising functionality

**Verified Functionality:**
- ✅ SSR server builds successfully with Socket.IO refactored
- ✅ Socket.IO classes load dynamically only in browser
- ✅ Home route (`/`) returns SSR HTML (HTTP 200)
- ✅ Shortlink route (`/l/:token`) returns SSR HTML with loader data (HTTP 200)
- ✅ Auth routes accessible via CSR (standard React Router lazy loading)
- ✅ No Socket.IO bundling errors or runtime errors
- ✅ Login/signup flows work correctly (sockets connect post-authentication)

**Key Files Modified:**
- `packages/web/web-app/src/app/config/bootstrap/login-bootstrap.ts` - Dynamic Socket.IO imports
- `packages/web/web-app/src/app/routers/ssr.routes.tsx` - Documented auth as CSR-only
- `packages/web/web-app/rspack.config.server.js` - Externalized Socket.IO (no changes this phase)

**Known Limitations (Deferred to Phase 4+):**
- Auth routes remain CSR-only (appropriate pattern, no action needed)
- Route metadata (title, description, canonical) not yet implemented
- No caching headers (ETag, Cache-Control) on SSR responses
- FAQ, About, Blog components don't exist yet (create before adding SSR)
- Performance monitoring not yet implemented

### 18.4 Phase 4 Implementation Summary (2026-01-22)

**Status:** ✅ Completed - FAQ, About, and Blog components created with SSR support

**What Was Built:**
1. **Public Page Components:**
   - Created `packages/web/web-app/src/app/faq/faq-web.component.tsx`
     - FAQ accordion component with placeholder questions/answers
     - Uses MUI Accordion for expandable FAQ items
     - Includes document title management via `setDocumentTitle()`
   - Created `packages/web/web-app/src/app/about/about-web.component.tsx`
     - About page with mission, technology stack, and contact sections
     - Uses `APP_NAME` and `APP_DESCRIPTION` from shared constants
     - Responsive grid layout with MUI Container
   - Created `packages/web/web-app/src/app/blog/blog-web.component.tsx`
     - Blog listing component with placeholder posts
     - Card-based layout for blog post previews
     - Includes post title, date, and content excerpt

2. **Route Configuration:**
   - Updated `packages/web/web-app/src/app/config/config-web.service.ts`
     - Added route constants: `ABOUT: '/about'`, `BLOG: '/blog'`, `FAQ: '/faq'`
     - Updated `getNoRedirectRoutes()` to include new public routes (alphabetically sorted)
   - Updated `packages/web/web-app/src/app/routers/ssr.routes.tsx`
     - Added static imports for FAQ, About, and Blog components
     - Added route definitions in `createPublicRoutes()` function
     - Updated Phase 4 comment: "FAQ, About, Blog components added with SSR support"

3. **Internationalization:**
   - Updated `packages/web/web-app/src/assets/locales/en.json`
     - Added `ABOUT: "About"`, `ABOUT_PAGE_TITLE: "About Us"`
     - Added `BLOG: "Blog"`, `BLOG_PAGE_TITLE: "Blog"`
     - Added `FAQ: "FAQ"`, `FAQ_PAGE_TITLE: "Frequently Asked Questions"`
     - All strings placed in correct alphabetical order

**Architectural Decisions:**

1. **Placeholder Content Pattern:**
   - FAQ, About, and Blog components use hardcoded placeholder data
   - Future enhancement: Add SSR loaders to fetch data from API
   - Placeholder content provides immediate SSR functionality while API endpoints are built

2. **No Data Loaders (Phase 4):**
   - Components render static placeholder content without API calls
   - SSR works immediately without backend dependencies
   - Future phases can add loaders for FAQ API and blog API endpoints

3. **Consistent Component Patterns:**
   - All components follow Home component structure
   - Use Fade animation with `FADE_TIMEOUT_DUR` constant
   - Document title management via `setDocumentTitle()` hook
   - Responsive layouts with MUI Container and Grid

**Verified Functionality:**
- ✅ FAQ component created with accordion UI
- ✅ About component created with mission and tech stack sections
- ✅ Blog component created with card-based post listing
- ✅ Route constants added to WebConfigService (alphabetically sorted)
- ✅ SSR routes configuration updated with new components
- ✅ i18n strings added (alphabetically sorted)
- ✅ SSR server builds successfully (bundle size: 5.04 MiB)
- ✅ `/faq` route returns HTTP 200 with SSR HTML
- ✅ `/about` route returns HTTP 200 with SSR HTML
- ✅ `/blog` route returns HTTP 200 with SSR HTML
- ✅ FAQ page content verified: "What is DX3" present in SSR HTML
- ✅ About page content verified: "Our Mission" present in SSR HTML
- ✅ Blog page content verified: "Latest Updates" present in SSR HTML

**Key Files Created:**
- `packages/web/web-app/src/app/faq/faq-web.component.tsx` - FAQ page component
- `packages/web/web-app/src/app/about/about-web.component.tsx` - About page component
- `packages/web/web-app/src/app/blog/blog-web.component.tsx` - Blog page component

**Key Files Modified:**
- `packages/web/web-app/src/app/config/config-web.service.ts` - Added route constants
- `packages/web/web-app/src/app/routers/ssr.routes.tsx` - Added FAQ/About/Blog routes
- `packages/web/web-app/src/assets/locales/en.json` - Added i18n strings

**Known Limitations (Deferred to Phase 5+):**
- FAQ and Blog components use placeholder data (no API loaders yet)
- Route metadata (title, description, canonical, JSON-LD) not yet implemented
- No caching headers (ETag, Cache-Control) on SSR responses
- Performance monitoring not yet implemented

## 19. Implementation Checklist

### Prerequisites (Must Complete First)
- [x] **Audit module-level store access** in AppRouter and other router configs
- [x] **Document current lazy loading pattern** and identify all `React.lazy()` usage
- [x] **Install missing dependencies**: `express`, `@emotion/server`, `cookie-parser`
- [x] **Create missing public components** (FAQ, About, Blog) OR defer to Phase 3+

### SSR Infrastructure (Phase 1) ✅ COMPLETED
- [x] Add `publicRoutes`, `privateRoutes`, and `clientOnlyRoutes` definitions in `ssr.routes.tsx`.
- [x] Refactor `AppRouter.getRouter()` to accept strings parameter instead of reading from store
- [x] Add rspack config for server bundle (`target: 'node'`).
- [x] Add rspack config for client bundle with asset manifest.
- [x] Add SSR entry (`server.tsx`) with React Router v7 static APIs.
- [x] Add CSR hydration entry (`client.tsx`) that reuses shared route definitions.
- [x] Add Emotion SSR setup with `CacheProvider` and critical CSS extraction.
- [x] Add Redux SSR hydration with `window.__PRELOADED_STATE__`.
- [x] Ensure `RateLimitComponent`, `NotFoundComponent`, and `GlobalErrorComponent` stay CSR-only.

### Data Loading and Metadata (Phase 2-3) ✅ COMPLETED
- [x] Add SSR-safe loader for Shortlink route (Phase 2)
- [x] Refactor Socket.IO imports with dynamic imports (Phase 3)
- [x] Auth routes documented as CSR-only by design (Phase 3 - industry standard)
- [x] Locale detection and i18n preload for SSR responses (Phase 1)
- [x] Auth cookie detection to skip SSR for authenticated users (Phase 1)
- [ ] Add SSR-safe loaders for FAQ and Blog routes (Phase 4 - components don't exist yet)
- [ ] Add route metadata (title, description, canonical, JSON-LD where applicable) (Phase 4+)

### Production Readiness (Phase 4+)
- [ ] Add rate limiting to SSR server.
- [ ] Add health check endpoint.
- [ ] Add SSR/CSR boundary tests and E2E tests for public routes.
- [ ] Add monitoring and alerting for SSR errors.

## 20. Proposed Code (Illustrative)

### 20.1 Shared Route Split
```tsx
// packages/web/web-app/src/app/routers/ssr.routes.tsx

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

import type { RouteObject } from 'react-router'

import { AboutComponent } from '../about/about-web.component'
import { AuthWebRouterConfig } from '../auth/auth-web.router'
import { BlogComponent } from '../blog/blog-web.component'
import { WebConfigService } from '../config/config-web.service'
import { FaqComponent } from '../faq/faq-web.component'
import { HomeComponent } from '../home/home-web.component'
import { Root } from '../root-web.component'
import { ShortlinkComponent } from '../shortlink/shortlink-web.component'
import { AuthenticatedRouter } from './authenticated.router'
import { PrivateWebRouterConfig } from './private.router'

// Route factory accepts i18n strings to avoid module-level store access
export const createPublicRoutes = (strings: Record<string, string>): RouteObject[] => {
  const ROUTES = WebConfigService.getWebRoutes()

  return [
    {
      children: [
        {
          children: [
            { element: <HomeComponent />, path: ROUTES.MAIN },
          ],
          element: <AuthenticatedRouter />,
        },
        ...AuthWebRouterConfig.getRouter(),
        {
          element: <ShortlinkComponent />,
          loader: async ({ params }) => {
            // Fetch shortlink data for SSR
            const response = await fetch(`${process.env.API_URL}/api/shortlinks/${params.token}`)
            if (!response.ok) throw new Response('Not Found', { status: 404 })
            return response.json()
          },
          path: `${ROUTES.SHORTLINK.MAIN}/:token`,
        },
        {
          element: <FaqComponent />,
          loader: async () => {
            const response = await fetch(`${process.env.API_URL}/api/faqs/public`)
            return response.json()
          },
          path: ROUTES.FAQ?.MAIN ?? '/faq',
        },
        { element: <AboutComponent />, path: ROUTES.ABOUT?.MAIN ?? '/about' },
        {
          element: <BlogComponent />,
          loader: async () => {
            const response = await fetch(`${process.env.API_URL}/api/blog/posts`)
            return response.json()
          },
          path: ROUTES.BLOG?.MAIN ?? '/blog',
        },
      ],
      element: <Root />,
    },
  ]
}

export const createPrivateRoutes = (): RouteObject[] => {
  return PrivateWebRouterConfig.getRouter()
}

export const createClientOnlyRoutes = (strings: Record<string, string>): RouteObject[] => {
  const ROUTES = WebConfigService.getWebRoutes()
  // Lazy load CSR-only components
  const { NotFoundComponent } = require('@dx3/web-libs/ui/global/not-found.component')
  const { RateLimitComponent } = require('@dx3/web-libs/ui/global/rate-limit.component')

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
```

### 20.2 SSR Entry (Node.js)
```tsx
// packages/web/web-app/src/ssr/server.tsx
import createEmotionServer from '@emotion/server/create-instance'
import express from 'express'
import { renderToPipeableStream } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'

import { createEmotionCache } from '../app/emotion-cache'
import { createPublicRoutes } from '../app/routers/ssr.routes'
import { createSsrStore } from '../app/store/store-ssr.redux'

const app = express()

// Health check
app.get('/health', (_req, res) => res.send('OK'))

// SSR handler
app.get('*', async (req, res) => {
  // Skip SSR if auth cookie present
  if (req.cookies?.dx3_session) {
    return res.sendFile('index.html', { root: 'dist/client' })
  }

  // Create request-scoped instances
  const store = createSsrStore()
  const strings = store.getState()?.i18n?.translations ?? {}
  const publicRoutes = createPublicRoutes(strings)
  const staticHandler = createStaticHandler(publicRoutes)

  // Create fetch Request from Express req
  const fetchRequest = new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
    headers: Object.entries(req.headers).reduce((acc, [k, v]) => {
      if (typeof v === 'string') acc[k] = v
      return acc
    }, {} as Record<string, string>),
    method: req.method,
  })

  try {
    const context = await staticHandler.query(fetchRequest)

    // Handle redirects
    if (context instanceof Response) {
      return res.redirect(context.status, context.headers.get('Location') ?? '/')
    }

    const router = createStaticRouter(staticHandler.dataRoutes, context)
    const emotionCache = createEmotionCache()
    const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(emotionCache)

    const { pipe } = renderToPipeableStream(
      <StaticRouterProvider context={context} router={router} />,
      {
        bootstrapScripts: ['/static/js/client.js'],
        onError(error) {
          console.error('SSR error:', error)
        },
        onShellError() {
          // Fall back to CSR
          res.sendFile('index.html', { root: 'dist/client' })
        },
        onShellReady() {
          res.setHeader('Content-Type', 'text/html')
          res.write('<!DOCTYPE html><html><head>')
          res.write('<meta charset="utf-8">')
          res.write('<meta name="viewport" content="width=device-width, initial-scale=1">')
          // Inject critical CSS here after collecting from Emotion
          res.write('</head><body><div id="root">')
          pipe(res)
        },
      },
    )
  } catch (error) {
    console.error('SSR handler error:', error)
    res.sendFile('index.html', { root: 'dist/client' })
  }
})

const PORT = process.env.SSR_PORT ?? 3001
app.listen(PORT, () => {
  console.log(`SSR server listening on port ${PORT}`)
})
```

### 20.3 CSR Hydration Entry
```tsx
// packages/web/web-app/src/client.tsx
import { CacheProvider } from '@emotion/react'
import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { createEmotionCache } from './app/emotion-cache'
import { createClientOnlyRoutes, createPrivateRoutes, createPublicRoutes } from './app/routers/ssr.routes'
import { store } from './app/store/store-web.redux'

// Hydrate Redux store from SSR
const preloadedState = (window as Window & { __PRELOADED_STATE__?: unknown }).__PRELOADED_STATE__
if (preloadedState) {
  // Store is already configured with preloaded state
  delete (window as Window & { __PRELOADED_STATE__?: unknown }).__PRELOADED_STATE__
}

const strings = store.getState()?.i18n?.translations ?? {}

const router = createBrowserRouter([
  ...createPublicRoutes(strings),
  ...createPrivateRoutes(),
  ...createClientOnlyRoutes(strings),
])

const emotionCache = createEmotionCache()

hydrateRoot(
  document.getElementById('root')!,
  <CacheProvider value={emotionCache}>
    <RouterProvider router={router} />
  </CacheProvider>,
)
```

### 20.4 Emotion Cache Factory
```tsx
// packages/web/web-app/src/app/emotion-cache.ts
import createCache from '@emotion/cache'

export const createEmotionCache = () => {
  return createCache({ key: 'dx3' })
}
```

### 20.5 SSR Redux Store Factory
```tsx
// packages/web/web-app/src/app/store/store-ssr.redux.ts
import { configureStore } from '@reduxjs/toolkit'

import { i18nReducer } from '../i18n/i18n-web.slice'

// Create a minimal store for SSR with only public data
export const createSsrStore = () => {
  return configureStore({
    reducer: {
      i18n: i18nReducer,
      // Add other public-only reducers as needed
    },
  })
}
```

## 21. Deliverables Checklist
*   Shared route definitions with explicit public and private splits.
*   SSR server entry with React Router v7 static routing and streaming SSR.
*   Client hydration entry compatible with SSR payloads.
*   Redux store SSR hydration with `window.__PRELOADED_STATE__`.
*   MUI/Emotion SSR setup with critical CSS extraction.
*   Build configuration for server and client bundles.
*   Public route metadata and JSON-LD for SEO.
*   Localization support in SSR with default fallback.
*   Graceful degradation to CSR on SSR failure.
*   Testing coverage across SSR, hydration, and auth boundaries.
