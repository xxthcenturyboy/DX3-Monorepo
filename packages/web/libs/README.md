# WEB

All files in this directory are shared between all web apps
- /web-app
- /web-admin-app
- ...etc

All configs are in the parent `/web` directory

## Dev

__These /libs/ files do not run independently. You must run a web app to run these__

---

## Testing

Runs all libs tests
```Bash
pnpm --filter @dx3/web test:libs
```

Run tests for a specific lib (e.g., logger)
```Bash
pnpm --filter @dx3/web test --testPathPattern="libs/logger"
```

Runs a specific test in the libs directory
```Bash
pnpm --filter @dx3/web test --testPathPattern="libs/logger/logger-web-main.class.spec.ts"
```
