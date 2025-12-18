# WEB

This package encapsulates all web apps, *AND* shared code with the `/libs` directory.
This package.json and other config files exist simply to run unit tests.
All of the code in the `/libs` dir is testable due to these configurations, however to run the code, you'll need to run an actual web app.
The configuration files in this dir do not affect the web apps.
The .env file and package.json here should be kept up to date for testing `/libs`.

---

## Dev

__These /libs/ files do not run independently. Run a web app to call these__

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
