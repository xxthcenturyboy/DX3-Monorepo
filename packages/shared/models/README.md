# @dx3/models-shared

Shared TypeScript types, constants, and enums for the DX3 monorepo. Consumed by the API, web, and mobile packages to ensure type safety and consistency across the full stack.

## Installation

This is a private workspace package. Reference it in any `package.json` within the monorepo:

```json
"dependencies": {
  "@dx3/models-shared": "workspace:*"
}
```

## Modules

| Module | Description |
|---|---|
| `auth` | Authentication request/response types and constants |
| `blog` | Blog content types and status constants |
| `config` | Application configuration types |
| `devices` | Device registration and push notification types |
| `email` | Email address types and validation constants |
| `errors` | Error codes (`ERROR_CODES`) and their i18n key mapping (`ERROR_CODE_TO_I18N_KEY`) |
| `feature-flags` | Feature flag names, statuses, targets, and socket namespace constant |
| `headers` | Shared HTTP header name constants |
| `healthz` | Health-check response types |
| `logging` | Log event types, metric event types, and metric feature names |
| `media` | MIME types, media variants, S3 bucket names, and type-to-MIME mappings |
| `notifications` | Notification types and payload shapes |
| `phone` | Phone number types and validation constants |
| `shortlink` | Short-link types and constants |
| `socket-io` | Socket.IO namespace and room name constants |
| `stats` | Statistics and analytics types |
| `support` | Support ticket categories, statuses, validation limits, and UI colour mapping |
| `user` | User profile types, `DEFAULT_TIMEZONE`, `DISALLOWED_USERNAME_STRINGS`, `USERNAME_MIN_LENGTH`, and `isUsernameValid` |
| `user-privilege` | User roles (`USER_ROLE`), role hierarchy (`USER_ROLE_ORDER`), and `hasRoleOrHigher` utility |

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

Coverage is collected from `src/**/*.ts`, excluding spec files and the barrel `src/index.ts`. Target: ≥ 80% for statements, branches, functions, and lines.
