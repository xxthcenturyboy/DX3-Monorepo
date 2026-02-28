# SSR Further Optimizations Plan

This document outlines implementation plans for **Option 2 (Route-based Code Splitting)** and **Option 4 (Reduce MUI Footprint)** to improve SSR load performance, especially on slow networks (e.g. 3G).

---

## Current State

- **SSR routes**: Home, Shortlink, FAQ, About, Blog (list + post)
- **CSR-only routes**: Login, Signup, authenticated dashboard, admin, etc.
- **Bundle structure**: `runtime.js`, `vendor.react.js`, `vendor.mui.js`, `lib.js`, `vendor.main.js`, `client.js` (all deferred)
- **MUI usage**: Barrel imports (`@mui/material`), `@mui/icons-material` icons, `@mui/material/styles` (ThemeProvider, createTheme)
- **Route imports**: All public route components are statically imported in `ssr.routes.tsx` for synchronous SSR

---

## Option 2: Route-based Code Splitting

### Goal

Lazy-load route components that are not needed for the initial page. Reduce initial JS payload so the critical path (Home, Blog, etc.) loads faster.

### Strategy

1. **SSR-critical routes** (must be in initial bundle for server render):
   - Home, Shortlink, FAQ, About, Blog list, Blog post
   - `SsrRoot`, `AppNavBarSsr`, `AuthenticatedRouter`, `WebAuthWrapper` (layout/navbar)

2. **CSR-only routes** (can be lazy-loaded):
   - Login, Signup (already CSR fallback)
   - Rate limit, Not found
   - All authenticated routes (dashboard, admin, user, etc.) – loaded only after auth

3. **Hybrid approach**:
   - Keep **static imports** for SSR routes in `createPublicRoutes` so the server can render them.
   - Use **React.lazy()** for CSR-only routes in `createClientOnlyRoutes` (already possible per LAZY LOADING MIGRATION note).
   - For **Login/Signup**: They are under `SsrRoot` but CSR-rendered. We can lazy-load `WebAuthWrapper` and auth-specific components since they never run on the server for `/login` and `/signup` (CSR fallback).

### Implementation Steps

| Step | Task | Files | Notes |
|------|------|-------|-------|
| 1 | Audit `createClientOnlyRoutes` | `ssr.routes.tsx` | Replace static `NotFoundComponent`, `RateLimitComponent` with `React.lazy()` |
| 2 | Lazy-load `WebAuthWrapper` | `ssr.routes.tsx` | Auth routes are CSR-only; wrap in `Suspense` with `UiLoadingComponent` fallback |
| 3 | Lazy-load `AuthenticatedRouter` children | `authenticated.router.tsx` | Dashboard, admin, user, blog-admin, etc. – all behind auth |
| 4 | Ensure `Suspense` boundaries | `client.tsx`, route config | CSR router already has `Suspense`; add fallback for lazy auth routes |
| 5 | Verify Rspack chunk splitting | `rspack.config.client.js` | Ensure `splitChunks` produces separate chunks for lazy routes |
| 6 | Measure bundle sizes | Build + `ANALYZE=1` | Compare before/after `client.js` and new async chunks |

### Constraints

- **SSR routes must remain static imports** – the server needs them synchronously.
- **SsrRoot, AppNavBarSsr, ThemeProvider** – stay in main bundle (layout).
- **AuthenticatedRouter** – can be lazy if we ensure it only mounts after auth (CSR path).

### Expected Outcome

- Smaller initial `client.js` (or `vendor.main.js`) by moving Login, Signup, NotFound, RateLimit, and all authenticated routes into async chunks.
- Faster TTI on `/` and `/blog` for unauthenticated users.

---

## Option 4: Reduce MUI Footprint

### Goal

Tree-shake MUI and import only what’s needed. Reduce `vendor.mui.js` size and improve load time.

### Current Issues

1. **Barrel imports** pull in more than needed:
   ```ts
   import { Box, Container, Fade, Grid, Typography, useTheme } from '@mui/material'
   ```
   Tree-shaking helps but path imports are more explicit and can reduce bundle size.

