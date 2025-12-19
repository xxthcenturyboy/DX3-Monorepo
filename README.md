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

## Setup

- Have localstack account
- Download Localstack App
- Set up .env vars in all packages where there's a sample env

1. Spin up Containers `docker compose up -d`
1. Shell into api `make api-shell`
1. Run `pnpn i`
1. Leave Container `exit`
1. Log-in to Localstack and connect local app to account
1. Run `make db-seed` or `make db-reset` to setup the db
1. Run `make api-watch`
1. In a new terminal, run `make api-start`
1. In a new terminal, run `pnpm dev:web`

___

## Dev
Run Web App
```Bash
pnpm dev:web
```

Run and Watch API (starts in container - run each command in its own terminal)
```Bash
make api-watch
make api-start
```

Run Mobile App
```Bash
pnpm dev:mobile
```

---

## Testing

Flags
  - --runInBand
    - runs in serial instead of creating a worker pool
  - --verbose
    - shows results of each test individually
  - --detectOpenHandles
    - ensures some shit works bette

**example**

Runs all tests for a specific package in serial
```Bash
pnpm --filter @dx3/api test --verbose --runInBand
```

## Cruft
advancedbasics1
