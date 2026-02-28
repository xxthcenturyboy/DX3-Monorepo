# Dx3

> **Full-Stack TypeScript Monorepo** — A production-grade platform featuring a React web application, React Native mobile app, and Express.js API with real-time capabilities.

## Overview

Dx3 is an enterprise-grade monorepo architecture powering a unified ecosystem across web, mobile, and backend services. Built with modern TypeScript throughout, it provides a robust foundation for user management, real-time notifications, media handling, and secure authentication.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PNPM Monorepo                               │
├──────────────────┬──────────────────┬──────────────────────────────┤
│   📱 Mobile      │   🌐 Web         │   ⚙️  API                     │
│   (Expo SDK 52)  │   (React 19)     │   (Express.js)               │
│   React Native   │   MUI v7         │   PostgreSQL + Redis         │
│                  │   Rspack         │   Socket.IO + S3             │
├──────────────────┴──────────────────┴──────────────────────────────┤
│                      📦 Shared Packages                             │
│      models • encryption • utils • test-data                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Web Frontend** | React 19, MUI v7, Redux Toolkit, Rspack, Socket.IO Client |
| **Mobile Frontend** | React Native 0.76, Expo SDK 52, Redux Persist |
| **Backend API** | Express.js, Sequelize ORM, JWT Auth + OTP, Rate Limiting |
| **Data Layer** | PostgreSQL 16, Redis 7, AWS S3 (LocalStack for dev) |
| **Real-time** | Socket.IO with Redis Adapter |
| **Email** | SendGrid |
| **DevOps** | Docker Compose, esbuild, Biome, Jest, Cypress |

### Features

- 🔐 **Authentication** — JWT tokens with OTP verification, biometric login support, session management
- 👤 **User Management** — User profiles, roles, privileges, device tracking
- 📧 **Email & Phone** — CRUD operations with validation (libphonenumber)
- 🖼️ **Media Handling** — S3 uploads, image processing with Sharp, presigned URLs
- 🔔 **Real-time Notifications** — WebSocket-powered notification system
- 🔗 **URL Shortlinks** — Short link generation and routing
- 📊 **Health Monitoring** — Healthz/Livez endpoints for orchestration
- 🛡️ **Security** — Rate limiting (Redis-backed), encryption utilities, password strength analysis

### Project Analysis

This is a rare, high-complexity enterprise monorepo featuring:

| Aspect | Assessment |
|--------|------------|
| **Project Level** | Principal/Staff Engineer grade — production-ready architecture |
| **Rarity** | High — Full TypeScript monorepo with shared packages across 3 platforms |
| **Tech Maturity** | Cutting-edge — React 19, Expo SDK 52, MUI v7, Rspack, Node 22 |
| **Code Quality** | Professional — Biome linting, Jest coverage, E2E testing, type safety |

**Architectural Highlights:**

- **Monorepo Excellence** — pnpm workspaces with proper package scoping (`@dx3/*`)
- **Shared Type Safety** — `@dx3/models-shared` ensures consistent types across all platforms
- **Containerized Development** — Docker Compose orchestrating PostgreSQL, Redis, LocalStack (S3), SendGrid mock
- **Real-time Architecture** — Socket.IO with Redis adapter for horizontal scaling
- **Security-First** — Rate limiting at multiple tiers, JWT + OTP auth, encryption utilities
- **Modern Bundling** — esbuild for API (fast builds), Rspack for web (Webpack-compatible, faster)

---

## Development Modes

This monorepo supports two development modes:

| Mode | Use Case | Services |
|------|----------|----------|
| **Standalone** | Developing dx3 in isolation | Local PostgreSQL (5433), Local Redis (6379) |
| **Integration** | Testing with shared infrastructure | ax-infrastructure: TimescaleDB (5434), PostgreSQL (5435), Redis (6380) |

Both modes can run simultaneously without port conflicts.

---

## Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [LocalStack Account](https://localstack.cloud/) + LocalStack Desktop App
- Node.js 22+ (managed via Docker for API)
- pnpm 10+

### Initial Setup

1. **Clone and configure environment files**

   ```bash
   # Copy sample env files in each package that has one
   cp packages/api/api-app/.env.sample packages/api/api-app/.env
   # ... repeat for other packages as needed
   ```

2. **Start containers (Standalone Mode)**

   ```bash
   docker compose up -d
   ```

3. **Install dependencies inside the API container**

   ```bash
   make api-shell
   pnpm i
   exit
   ```

4. **Connect LocalStack**
   - Open LocalStack Desktop
   - Log in and connect local app to your account

5. **Seed the database**

   ```bash
   make db-reset    # Full reset with seed data
   # or
   make db-seed     # Just run seeders (if DB already exists)
   ```

6. **Start the API** (two terminals)

   ```bash
   # Terminal 1: Watch mode (rebuilds on changes)
   make api-watch

   # Terminal 2: Start the server
   make api-start
   ```

7. **Start the Web App**

   ```bash
   pnpm dev:web
   ```

---

## Standalone Mode (Default)

Use this mode when developing dx3 in isolation with its own local services.

```bash
# Start all services (PostgreSQL, Redis, SendGrid mock, LocalStack)
docker compose up -d

# Start API (two terminals)
make api-watch   # Terminal 1
make api-start   # Terminal 2

# Start Web
pnpm dev:web

# Start Mobile
pnpm dev:mobile
```

**Services:**

| Service | Container | Port |
|---------|-----------|------|
| API | api-dx3 | 4000 |
| PostgreSQL | postgres-dx3 | 5433 |
| Redis | redis-dx3 | 6379 |
| SendGrid Mock | sendgrid-dx3 | 7070 |
| LocalStack (S3) | localstack-main | 4566 |