2. **Icons** from `@mui/icons-material`:
   ```ts
   import Menu from '@mui/icons-material/Menu'
   import Close from '@mui/icons-material/Close'
   ```
   Each icon is a separate module; ensure we’re not pulling unused icons.

3. **Styles** (`createTheme`, `ThemeProvider`) – required, keep as-is.

### Strategy

1. **Replace barrel imports with path imports**:
   ```ts
   // Before
   import { Box, Container, Fade } from '@mui/material'
   // After
   import Box from '@mui/material/Box'
   import Container from '@mui/material/Container'
   import Fade from '@mui/material/Fade'
   ```
   Rspack/Webpack tree-shaking may already handle this; path imports make dependencies explicit and can improve tree-shaking.

2. **Audit `@mui/icons-material`**:
   - List all icons used across the app.
   - Ensure each is imported from its path: `import Menu from '@mui/icons-material/Menu'` (already done in some files).
   - Consider `@mui/icons-material` babel plugin or manual icon bundling if many icons are used.

3. **MUI v7 tree-shaking**:
   - Check MUI v7 docs for recommended import patterns.
   - Verify `sideEffects` in `package.json` of `@mui/material` and `@emotion/*`.

4. **Optional: `@mui/material` subpath imports**:
   - Some setups use `@mui/material/Box` etc.; verify compatibility with Rspack.

### Implementation Steps

| Step | Task | Files | Notes |
|------|------|-------|-------|
| 1 | Audit all MUI imports | `packages/web/web-app/src` | Grep `@mui/material` and `@mui/icons-material` |
| 2 | Convert barrel → path imports | All component files | `import X from '@mui/material/X'` |
| 3 | Consolidate icon imports | Icon-heavy components | Ensure no duplicate or unused icons |
| 4 | Run `ANALYZE=1` build | `rspack.config.client.js` | Compare `vendor.mui.js` before/after |
| 5 | Verify MUI `sideEffects` | `node_modules/@mui/material` | Should have `"sideEffects": false` for tree-shaking |
| 6 | Consider `@mui/system` only where applicable | Skipped | No Box-only usage; `@mui/system` already bundled via `@mui/material`. No reduction expected. |

**Status (2026-02-25):** Option 4 complete. Steps 1–5 done: barrel→path imports, icon audit, ANALYZE build, `sideEffects: false` confirmed. Step 6 skipped (unnecessary). Bundle: client.js ~65kb, vendor.mui ~82kb, vendor.react ~84kb gzipped.

### Files to Update (MUI imports)

High-impact files (SSR-critical, large MUI usage):

- `ssr.routes.tsx` – Box, ThemeProvider, createTheme
- `app-nav-bar-ssr.menu.tsx` – Menu icon, multiple MUI components
- `blog-web.component.tsx`, `blog-post-web.component.tsx` – Container, Fade, Grid, Typography, Chip
- `faq-web.component.tsx`, `about-web.component.tsx` – Container, Fade, Grid, Typography
- `home-web.component.tsx` – if it uses MUI

CSR-only (lower priority for initial load, but still improves overall bundle):

- All `blog/admin/*` components
- `admin-metrics`, `admin-logs`, `user/*`, `support/*`, `media/*`

### Expected Outcome

- Smaller `vendor.mui.js` (e.g. 10–20% reduction depending on current usage).
- Faster parse/compile time for MUI chunk.

---

## Execution Order

1. **Option 4 first** – Lower risk, improves all routes. Can be done incrementally (file-by-file).
2. **Option 2 second** – Requires careful handling of SSR vs CSR routes and Suspense boundaries.

---

## Verification

- **Lighthouse** (Mobile, Slow 3G) – TTI, FCP, LCP
- **Bundle analyzer** – `pnpm build:web:ssr` with `ANALYZE=1`
- **Manual testing** – Home, Blog, Login, authenticated routes
- **SSR hydration** – No new hydration mismatches after changes
