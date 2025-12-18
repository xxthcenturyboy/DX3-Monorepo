# Web-APP

This is the main web app

---

## Dev

Run Web App
```Bash
pnpm dev:web
```

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
