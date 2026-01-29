# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DX3 is a full-stack TypeScript monorepo template designed to serve as boilerplate for building multiple applications. It provides a production-ready foundation in the React, Node, Express, Redis, PostgreSQL, and Expo stack so that future development can start with design and features. The template includes React web app, React Native mobile app, and Express.js API, with shared packages for type safety across all platforms.

**Template Nature**: This repository is cloned to create new applications. Each app maintains its own repository while optionally connecting to shared infrastructure (dx-infrastructure repo) for centralized logging and metrics.

## Development Environment Setup

### Initial Setup
1. Ensure LocalStack account and app are configured
2. Set up `.env` files in packages with `.env.sample` as reference
3. Start Docker containers: `docker compose up -d`
4. Shell into API container: `make api-shell`
5. Install dependencies: `pnpm i`
6. Exit container: `exit`
7. Connect LocalStack app to your account
8. Seed database: `make db-seed` or `make db-reset`

### Running Applications

**Web Application:**
```bash
pnpm dev:web
```

**API (requires two terminals):**
```bash
make api-watch    # Terminal 1: esbuild watch mode
make api-start    # Terminal 2: nodemon
```

**Mobile Application:**
```bash
pnpm dev:mobile
```

## Common Commands

### Building
```bash
pnpm build                 # Build all packages
pnpm build:api-app        # Build API only
pnpm build:web            # Build web app only
pnpm build:mobile         # Build mobile app only
```

### Testing
```bash
# Run all tests
pnpm test

# Shared packages tests
pnpm test:shared
pnpm test:shared:coverage

# API tests
pnpm --filter @dx3/api test --verbose --runInBand
pnpm --filter @dx3/api-app test

# API E2E tests
make api-e2e

# Web tests
pnpm --filter @dx3/web-app test

# Mobile tests
pnpm --filter @dx3/mobile test

# Jest flags
# --runInBand: runs in serial instead of worker pool
# --verbose: shows individual test results
# --detectOpenHandles: ensures proper cleanup
```

### Linting & Formatting
```bash
pnpm lint          # Check code with Biome
pnpm lint:fix      # Fix linting issues
pnpm format        # Format code with Biome
```

### Database Operations
```bash
make db-reset           # Drop, create, migrate, and seed
make db-reset-empty     # Reset DB without seeding
make db-seed            # Run seeders only
make db-dump            # Backup current database state
make db-restore         # Restore from backup
make shell-pg           # PostgreSQL shell

# Migrations (from API package root)
pnpm --filter @dx3/api db:migrate
pnpm --filter @dx3/api db:migrate:status
pnpm --filter @dx3/api db:migrate:down
pnpm --filter @dx3/api db:migrate:redo
pnpm --filter @dx3/api db:migrate:create
```

### Docker Operations
```bash
# Rebuild containers
docker compose down ; docker compose build --no-cache ; docker compose up -d

# Clear node_modules volume (for dependency issues)
docker volume rm dx3-api-node-modules

# View container logs
docker compose logs -f api-node-22-dx3

# API container shell
make api-shell
```

## Architecture

### Monorepo Structure

```
packages/
├── api/
│   ├── api-app/           # Express application entry point
│   │   └── src/           # Controllers, routes, express config
│   │       ├── routes/    # v1.routes.ts - API route configuration
│   │       ├── auth/
│   │       ├── user/
│   │       ├── email/
│   │       ├── phone/
│   │       ├── media/
│   │       ├── notifications/
│   │       └── ...        # Feature-based organization
│   ├── api-app-e2e/       # E2E tests
│   └── libs/              # Shared API libraries (services, utilities)
│       ├── auth/
│       ├── user/
│       ├── pg/            # Sequelize models, migrations, seeders
│       ├── redis/
│       ├── s3/
│       ├── mail/
│       ├── feature-flags/
│       └── ...
├── web/
│   ├── web-app/           # React application
│   │   └── src/
│   │       └── app/       # Feature-based organization
│   │           ├── routers/
│   │           ├── store/  # Redux store configuration
│   │           ├── auth/
│   │           ├── user/
│   │           ├── dashboard/
│   │           └── ...
│   ├── web-app-e2e/       # Cypress E2E tests
│   └── libs/              # Web-specific libraries (UI, utils)
│       ├── ui/
│       ├── logger/
│       └── utils/
├── mobile/                # Expo/React Native application
└── shared/                # Cross-platform shared code
    ├── models/            # TypeScript types, constants, enums
    ├── utils/             # Shared utility functions
    ├── encryption/        # Encryption utilities
    └── test-data/         # Test fixtures
```

### Data Flow

