# @dx3/test-data

Shared test fixtures and mock data for the DX3 monorepo. Provides pre-seeded user credentials, UUIDs, and Sequelize model stubs used in unit and integration tests across the API, web, and mobile packages.

## Installation

This is a private workspace package. Reference it in any `package.json` within the monorepo:

```json
"devDependencies": {
  "@dx3/test-data": "workspace:*"
}
```

> This package should only be added as a `devDependency`. It must never be imported in production code.

## API

### User Constants (`test-user.consts.ts`)

Pre-defined credentials and identifiers for the three seeded test accounts. Values can be overridden at runtime via environment variables for CI/CD environments.

| Export | Description |
|---|---|
| `TEST_EXISTING_USER_ID` | UUID of the seeded standard user |
| `TEST_EXISTING_ADMIN_USER_ID` | UUID of the seeded admin user |
| `TEST_EXISTING_SUPERADMIN_USER_ID` | UUID of the seeded super-admin user |
| `TEST_ADMIN_USERNAME` | Username for the admin account (env: `TEST_ADMIN_USERNAME`) |
| `TEST_ADMIN_PASSWORD` | Password for the admin account (env: `TEST_ADMIN_PASSWORD`) |
| `TEST_SUPERADMIN_USERNAME` | Username for the super-admin account (env: `TEST_SUPERADMIN_USERNAME`) |
| `TEST_SUPERADMIN_PASSWORD` | Password for the super-admin account (env: `TEST_SUPERADMIN_PASSWORD`) |
| `TEST_USER_USERNAME` | Username for the standard user account (env: `TEST_USER_USERNAME`) |
| `TEST_USER_PASSWORD` | Password for the standard user account (env: `TEST_USER_PASSWORD`) |
| `TEST_USERS` | Array of `UserSeedType` objects for all three seeded accounts |

### Auth Constants (`test-auth.consts.ts`)

| Export | Description |
|---|---|
| `TEST_JWT_SECRET` | JWT secret used in test environments |
| `TEST_JWT_REFRESH_SECRET` | JWT refresh secret used in test environments |

### Email Constants (`test-email.consts.ts`)

| Export | Description |
|---|---|
| `TEST_EMAIL` | A deterministic email address for use in email-related tests |

### Phone Constants (`test-phone.consts.ts`)

| Export | Description |
|---|---|
| `TEST_PHONE` | A deterministic phone number for use in phone-related tests |

### Sequelize Models (`test-sequelize.models.ts`)

Minimal Sequelize model stubs used by tests that require an ORM instance without a live database connection.

## Environment Variable Overrides

The following environment variables override default test credentials when set. This enables CI pipelines to supply their own secrets without modifying source files.

| Variable | Default fallback |
|---|---|
| `TEST_ADMIN_USERNAME` | Hardcoded default in source |
| `TEST_ADMIN_PASSWORD` | Hardcoded default in source |
| `TEST_SUPERADMIN_USERNAME` | Hardcoded default in source |
| `TEST_SUPERADMIN_PASSWORD` | Hardcoded default in source |
| `TEST_USER_USERNAME` | Hardcoded default in source |
| `TEST_USER_PASSWORD` | Hardcoded default in source |

## Scripts

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage report
pnpm test:coverage

# Build (TypeScript compile)
pnpm build

# Lint
pnpm lint
```

## Test Coverage

Coverage is collected from `src/lib/**/*.ts`, excluding spec files. Target: ≥ 80% for statements, branches, functions, and lines.
