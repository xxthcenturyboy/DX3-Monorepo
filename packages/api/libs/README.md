# API LIBS

All files in this directory are shared between all APIs and Workers
- /api-app
- /worker-app
- ...etc

All configs are in the parent `/api` directory

---

## Dev

__These /libs/ files do not run independently. You must run an API to run these__

---

## Testing

Runs all libs tests
```Bash
pnpm --filter @dx3/api test:libs
```

Run tests for a specific lib (e.g., auth)
```Bash
pnpm --filter @dx3/api test --testPathPattern="libs/auth"
```

Runs a specific test in the libs directory
```Bash
pnpm --filter @dx3/api test --testPathPattern="libs/auth/auth-api.service.spec"
```
