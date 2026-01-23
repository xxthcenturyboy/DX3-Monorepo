# Web-APP

This is the main web app

---

## Dev

Run Web App (CSR - Client-Side Rendering)
```Bash
pnpm dev:web
```

Run Web App (SSR - Server-Side Rendering)
```Bash
pnpm --filter @dx3/web-app dev:ssr
```

Run Web App (SSR with auto-rebuild on file changes)
```Bash
pnpm --filter @dx3/web-app dev:ssr:watch
```

### SSR vs CSR Development

- **CSR (`pnpm dev:web`)**: Runs on port 3000, fast hot reload, best for development
- **SSR (`pnpm dev:ssr`)**: Runs on port 3001, full server-side rendering, use to test SEO/performance

### How to Verify SSR is Working

1. **View Page Source** (CMD+Option+U on Mac, CTRL+U on Windows)
   - Navigate to http://localhost:3001/faq
   - View source - you should see the actual content rendered in HTML
   - Compare with CSR version at http://localhost:3000 (only shows React shell)

2. **Check Network Tab**
   - DevTools → Network tab
   - Click on the document request (first one)
   - Response Preview should show fully rendered HTML

3. **Disable JavaScript Test**
   - DevTools → Settings → Disable JavaScript
   - Refresh the page - SSR content should still be visible

**SSR Routes**: /, /faq, /about, /blog, /s/:token

---

## Testing

Runs all web-app tests
```Bash
pnpm --filter @dx3/web-app test
```

Runs all web-app tests and creates coverage report
```Bash
pnpm --filter @dx3/web-app test:coverage
```

Runs all web-app tests including libs
```Bash
pnpm --filter @dx3/web-app test:full
```

Run tests for a specific module (e.g., auth)
```Bash
pnpm --filter @dx3/web-app test --testPathPattern="auth"
```

Runs a specific test in the module
```Bash
pnpm --filter @dx3/web-app test --testPathPattern="auth/auth-web.consts.spec"
```
