# Lighthouse Analysis: Blog Post Page

**Page:** `http://localhost:3001/blog/first-blog-post`  
**Date:** 2026-02-25  
**Scope:** Analysis only (no implementation)

---

## Executive Summary

The blog post page scores **56** on Performance (mobile simulation), with FCP at 5.1s and LCP at 6.9s. Critical issues include SSR hydration mismatches, unsized images, invalid `robots.txt`, and accessibility gaps (color contrast, missing main landmark). Unused JavaScript (~341 KiB) and image optimization offer significant improvement potential.

---

## 1. Performance (Score: 56)

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint (FCP) | 5.1s | < 1.8s | Poor |
| Largest Contentful Paint (LCP) | 6.9s | < 2.5s | Poor |
| Speed Index | 5.6s | < 3.4s | Poor |
| Total Blocking Time (TBT) | 320ms | < 200ms | Needs improvement |
| Time to Interactive (TTI) | 7.1s | < 3.8s | Poor |
| Cumulative Layout Shift (CLS) | 0 | < 0.1 | Good |
| Max Potential FID | — | < 100ms | — |

### Findings

- **CLS is 0** — Layout stability is good; no unexpected shifts.
- **FCP/LCP/Speed Index** — All above targets; slow initial paint and content visibility.
- **TBT 320ms** — Main thread blocked; contributes to delayed interactivity.
- **TTI 7.1s** — Page takes ~7s to become fully interactive.

### Root Causes (Inferred)

1. **SSR hydration errors** — React #418 mismatches force re-renders and extra work.
2. **Unused JavaScript** — ~341 KiB estimated savings; larger parse/compile cost.
3. **Images** — Unsized images and incorrect aspect ratio cause layout work and potential LCP impact.
4. **Bundle size** — Despite Option 4 optimizations (client ~65kb, vendor.mui ~82kb, vendor.react ~84kb gzipped), initial load on slow networks remains heavy.

---

## 2. Accessibility

### Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Color contrast | Medium | Login and Sign-Up buttons have insufficient contrast against background |
| Landmark: One main | Medium | Document does not have a `<main>` landmark |

### Recommendations

- **Color contrast:** Adjust Login/Sign-Up button colors in `app-nav-bar-ssr.menu.tsx` (e.g. `getAuthButtonColor`) to meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- **Main landmark:** Wrap primary content (e.g. `ContentWrapper` / `Container` in blog post) in `<main role="main">` or use semantic `<main>`.

---

## 3. Best Practices

### Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Errors in console | High | SSR hydration errors (React #418) logged |

### React #418 (Hydration Mismatch)

- **Cause:** Server-rendered HTML does not match client-rendered output.
- **Common sources:** `window`/`document` usage, `Date`/`dayjs` without `suppressHydrationWarning`, conditional rendering based on client-only state (e.g. `windowWidth`), or differing default values.
- **Relevant code:** `app-nav-bar-ssr.menu.tsx` uses `windowWidth` with initial value `1920` for SSR consistency; `BlogPostContent` uses `suppressHydrationWarning` on date. Other components may still cause mismatches.
- **Impact:** Extra client re-renders, potential layout flicker, and increased TBT/TTI.

---

## 4. SEO

### Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| robots.txt invalid | High | File returns HTML (59 errors) instead of plain text |

### robots.txt

- **Expected:** Plain text with directives like `User-agent: *` and `Allow:` / `Disallow:`.
- **Actual:** HTML content (likely SPA fallback or 404 page).
- **Fix:** Serve a real `robots.txt` at `/robots.txt` with correct `Content-Type: text/plain` (e.g. via static file or dedicated route).

---

## 5. Image Optimization

### Issues

| Issue | Severity | Affected | Description |
|-------|----------|----------|-------------|
| Incorrect aspect ratio | Medium | `text-logo-square.png` | Display size does not match intrinsic dimensions |
| Unsized images | Medium | Featured images, logo, markdown images | No explicit `width` and `height` attributes |

### Affected Components

- **Logo:** `app-nav-bar-ssr.menu.tsx` — `Logo` styled img uses `width: 36px` only; no `height` for aspect-ratio hint.
- **Featured image:** `blog-post-web.component.tsx` — `BlogImageWithPlaceholder` receives `height={400}` but may not set `width`/`height` on the underlying `<img>` for layout hints.
- **Markdown images:** Inline images in blog content may lack dimensions.

### Recommendations

- Add `width` and `height` to all `<img>` elements (or equivalent) to reserve space and avoid CLS.
- For `text-logo-square.png`, ensure displayed dimensions match intrinsic aspect ratio (e.g. square: `width` and `height` both set).
- Use `BlogImageWithPlaceholder` with explicit `width` and `height` where known.

---

## 6. Unused JavaScript

- **Estimated savings:** ~341 KiB
- **Impact:** Reduces parse/compile time and TBT.
- **Approach:** Route-based code splitting (Option 2 in `SSR-FURTHER-OPTIMIZATIONS-PLAN.md`), lazy-loading CSR-only routes, and further tree-shaking.

---

## 7. Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Fix SSR hydration errors | Medium | High (stability, TBT, TTI) |
| P0 | Serve valid robots.txt | Low | High (SEO) |
| P1 | Add main landmark | Low | Medium (a11y) |
| P1 | Fix Login/Sign-Up color contrast | Low | Medium (a11y) |
| P1 | Add width/height to images | Low | Medium (LCP, CLS) |
| P2 | Implement Option 2 (code splitting) | High | High (TBT, TTI) |
| P2 | Fix logo aspect ratio | Low | Low |

---

## 8. Related Files

| Component | Path |
|-----------|------|
| Blog post page | `packages/web/web-app/src/app/blog/blog-post-web.component.tsx` |
| Blog image | `packages/web/web-app/src/app/blog/blog-image-with-placeholder.component.tsx` |
| SSR navbar | `packages/web/web-app/src/app/ui/menus/app-nav-bar-ssr.menu.tsx` |
| Logo asset | `assets/img/text-logo-square.png` |
| SSR optimization plan | `docs/SSR-FURTHER-OPTIMIZATIONS-PLAN.md` |

---

## 9. Verification

- Re-run Lighthouse after fixes: Mobile, Slow 3G.
- Target: Performance > 80, FCP < 2s, LCP < 2.5s, TBT < 200ms, no console errors.