1. **Web/Mobile → API**: HTTP/WebSocket requests via axios/Socket.IO client
2. **API Controllers**: Handle request/response (packages/api/api-app/src/*)
3. **API Services**: Business logic (packages/api/libs/*)
4. **Persistence**: Sequelize ORM → PostgreSQL
5. **Caching**: Redis for hot data and session management
6. **Real-time**: Socket.IO server (with Redis adapter) → Socket.IO clients
7. **State Management**: Redux Toolkit (web/mobile) with Redux Persist

### Key Patterns

**API Layer:**
- Controllers in `packages/api/api-app/src/<feature>` handle HTTP request/response
- Services in `packages/api/libs/<feature>` contain business logic
- Routes defined in `packages/api/api-app/src/routes/v1.routes.ts`
- Sequelize models in `packages/api/libs/pg/models`
- Redis caching for hot data
- Socket.IO uses namespace and room subscription model for real-time updates
  - Namespaces for feature isolation (e.g., `/admin-logs`, `/notifications`)
  - Rooms for targeted message broadcasting
  - Socket middleware for authentication and authorization
- Middleware: auth, rate limiting, role-based access control

**Web Layer:**
- Feature-based organization in `packages/web/web-app/src/app`
- Redux Toolkit for state management with Redux Persist
- RTK Query for API communication
- Memoized selectors with `useAppSelector` hook
- Socket.IO client connection utilities
- React Router v7 with lazy loading
- MUI v7 for UI components
- i18n strings in `assets/locales/en.json`

**Shared Layer:**
- `@dx3/models-shared`: Types, constants, enums used across all platforms
- `@dx3/utils-shared`: Utility functions (parsing, validation, etc.)
- `@dx3/encryption`: Encryption/decryption utilities
- `@dx3/test-data`: Test fixtures and mock data

## Code Style Conventions

### Critical Rules (Always Applied)

1. **Types over Interfaces**: Always use `type` instead of `interface` for TypeScript types
2. **Alphabetization**: JSON properties, type fields, and imports must be sorted alphabetically
3. **i18n**: All UI strings must use i18n (no hardcoded text in components)
4. **No Barrel Files in Web**: Never use barrel exports (`index.ts`) in web application. Use specific named files.
5. **Index Files**: Reserve index files only for barrel exports (API/shared libs only, not web)
6. **API Versioning**: Route versioning via request header, not URL path (use `/api/logs` not `/api/v1/logs`)
7. **Redux File Naming**: Use `*.reducer.ts` for reducers and `*.selectors.ts` for selectors (not `*.slice.ts`)
8. **Date Handling**: Use dayjs for date operations over JavaScript's Date constructor
9. **Bash Only**: All terminal commands in documentation must use bash (Mac OS/Linux only, no Windows-specific commands)

### Feature Implementation

**Adding New API Feature:**
1. Add route in `packages/api/api-app/src/routes/v1.routes.ts`
2. Create controller in `packages/api/api-app/src/<feature>/`
3. Create service in `packages/api/libs/<feature>/`
4. Add Sequelize model if needed in `packages/api/libs/pg/models/`
5. Add shared types/constants in `packages/shared/models/`
6. Implement Redis caching where appropriate
7. Use `sendOK`, `sendBadRequest` patterns for responses
8. Add Socket.IO handlers if real-time updates needed
9. Apply auth/role middleware for protected routes

**Adding New Web Feature:**
1. Define scope and routes in `packages/web/web-app/src/app/routers/`
2. Create dedicated component file (not `index.ts`)
3. Use Redux Toolkit or RTK Query for state/data
4. Use `useAppSelector` with memoized selectors
5. Keep types local unless shared with API
6. Follow existing UI patterns (ContentHeader, TableComponent, Dialog)
7. Add i18n strings to `assets/locales/en.json`
8. Connect to Socket.IO if real-time updates needed
9. No barrel exports

**Cross-Cutting:**
- Centralize feature flag names/constants in shared models
- Implement cache invalidation paths
- Ensure socket notifications trigger client re-fetch
- Add tests where coverage exists
- Wire error codes and i18n keys correctly

## Tech Stack Details

| Component | Technology |
|-----------|-----------|
| **Web** | React 19, MUI v7, Redux Toolkit, Rspack, Socket.IO Client |
| **Mobile** | React Native 0.76, Expo SDK 52, Redux Persist |
| **API** | Express.js, Sequelize ORM, JWT + OTP Auth, Rate Limiting |
| **Database** | PostgreSQL 16 (Sequelize TypeScript) |
| **Cache** | Redis 7, ioredis |
| **Storage** | AWS S3 (LocalStack for dev) |
| **Real-time** | Socket.IO with Redis Adapter |
| **Email** | SendGrid (mock in dev) |
| **Build Tools** | esbuild (API), Rspack (web), Expo (mobile) |
| **Testing** | Jest, Cypress (web E2E) |
| **Linting** | Biome |

## Package Scoping

All packages use `@dx3/*` scoping:
- `@dx3/api`, `@dx3/api-app`, `@dx3/api-e2e`
- `@dx3/web-app`, `@dx3/web-app-e2e`
- `@dx3/mobile`
- `@dx3/models-shared`, `@dx3/utils-shared`, `@dx3/encryption`, `@dx3/test-data`

## Git Workflow

- **Main branch**: `develop` (use this for PRs)
- **Current branch**: Check git status for active branch
- Create feature branches from `develop`
- Follow conventional commit messages based on repo history

## Docker Networking

All services communicate via `dx3-network` bridge network:
- PostgreSQL: `postgres:5432` (external: `localhost:5433`)
- Redis: `redis-dx3:6379` (external: `localhost:6379`)
- LocalStack: `localstack:4566` (external: `localhost:4566`)
- SendGrid Mock: `sendgrid-dx3:3000` (external: `localhost:7070`)
- API: `api-dx3:4000` (external: `localhost:4000`)

## Deployment Architecture

**Target Platform**: Kubernetes via AWS using CI/CD pipeline (production-ready)

**Multi-App Ecosystem**: When implementing the ecosystem architecture (see `docs/MULTI-APP-ECOSYSTEM-ARCHITECTURE.md`):
- Apps can run in **standalone mode** (default, uses own containers)
- Apps can run in **integration mode** (connects to shared infrastructure)
- Shared infrastructure managed via separate `dx-infrastructure` repository
- See `docs/IMPLEMENTATION-ROADMAP.md` for phased rollout strategy
