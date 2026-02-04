# Multi-Application Ecosystem Architecture Plan

## Overview

**Key Insight**: The `dx3-monorepo` is a **template/boilerplate** that gets cloned to create each new application. Each application (including the parent dashboard) lives in its **own separate repository**, but all apps connect to a **shared external infrastructure** for logging and deployment.

**Confirmed Requirements**:

1. Each app has a **descriptive name** (e.g., `ax-admin`, `michelleradnia_com`, `dan_underwood_com`)
2. Each app has **discrete authentication** (independent user tables)
3. Parent dashboard is **read-only stats viewer** (no cross-app management)

---

## Table of Contents

1. [High-Level Ecosystem Architecture](#high-level-ecosystem-architecture)
2. [Application Creation Workflow](#application-creation-workflow)
3. [Shared Infrastructure Architecture](#shared-infrastructure-architecture)
4. [Database Architecture](#database-architecture)
5. [Resource Ownership Model](#resource-ownership-model)
6. [Logging Architecture](#logging-architecture-cross-repository)
7. [Template Enhancements Required](#template-enhancements-required)
8. [Local Development Environment](#local-development-environment)
9. [Cloud Deployment Topology](#cloud-deployment-topology)
10. [Parent Dashboard](#parent-dashboard-ax-admin)
11. [Implementation Phases](#implementation-phases)
12. [Template Changes Summary](#template-changes-summary)

---

## High-Level Ecosystem Architecture

```mermaid
flowchart TB
    subgraph Templates [Template Repository]
        DX3[dx3-monorepo Boilerplate]
    end

    subgraph AppRepos [Application Repositories]
        ParentRepo[ax-admin repo]
        Personal1Repo[michelleradnia_com repo]
        Personal2Repo[dan_underwood_com repo]
        FutureRepo[future-app repo]
    end

    subgraph SharedInfra [Shared External Infrastructure]
        subgraph LoggingCluster [Centralized Logging]
            TimescaleDB[(TimescaleDB)]
        end

        subgraph DeploymentPlatform [Deployment Platform]
            DOAppPlatform[DigitalOcean App Platform]
            CICD[GitHub Actions CI/CD]
        end
    end

    DX3 -.->|clone + init| ParentRepo
    DX3 -.->|clone + init| Personal1Repo
    DX3 -.->|clone + init| Personal2Repo
    DX3 -.->|clone + init| FutureRepo

    ParentRepo -->|read logs| TimescaleDB
    Personal1Repo -->|write logs| TimescaleDB
    Personal2Repo -->|write logs| TimescaleDB
    FutureRepo -->|write logs| TimescaleDB

    ParentRepo -->|deploy| DOAppPlatform
    Personal1Repo -->|deploy| DOAppPlatform
    Personal2Repo -->|deploy| DOAppPlatform
```

---

## Application Creation Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant DX3 as dx3-monorepo
    participant NewRepo as new-app-repo
    participant Infra as Shared Infrastructure

    Dev->>GH: Create new empty repository
    Dev->>DX3: Clone dx3-monorepo
    Dev->>NewRepo: Run init-new-app.sh
    Note over NewRepo: Configure: app name, APP_ID,<br/>domain, database name
    Dev->>NewRepo: Set TIMESCALE_URI env var
    Dev->>GH: Push to new repository
    NewRepo->>Infra: Connect to centralized TimescaleDB
    NewRepo->>Infra: Deploy via App Platform
```

---

## Shared Infrastructure Architecture

```mermaid
flowchart TB
    subgraph ExternalInfra [Shared External Infrastructure]
        subgraph LoggingLayer [Centralized Logging]
            TimescaleDB[(TimescaleDB)]
        end

        subgraph SharedPGInstance [Shared PostgreSQL - 3 DBs]
            SharedPG[(Managed PostgreSQL)]
            ParentDB[ax_admin]
            Personal1DB[michelleradnia_com]
            Personal2DB[dan_underwood_com]
            SharedPG --> ParentDB
            SharedPG --> Personal1DB
            SharedPG --> Personal2DB
        end

        subgraph OptionalShared [Optional Shared Services]
            SharedS3[S3/Spaces with app prefixes]
        end
    end

    subgraph LightweightApps [Lightweight Apps - Use Shared PG]
        subgraph ParentApp [ax-admin]
            ParentAPI[API - Stats Reader]
            ParentWeb[Web - Stats Viewer]
        end

        subgraph PersonalApp1 [michelleradnia_com]
            P1API[API]
            P1Web[Web]
        end

        subgraph PersonalApp2 [dan_underwood_com]
            P2API[API]
            P2Web[Web]
        end
    end

    subgraph IsolatedApps [Isolated Apps - Own PG Instances]
        subgraph HeavyApp1 [Finance Tracker]
            App1API[API]
            App1Web[Web]
            App1DB[(Own PostgreSQL)]
        end

        subgraph HeavyApp2 [Task Manager]
            App2API[API]
            App2Web[Web]
            App2DB[(Own PostgreSQL)]
        end
    end

    ParentAPI --> ParentDB
    P1API --> Personal1DB
    P2API --> Personal2DB
    App1API --> App1DB
    App2API --> App2DB

    ParentAPI -->|read all| TimescaleDB
    P1API -->|write| TimescaleDB
    P2API -->|write| TimescaleDB
    App1API -->|write| TimescaleDB
    App2API -->|write| TimescaleDB
```

---

## Database Architecture

```mermaid
flowchart LR
    subgraph SharedPGCluster [Shared PostgreSQL Instance]
        direction TB
        ManagedPG[(DO Managed PostgreSQL)]
        ManagedPG --> UmbrellaDB[ax_admin]
        ManagedPG --> PersonalDB1[michelleradnia_com]
        ManagedPG --> PersonalDB2[dan_underwood_com]
    end

    subgraph IsolatedPGInstances [Isolated PostgreSQL Instances]
        FinancePG[(finance-tracker-pg)]
        TaskPG[(task-manager-pg)]
        FuturePG[(future-app-pg)]
    end

    subgraph LoggingInstance [Logging Instance]
        TimescalePG[(TimescaleDB)]
    end
```

**Database Strategy:**

| App Type | PostgreSQL Strategy | Rationale |
|----------|---------------------|-----------|
| ax-admin (Parent) | Shared instance, own database | Lightweight, cost-effective |
| michelleradnia_com | Shared instance, own database | Lightweight, minimal traffic |
| dan_underwood_com | Shared instance, own database | Lightweight, minimal traffic |
| Heavy/Production Apps | Isolated instance per app | Performance isolation, independent scaling |
| All Apps (Logging) | Centralized TimescaleDB | Single source of truth for analytics |

---

## Resource Ownership Model

### Shared PostgreSQL Instance (3 Lightweight Apps)

| App | Database Name | Notes |
|-----|---------------|-------|
| ax-admin | `ax_admin` | Parent dashboard - stats viewer |
| michelleradnia_com | `michelleradnia_com` | Personal app |
| dan_underwood_com | `dan_underwood_com` | Personal app |

**Connection Pattern (same host, different databases):**

```bash
# ax-admin (Parent Dashboard)
POSTGRES_URI=postgresql://user:pass@shared-pg-host:5432/ax_admin

# michelleradnia_com
POSTGRES_URI=postgresql://user:pass@shared-pg-host:5432/michelleradnia_com

# dan_underwood_com
POSTGRES_URI=postgresql://user:pass@shared-pg-host:5432/dan_underwood_com
```

### Isolated PostgreSQL Instances (Heavy Apps)

| App | Instance | Notes |
|-----|----------|-------|
| Finance Tracker | `finance-tracker-pg` | Own managed instance |
| Task Manager | `task-manager-pg` | Own managed instance |
| Future Heavy Apps | `{app-name}-pg` | Own managed instance |

### Per-Application Resources (All Apps)

| Resource | Ownership | Notes |
|----------|-----------|-------|
| Redis | Shared for lightweight, per-app for heavy | ax-admin, michelleradnia_com, dan_underwood_com share 1 Redis |
| Users Table | Per-app | Discrete authentication per app |
| S3 Bucket | Per-app | Each app gets its own bucket |
| GitHub Repo | Per-app | Cloned from dx3-monorepo template |

### Shared Across All Apps (External Infrastructure)

| Resource | Ownership | Notes |
|----------|-----------|-------|
| TimescaleDB (Logging) | Centralized | Single instance, partitioned by `app_id` |
| Shared PostgreSQL | Centralized | 1 instance with 3 databases for lightweight apps |
| Deployment Platform | Centralized | DigitalOcean App Platform / AWS |

---

## Logging Architecture (Cross-Repository)

```mermaid
flowchart LR
    subgraph FinanceTrackerRepo [finance-tracker repo]
        FT_API[API Server]
        FT_LogService[LoggingService]
        FT_API --> FT_LogService
    end

    subgraph TaskManagerRepo [task-manager repo]
        TM_API[API Server]
        TM_LogService[LoggingService]
        TM_API --> TM_LogService
    end

    subgraph Dx3AdminRepo [ax-admin repo]
        UD_API[API Server]
        UD_LogService[LoggingService - Read Only]
        UD_API --> UD_LogService
    end

    subgraph CentralizedLogging [Centralized TimescaleDB]
        LogsTable[(logs hypertable)]
        Dx3AdminPartition[app_id: ax-admin]
        MichellePartition[app_id: michelleradnia_com]
        XxthPartition[app_id: dan_underwood_com]

        LogsTable --> Dx3AdminPartition
        LogsTable --> MichellePartition
        LogsTable --> XxthPartition
    end

    FT_LogService -->|INSERT| LogsTable
    TM_LogService -->|INSERT| LogsTable
    UD_LogService -->|SELECT all| LogsTable
```

---

## Template Enhancements Required

The `dx3-monorepo` template needs these additions to support the ecosystem:

### 1. APP_ID Configuration

```typescript
// packages/shared/models/src/config/config-shared.consts.ts
export const APP_ID = process.env.APP_ID || 'dx3-default'
```

### 2. Enhanced LoggingService

```typescript
// packages/api/libs/logging/logging-api.service.ts
import { APP_ID } from '@dx3/models-shared'

async record(data: LogRecordType): Promise<void> {
  await this.insertLog({
    ...data,
    appId: APP_ID,  // Auto-injected from environment
  })
}
```

### 3. Environment Variable Template

```bash
# .env.example additions
APP_ID=your-app-name                    # Unique identifier for this app
TIMESCALE_URI=                          # Connection to shared logging DB (optional in dev)
TIMESCALE_ENABLED=false                 # Enable/disable external logging
```

### 4. Updated Init Script Prompts

Add to `init-new-app.sh`:

- Prompt for `APP_ID` (e.g., `finance-tracker`)
- Set `APP_ID` in `.env.example` and config files

### 5. Logging Table Schema (Shared DB)

```sql
-- In centralized TimescaleDB
CREATE TABLE logs (
  id UUID DEFAULT uuid_generate_v4(),
  app_id VARCHAR(64) NOT NULL,  -- 'finance-tracker', 'task-manager', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(64) NOT NULL,
  -- ... other columns from LOGGING-TABLE-IMPLEMENTATION.md
);

-- Hypertable with space partitioning by app_id
SELECT create_hypertable(
  'logs', 'created_at',
  partitioning_column => 'app_id',
  number_partitions => 8
);

-- Index for parent dashboard queries
CREATE INDEX iax_logs_app_id ON logs(app_id, created_at DESC);
```

---

## Local Development Environment

### Repository Structure on Dev Machine

```
~/Developer/
├── ax-infrastructure/        # Shared services (clone once per machine)
│   ├── docker-compose.yml
│   ├── init-scripts/
│   │   ├── init-timescale.sql
│   │   └── init-shared-pg.sql
│   └── README.md
│
├── dx3-monorepo/             # Template (reference only)
│
├── ax-admin/                # Parent dashboard - cloned from template
├── michelleradnia_com/           # Personal app - cloned from template
├── dan_underwood_com/           # Personal app - cloned from template
└── future-app/               # Future heavy app - cloned from template
```

### Architecture Overview

```mermaid
flowchart TB
    subgraph InfraRepo [ax-infrastructure repo]
        subgraph SharedServices [Shared Services - Always Running]
            TimescaleDB[(TimescaleDB :5434)]
            SharedPG[(Shared PostgreSQL :5435)]
            SharedRedis[(Shared Redis :6379)]
            SharedPG --> Dx3AdminDB[ax_admin]
            SharedPG --> MichelleDB[michelleradnia_com]
            SharedPG --> XxthDB[dan_underwood_com]
        end
    end

    subgraph LightweightApp [Lightweight App Repo - e.g. michelleradnia_com]
        L_LocalStack[LocalStack :4566]
        L_SendGrid[SendGrid :7070]
        L_API[API :4001]
        L_Web[Web :3001]
    end

    subgraph HeavyApp [Heavy App Repo - e.g. finance-tracker]
        H_PG[(Own PostgreSQL :5433)]
        H_Redis[(Redis :6380)]
        H_LocalStack[LocalStack :4567]
        H_API[API :4001]
        H_Web[Web :3001]
    end

    L_API --> MichelleDB
    L_API -->|logs| TimescaleDB
    L_API --> SharedRedis
    H_API --> H_PG
    H_API -->|logs| TimescaleDB
```

---

### ax-infrastructure Repository

**Purpose:** Single source of truth for shared local development services.

**docker-compose.yml:**

```yaml
name: ax-infrastructure

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: dx-timescaledb-shared
    ports:
      - "5434:5432"
    environment:
      POSTGRES_USER: axuser
      POSTGRES_PASSWORD: axpassword
      POSTGRES_DB: ax_logs
    volumes:
      - timescale-data:/var/lib/postgresql/data
      - ./init-scripts/init-timescale.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U axuser -d ax_logs"]
      interval: 5s
      timeout: 5s
      retries: 5

  postgres-shared:
    image: postgres:16-alpine
    container_name: dx-postgres-shared
    ports:
      - "5435:5432"
    environment:
      POSTGRES_USER: axuser
      POSTGRES_PASSWORD: axpassword
      POSTGRES_DB: postgres
    volumes:
      - postgres-shared-data:/var/lib/postgresql/data
      - ./init-scripts/init-shared-pg.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U axuser"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis-shared:
    image: redis:7-alpine
    container_name: dx-redis-shared
    ports:
      - "6379:6379"
    volumes:
      - redis-shared-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

networks:
  default:
    name: dx-shared-network

volumes:
  timescale-data:
  postgres-shared-data:
  redis-shared-data:
```

**init-scripts/init-shared-pg.sql:**

```sql
-- Create databases for lightweight apps
CREATE DATABASE ax_admin;
CREATE DATABASE michelleradnia_com;
CREATE DATABASE dan_underwood_com;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ax_admin TO axuser;
GRANT ALL PRIVILEGES ON DATABASE michelleradnia_com TO axuser;
GRANT ALL PRIVILEGES ON DATABASE dan_underwood_com TO axuser;
```

**init-scripts/init-timescale.sql:**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create logs table (schema from LOGGING-TABLE-IMPLEMENTATION.md)
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  app_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(64) NOT NULL,
  event_subtype VARCHAR(64),
  user_id UUID,
  fingerprint VARCHAR(64),
  ip_address INET,
  -- ... additional columns
  success BOOLEAN DEFAULT true,
  message TEXT
);

-- Convert to hypertable
SELECT create_hypertable('logs', 'created_at', if_not_exists => TRUE);

-- Create index for cross-app queries
CREATE INDEX IF NOT EXISTS iax_logs_app_id ON logs(app_id, created_at DESC);
```

---

### App-Specific Development Modes

#### Mode 1: Default Development (Single App, No Shared Infra)

For daily development when you just need one app running:

```bash
# In any app repo
make dev   # or: docker compose up -d && pnpm dev
```

**Environment (.env.local):**

```bash
APP_ID=finance-tracker
TIMESCALE_ENABLED=false                    # Logs to console only
POSTGRES_URI=postgresql://pguser:password@localhost:5433/app
REDIS_URI=redis://localhost:6379
```

#### Mode 2: Integration Development (With Shared Infra)

For testing cross-app features like parent dashboard:

```bash
# First, ensure shared infra is running
cd ~/Developer/ArteFX/ax-infrastructure
docker compose up -d

# Then start your app in integration mode
cd ~/Developer/umbrella-dashboard
make dev:integration
```

**Environment (.env.integration):**

```bash
APP_ID=ax-admin
TIMESCALE_ENABLED=true
TIMESCALE_URI=postgresql://axuser:axpassword@localhost:5434/ax_logs
POSTGRES_URI=postgresql://axuser:axpassword@localhost:5435/ax_admin
REDIS_URI=redis://localhost:6379
```

---

### Port Allocation Strategy

To avoid conflicts when running multiple apps:

| Service | Default Port | App-Specific Pattern |
|---------|--------------|----------------------|
| **Shared TimescaleDB** | 5434 | Fixed (ax-infrastructure) |
| **Shared PostgreSQL** | 5435 | Fixed (ax-infrastructure) |
| **Shared Redis** | 6379 | Fixed (ax-infrastructure) - for lightweight apps |
| **App PostgreSQL** | 5440+ | Heavy apps only |
| **App Redis** | 6390+ | Heavy apps only |
| **App API** | 4000-4099 | Increment per app |
| **App Web** | 3000-3099 | Increment per app |
| **LocalStack** | 4566-4599 | Increment per app |

**Suggested Port Assignments:**

| App | API | Web | Redis | Own PG | LocalStack |
|-----|-----|-----|-------|--------|------------|
| ax-admin | 4000 | 3000 | Shared (6379) | - | 4566 |
| michelleradnia_com | 4001 | 3001 | Shared (6379) | - | 4567 |
| dan_underwood_com | 4002 | 3002 | Shared (6379) | - | 4568 |
| future-heavy-app | 4010 | 3010 | 6390 | 5440 | 4570 |

---

### Development Workflows

#### One-Time Setup (New Dev Machine)

```bash
# 1. Clone infrastructure repo
cd ~/Developer
git clone git@github.com:YourOrg/ax-infrastructure.git
cd ax-infrastructure
docker compose up -d

# 2. Verify shared services are running
docker ps   # Should see dx-timescaledb-shared, dx-postgres-shared

# 3. Clone app repos as needed
git clone git@github.com:DanEx/ax-admin.git
git clone git@github.com:DanEx/michelleradnia_com.git
```

#### Daily Development (Single App)

```bash
cd ~/Developer/michelleradnia_com
make dev   # Uses shared PostgreSQL, TIMESCALE_ENABLED=false
```

#### Integration Testing (Parent Dashboard)

```bash
# Terminal 1: Ensure infra is up
cd ~/Developer/ArteFX/ax-infrastructure
docker compose up -d

# Terminal 2: Start an app that writes logs
cd ~/Developer/michelleradnia_com
make dev:integration   # Writes to shared TimescaleDB

# Terminal 3: Start parent dashboard
cd ~/Developer/ax-admin
make dev:integration   # Reads all logs from shared TimescaleDB
```

---

### Environment Configuration Summary

| Environment | `TIMESCALE_ENABLED` | `TIMESCALE_URI` | `POSTGRES_URI` |
|-------------|---------------------|-----------------|----------------|
| Local (default) | `false` | - | Own PG or shared PG |
| Local (integration) | `true` | `localhost:5434` | Own PG or shared PG |
| Staging | `true` | Staging TimescaleDB | Staging PG |
| Production | `true` | Production TimescaleDB | Production PG |

---

## Cloud Deployment Topology

```mermaid
flowchart TB
    subgraph Internet [Internet]
        Users[End Users]
    end

    subgraph CDN [CDN / DNS]
        Cloudflare[Cloudflare]
    end

    subgraph DORegion [DigitalOcean Region]
        subgraph LightweightAppPlatform [Lightweight Apps]
            Dx3AdminApp[ax-admin]
            MichelleApp[michelleradnia_com]
            XxthApp[dan_underwood_com]
        end

        subgraph HeavyAppPlatform [Future Heavy Apps]
            FutureApp[future-app]
        end

        subgraph SharedManagedDB [Shared Managed PostgreSQL]
            SharedPG[(1 PG Instance)]
            Dx3AdminDB[ax_admin db]
            MichelleDB[michelleradnia_com db]
            XxthDB[dan_underwood_com db]
            SharedPG --> Dx3AdminDB
            SharedPG --> MichelleDB
            SharedPG --> XxthDB
        end

        subgraph SharedManagedRedis [Shared Redis]
            SharedRedis[(1 Redis Instance)]
        end

        subgraph IsolatedManagedDBs [Isolated PostgreSQL - Future]
            FuturePG[(future-app-pg)]
        end

        subgraph SharedLogging [Shared Logging]
            TimescaleDroplet[TimescaleDB Droplet]
        end
    end

    Users --> Cloudflare
    Cloudflare --> LightweightAppPlatform
    Cloudflare --> HeavyAppPlatform

    Dx3AdminApp --> Dx3AdminDB
    MichelleApp --> MichelleDB
    XxthApp --> XxthDB

    Dx3AdminApp --> SharedRedis
    MichelleApp --> SharedRedis
    XxthApp --> SharedRedis

    FutureApp --> FuturePG

    Dx3AdminApp -->|read all logs| TimescaleDroplet
    MichelleApp -->|write logs| TimescaleDroplet
    XxthApp -->|write logs| TimescaleDroplet
    FutureApp -->|write logs| TimescaleDroplet
```

---

## Parent Dashboard (ax-admin)

The parent dashboard is created from the same dx3-monorepo template, with special configuration:

### Configuration Differences

| Aspect | Heavy App | Lightweight/Personal App | Parent Dashboard (ax-admin) |
|--------|-----------|--------------------------|------------------------------|
| `APP_ID` | `future-app`, etc. | `michelleradnia_com`, `dan_underwood_com` | `ax-admin` |
| PostgreSQL | Own isolated instance | Shared instance, own DB | Shared instance, own DB |
| Redis | Own isolated instance | Shared instance | Shared instance |
| Authentication | Full user system | Full user system | Admin-only access |
| Log Access | Own `app_id` only | Own `app_id` only | All `app_id` values |
| Log Writes | Full INSERT | Full INSERT | Own activity only |

### Parent Dashboard Query Pattern

```typescript
// Standard app: Only sees own logs
const logs = await loggingService.getLogsList({
  appId: APP_ID,  // Filtered to own app
  ...filters
})

// Parent dashboard: Sees all apps
const logs = await loggingService.getLogsList({
  appId: undefined,  // No filter = all apps
  ...filters
})
```

### Parent Dashboard Features

```mermaid
flowchart LR
    subgraph ParentDashboard [ax-admin Dashboard]
        AppSelector[App Selector Dropdown]
        StatsView[Aggregated Stats View]
        PerAppDrill[Per-App Drill Down]
        AlertsPanel[Cross-App Alerts]
    end

    subgraph DataSources [Data from TimescaleDB]
        AllLogs[All App Logs]
        HourlyAgg[logs_hourly aggregate]
        DailyAgg[logs_daily aggregate]
    end

    AppSelector --> PerAppDrill
    AllLogs --> StatsView
    HourlyAgg --> AlertsPanel
    DailyAgg --> StatsView
```

---

## Implementation Phases

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **Phase 1** | Infrastructure Repo | Create `ax-infrastructure` repo with shared TimescaleDB + PostgreSQL + Redis |
| **Phase 2** | Template Enhancement | Add `APP_ID`, `TIMESCALE_URI`, `TIMESCALE_ENABLED`, port configs |
| **Phase 3** | LoggingService Update | Auto-inject `app_id`, add conditional enabling |
| **Phase 4** | Init Script Update | Prompt for `APP_ID`, port assignments, lightweight vs heavy app |
| **Phase 5** | Makefile & Env Templates | Add `make dev:integration` target, `.env.integration` template |
| **Phase 6** | Documentation | Document local dev setup and ecosystem architecture |
| **Phase 7** | First Child App | Clone template, validate logging to shared infra |
| **Phase 8** | Parent Dashboard | Clone template, configure read-all mode, test aggregation |

---

## Template Changes Summary

### Template Files to Modify

| File | Change |
|------|--------|
| `packages/shared/models/src/config/config-shared.consts.ts` | Add `APP_ID` constant |
| `packages/api/libs/logging/logging-api.service.ts` | Auto-inject `app_id`, respect `TIMESCALE_ENABLED` |
| `packages/shared/models/src/logging/logging-shared.types.ts` | Add `appId` field to `LogRecordType` |
| `_devops/scripts/init-new-app.sh` | Add `APP_ID` prompt, port assignments |
| `.env.example` | Add `APP_ID`, `TIMESCALE_URI`, `TIMESCALE_ENABLED` |
| `docker-compose.yml` | Add port variables for flexibility |
| `Makefile` | Add `dev:integration` target |

### Template New Files

| File | Purpose |
|------|---------|
| `.env.integration.example` | Environment template for integration mode |
| `docs/ECOSYSTEM-SETUP.md` | Local dev setup and shared infra connection |
| `docs/PORT-ASSIGNMENTS.md` | Reference for port allocation across apps |

### ax-infrastructure Repo Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Shared TimescaleDB + PostgreSQL + Redis services |
| `init-scripts/init-timescale.sql` | TimescaleDB schema with logs hypertable |
| `init-scripts/init-shared-pg.sql` | Create 3 databases for lightweight apps |
| `README.md` | Setup instructions |
| `Makefile` | Convenience targets (up, down, logs, reset) |

---

## Architectural Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| **App naming** | Descriptive names | `ax-admin`, `michelleradnia_com`, `dan_underwood_com`, `finance-tracker`, etc. |
| **Authentication** | Discrete per-app | Independent user tables per application |
| **Parent dashboard auth** | Separate admin user table | Manual user creation initially; VPN/IP allowlist possible later |
| **Repository structure** | Each app = separate repo | Cloned from dx3-monorepo template |
| **GitHub organization** | DanEx (or DX3) | All app repos under same org |
| **Database strategy** | Shared + Isolated | 1 shared PG (3 DBs) for lightweight apps; isolated PG for heavy apps |
| **TimescaleDB access** | Application-level enforcement | Single DB user; `LoggingService` enforces `app_id` injection |
| **Redis strategy** | Shared for lightweight apps | 3 lightweight apps share 1 Redis instance |
| **S3/Spaces** | Separate buckets per app | Each app gets its own bucket |
| **Log retention** | Uniform 90 days | Parent dashboard is a view, not separate storage |
| **Backup strategy** | Instance-level | Single backup covers all DBs; per-DB restore via pg_dump if needed |
| **Staging environment** | Deferred | Local + Production initially; own TimescaleDB when staging needed |
| **Mobile apps** | API logging covers it | Firebase/GA4 for client-side analytics later |
| **CI/CD** | Per-app workflows | Each repo has its own GitHub Actions |
| **Template updates** | Manual cherry-pick | Apps diverge after cloning; selective updates as needed |

---

## Application Registry

| App ID | Type | PostgreSQL | Description |
|--------|------|------------|-------------|
| `ax-admin` | Lightweight (Parent) | Shared instance | Umbrella dashboard - stats viewer |
| `michelleradnia_com` | Lightweight (Personal) | Shared instance | Personal app |
| `dan_underwood_com` | Lightweight (Personal) | Shared instance | Personal app |
| `finance-tracker` | Heavy | Isolated instance | Example production app |
| `task-manager` | Heavy | Isolated instance | Example production app |

---

## Security Model

### TimescaleDB Access Control

**Approach:** Application-level enforcement (Option A)

```typescript
// LoggingService - APP_ID injected from environment, cannot be overridden
async record(data: LogRecordType): Promise<void> {
  await this.insertLog({
    ...data,
    appId: APP_ID,  // Always from process.env.APP_ID
  })
}
```

**Rationale:**
- All applications are internally controlled (not multi-tenant SaaS)
- Simplifies credential management (single database user)
- Easier local development
- Can upgrade to row-level security later if needed

**Single Database User:**
```bash
# All apps use same credentials
TIMESCALE_URI=postgresql://axuser:axpassword@timescale-host:5432/ax_logs
```

---

## README.md Update Instructions

**When to Update:** After implementing Phase 0 and Phase 1 of the implementation roadmap (see `IMPLEMENTATION-ROADMAP.md`), the main README.md should be updated to reflect the template nature and ecosystem architecture.

### Required Updates to README.md

#### 1. Update Title and Subtitle

**Current:**
```markdown
# Dx3

> **Full-Stack TypeScript Monorepo** — A production-grade platform featuring...
```

**Updated:**
```markdown
# Dx3

> **Full-Stack TypeScript Monorepo Template** — Clone this template to create production-ready applications in the dx3 ecosystem...
```

#### 2. Add Template Nature Section (After Overview)

Insert new section explaining dual nature:

```markdown
## Overview

Dx3 is a **production-ready monorepo template** designed to bootstrap full-stack TypeScript applications. This template powers a multi-application ecosystem where each app has its own repository (cloned from this template) while optionally connecting to shared infrastructure for centralized logging and analytics.

### Template Nature

- **Clone once per application**: Each new app (e.g., `ax-admin`, `michelleradnia_com`, `dan_underwood_com`) is created by cloning this template
- **Independent deployment**: Each app lives in its own GitHub repository with discrete authentication and databases
- **Optional shared infrastructure**: Apps can connect to centralized TimescaleDB for cross-app logging and metrics
- **Two development modes**: Standalone (default) or integration mode (with shared services)

### Ecosystem Architecture

When used in an ecosystem:
- **Parent Dashboard** (`ax-admin`): Read-only stats viewer for all apps in the ecosystem
- **Child Apps**: Individual applications with their own users, databases, and features
- **Shared Infrastructure** (`ax-infrastructure` repo): TimescaleDB, shared PostgreSQL (for lightweight apps), and Redis
```

#### 3. Update Architecture Diagram

Add dual-mode visualization showing both standalone and ecosystem modes (see agent analysis for specific diagram code).

#### 4. Add Environment Variables Section (In Setup)

After the existing setup prerequisites and before step 1:

```markdown
### Environment Variables Setup

Each package requires environment variables. Copy `.env.sample` to `.env.local` in:
- `packages/api/api-app/`
- `packages/web/web-app/`
- `packages/mobile/`

**Critical variables to configure:**

```bash
# Required: Unique identifier for this app in the ecosystem
APP_ID=dx3-default                          # Change to your app name (e.g., 'michelleradnia_com')

# Optional: External logging (disabled by default for standalone dev)
TIMESCALE_ENABLED=false                     # Set to 'true' for integration mode
TIMESCALE_URI=                              # Connection to centralized TimescaleDB

# Standard variables (see .env.sample for full list)
POSTGRES_URI=postgres://pguser:password@postgres:5432/dx3
REDIS_URL=redis://redis
REDIS_PORT=6379
```
```

#### 5. Add Development Modes Section (In Dev Section)

After the existing dev commands:

```markdown
### Development Modes

#### Standalone Mode (Default)
For daily development when working on a single app in isolation:
```bash
# Uses local containers only, no shared infrastructure
docker compose up -d
make api-watch   # Terminal 1
make api-start   # Terminal 2
pnpm dev:web     # Terminal 3
```

Environment: `TIMESCALE_ENABLED=false` (logs to console only)

#### Integration Mode (With Shared Infrastructure)
For testing cross-app features or parent dashboard functionality:

**Prerequisites:**
```bash
# First, clone and start shared infrastructure (one-time setup)
cd ~/Developer
git clone git@github.com:DanEx/ax-infrastructure.git
cd ax-infrastructure
docker compose up -d
```

**Then start your app:**
```bash
cd ~/Developer/your-app-repo
make dev:integration
```

Environment: Uses `.env.integration` with `TIMESCALE_ENABLED=true` and `TIMESCALE_URI` pointing to shared TimescaleDB.
```

#### 6. Add New Section: Ecosystem Setup

Insert after Development section:

```markdown
## Ecosystem Setup

### Creating a New App from Template

To create a new application in the dx3 ecosystem:

1. **Create new GitHub repository** (empty, no initialization)

2. **Clone this template**
   ```bash
   git clone https://github.com/DanEx/dx3-monorepo.git my-new-app
   cd my-new-app
   ```

3. **Re-initialize git**
   ```bash
   rm -rf .git
   git init
   git remote add origin git@github.com:DanEx/my-new-app.git
   ```

4. **Configure app identity**
   Update environment variables in all `.env.sample` files:
   ```bash
   APP_ID=my-new-app                          # Unique identifier
   POSTGRES_URI=...                            # Your app's database
   TIMESCALE_URI=...                           # Optional: shared logging DB
   TIMESCALE_ENABLED=false                     # Enable when ready
   ```

5. **Initial commit and push**
   ```bash
   git add .
   git commit -m "Initial commit from dx3-monorepo template"
   git push -u origin main
   ```

### Shared Infrastructure Repository

For integration development and production logging, set up the `ax-infrastructure` repository:

**Purpose:** Provides centralized services shared across all apps:
- TimescaleDB (logging and metrics)
- Shared PostgreSQL (3 databases for lightweight apps)
- Shared Redis (for lightweight apps)

**Setup:**
```bash
cd ~/Developer
git clone git@github.com:DanEx/ax-infrastructure.git
cd ax-infrastructure
docker compose up -d
```

**Services provided:**
- TimescaleDB: `localhost:5434`
- Shared PostgreSQL: `localhost:5435` (databases: ax_admin, michelleradnia_com, dan_underwood_com)
- Shared Redis: `localhost:6379`

See `ax-infrastructure` repository README for detailed setup instructions.
```

#### 7. Add Port Allocation Reference

Insert in Docker or Setup section:

```markdown
### Port Allocation in Multi-App Setup

When running multiple apps from this template simultaneously (e.g., during integration testing):

| Service | Default | App-Specific Pattern |
|---------|---------|---------------------|
| API | 4000 | 4000-4099 (increment per app) |
| Web | 3000 | 3000-3099 (increment per app) |
| PostgreSQL (own) | 5433 | 5440+ (heavy apps only) |
| Redis (own) | 6379 | 6390+ (heavy apps only) |
| LocalStack | 4566 | 4566-4599 (increment per app) |

**Shared Infrastructure (fixed ports):**
- TimescaleDB: `5434`
- Shared PostgreSQL: `5435`
- Shared Redis: `6379`

Configure in your app's `docker-compose.yml` to avoid conflicts.
```

### Files to Create

#### 1. `.env.integration.example` (Root)

```bash
# Integration Mode Environment Variables
# Copy to .env.integration and configure for integration development

# App Identity
APP_ID=dx3-default                          # Change to your app name

# Shared Infrastructure Connections
TIMESCALE_ENABLED=true
TIMESCALE_URI=postgresql://axuser:axpassword@localhost:5434/ax_logs

# For lightweight apps using shared PostgreSQL
POSTGRES_URI=postgresql://axuser:axpassword@localhost:5435/ax_admin

# Shared Redis
REDIS_URL=redis://localhost
REDIS_PORT=6379

# API Configuration
API_PORT=4000
API_URL=http://localhost:4000
NODE_ENV=development
DEBUG=true

# All other variables same as .env.sample
```

#### 2. Update Makefile (Add Target)

```makefile
## start development in integration mode (with shared infrastructure)
dev-integration:
	@if [ ! -f .env.integration ]; then \
		echo "Error: .env.integration not found"; \
		echo "Copy .env.integration.example and configure TIMESCALE_URI"; \
		exit 1; \
	fi
	@echo "Starting in integration mode..."
	@echo "Ensure ax-infrastructure is running: cd ~/Developer/ArteFX/ax-infrastructure && make up"
	docker compose --env-file .env.integration up -d
	@echo "Run 'make api-watch' and 'make api-start' in separate terminals"
```

### What to Keep Unchanged

The following sections should remain as-is to preserve the primary standalone workflow:

1. **Tech Stack** - No changes needed
2. **Features** - Current list accurate
3. **Testing** - Existing instructions correct
4. **Docker Operations** - Current commands valid
5. **Project Analysis** - Still valid characterization

### Implementation Timing

- **Do NOT update README.md** until Phase 0 is complete
- **Phase 0 must include:**
  - Menu system refactor
  - Role hierarchy alignment
  - APP_ID constants in shared package
  - ax-infrastructure repository created
  - `.env.integration.example` file created
  - `make dev:integration` target added

- **Update README.md** after Phase 1 (Logging) is implemented and stable
- This ensures documentation matches actual implemented functionality

### Key Messaging Principles

When updating README.md, maintain these priorities:

✅ **Emphasize:** Standalone development as default, primary workflow
✅ **Clarify:** Template nature without overshadowing usability
✅ **Highlight:** Optional ecosystem participation
✅ **Preserve:** Production-ready, enterprise-grade positioning

The README should communicate:
1. By default, this works as a standalone monorepo (current behavior)
2. Optionally, developers can enable ecosystem features
3. The template can be cloned to create multiple apps
4. Each app remains independently deployable

---

## Related Documentation

- **Implementation Roadmap**: See `IMPLEMENTATION-ROADMAP.md` for phase-by-phase implementation plan
- **Logging Implementation**: See `LOGGING-TABLE-IMPLEMENTATION-CORRECTED.md` for logging details
- **Metrics Implementation**: See `METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md` for metrics details
- **Blog CMS Implementation**: See `BLOG-CMS-IMPLEMENTATION.md` for blog/CMS details

---

*Document Version: 1.3*
*Created: January 2026*
*Updated: January 2026*
- *v1.2: Updated with actual app names (ax-admin, michelleradnia_com, dan_underwood_com); added shared Redis for lightweight apps*
- *v1.3: Added README.md update instructions and related documentation references*
