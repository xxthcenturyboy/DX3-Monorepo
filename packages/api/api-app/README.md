# API-APP

This is the main api for our app.

---

## Dev

__Run each command it its own terminal__
*Ensure Docker is running prior to executing the following commands*

Build and Watch API (starts in container)
```Bash
make api-watch
```

Run API after build (starts in container)
```Bash
make api-start
```

---

## Testing

### Run inside container

Runs all API-App tests
```Bash
pnpm --filter @dx3/api-app test
```

Runs all API-App tests and creates coverage report
```Bash
pnpm --filter @dx3/api-app test:coverage
```

Runs all API-App tests including libs
```Bash
pnpm --filter @dx3/api-app test:full
```

Run tests for a specific module (e.g., auth)
```Bash
pnpm --filter @dx3/api-app test --testPathPattern="auth"
```

Runs a specific test in the module
```Bash
pnpm --filter @dx3/api-app test --testPathPattern="auth/auth-api.consts.spec"
```