---

## Integration Mode

Use this mode when testing with shared `ax-infrastructure` services (TimescaleDB for logging/metrics, shared PostgreSQL, shared Redis).

### Prerequisites

1. **Clone ax-infrastructure** (if not already)

   ```bash
   cd ~/Developer/ArteFX
   git clone <ax-infrastructure-repo-url> ax-infrastructure
   ```

2. **Start ax-infrastructure**

   ```bash
   cd ~/Developer/ArteFX/ax-infrastructure
   make up
   ```

### Running Integration Mode

```bash
# Ensure .env.integration exists (created during setup)
# Start dx3 in integration mode
make dev-integration
```

This starts **only** the API, SendGrid, and MinIO containers — Redis and PostgreSQL come from ax-infrastructure.

**Services:**

| Service | Source | Port |
|---------|--------|------|
| API | dx3-monorepo | 4000 |
| TimescaleDB | ax-infrastructure | 5434 |
| PostgreSQL | ax-infrastructure | 5435 |
| Redis | ax-infrastructure | 6380 |
| SendGrid Mock | dx3-monorepo | 7070 |
| MinIO (S3) | dx3-monorepo | 4566 |

### Integration Mode Commands

```bash
# Start integration mode
make dev-integration

# Stop dx3 services (keeps ax-infrastructure running)
make dev-integration-down

# Check status of all services
make integration-status
```

---

## Running Both Modes Simultaneously

You can run standalone and integration modes at the same time (e.g., for comparing behavior):

```bash
# Start standalone mode
docker compose up -d

# In another project, start ax-infrastructure
cd ~/Developer/ArteFX/ax-infrastructure ; make up
```

**Port Allocation (No Conflicts):**

| Service | Standalone | ax-infrastructure |
|---------|------------|-------------------|
| PostgreSQL | 5433 | 5435 |
| Redis | 6379 | 6380 |
| TimescaleDB | — | 5434 |

---

## Quick Reference

### Make Commands

```bash
# API
make api-shell        # Shell into API container
make api-watch        # Start esbuild watch mode
make api-start        # Start API with nodemon
make api-e2e          # Run E2E tests
make api-build        # Build API container
make api-rebuild      # Rebuild API container (no cache)

# Database
make db-reset         # Drop + create + seed database
make db-reset-empty   # Drop + create (no seed)
make db-seed          # Run seeders only
make db-dump          # Backup database to dump file
make db-restore       # Restore database from dump
make shell-pg         # Shell into PostgreSQL container

# Integration
make dev-integration      # Start in integration mode
make dev-integration-down # Stop integration services
make integration-status   # Check all services status

# Help
make help             # Show all commands
```

### pnpm Scripts

```bash
pnpm dev:web          # Start web app (Rspack dev server)
pnpm dev:mobile       # Start mobile app (Expo)
pnpm test             # Run all tests
pnpm lint             # Run Biome linter
```

---

## Docker

### Rebuild Containers

After changes to Docker configuration or Dockerfile:

```bash
docker compose down ; docker compose build --no-cache ; docker compose up -d
```

### Clear node_modules Volume

If you experience dependency issues or need a fresh install:

```bash
docker volume rm dx3-api-node-modules
```

Then restart the containers — dependencies will be reinstalled automatically.

### View Container Logs

```bash
docker compose logs -f api-node-22-dx3
```

---

## Environment Variables

This monorepo uses multiple `.env` files for different contexts:

### File Locations

| File | Purpose | Used By |
|------|---------|---------|
| `.env` (root) | Docker Compose variables (standalone mode) | `docker compose up` |
| `.env.integration` (root) | Docker Compose variables (integration mode) | `make dev-integration` |
| `.env-sample` (root) | Template for root `.env` | Documentation |
| `packages/api/api-app/.env` | API app variables | Tests, running API directly on host |
| `packages/api/api-app/.env.sample` | Template for API app `.env` | Documentation |
| `packages/api/.env` | API libs variables | Tests for shared libs |

### Why Multiple Files?

- **Docker containers** get environment variables from `docker-compose.yml`, which reads from the **root** `.env` or `--env-file` flag
- **Node.js running directly** (tests, host execution) uses `dotenv` which reads from the **package-level** `.env`
- **Values may differ** between contexts (e.g., `redis-dx3` inside container vs `localhost` on host)

### Key Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_ID` | Unique app identifier for multi-app ecosystem | Yes |
| `TIMESCALE_ENABLED` | Enable TimescaleDB logging (`true`/`false`) | No (default: `false`) |
| `TIMESCALE_URI` | TimescaleDB connection string | Only if enabled |
| `POSTGRES_URI` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |

### Setup

1. **For standalone mode**: Copy `.env-sample` to `.env` and customize
2. **For integration mode**: `.env.integration` is pre-configured
3. **For tests**: Copy `packages/api/api-app/.env.sample` to `.env`

---

## Testing

### Flags

- `--runInBand` — runs in serial instead of creating a worker pool
- `--verbose` — shows results of each test individually
- `--detectOpenHandles` — helps debug hanging tests

### Examples

```bash
# Run all tests for a specific package in serial
pnpm --filter @dx3/api test --verbose --runInBand

# Run tests for web package
pnpm --filter @dx3/web-app test

# Run all tests
pnpm test
```

---

## Related Documentation

- [AX-Infrastructure Setup](docs/AX-INFRASTRUCTURE-SETUP.md) — Shared infrastructure setup guide
- [Multi-App Ecosystem Architecture](docs/MULTI-APP-ECOSYSTEM-ARCHITECTURE.md) — Architecture overview
- [Implementation Roadmap](docs/archive/IMPLEMENTATION-ROADMAP.md) — Development phases and tasks
