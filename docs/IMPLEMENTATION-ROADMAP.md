# Implementation Roadmap: Multi-Feature Ecosystem

**Document Version:** 1.0
**Created:** January 2026
**Status:** Ready for Implementation

---

## Executive Summary

This roadmap provides a sequential implementation plan for rolling out four major features across the dx3 ecosystem:

1. **Multi-App Ecosystem Architecture** - Shared infrastructure foundation
2. **Logging Infrastructure** - Centralized TimescaleDB logging
3. **Metrics Tracking** - Business analytics with GA4 + TimescaleDB hybrid
4. **Blog CMS** - Content management system

**Recommended Strategy:** Sequential implementation (Option A)
**Estimated Timeline:** 12-19 days
**Risk Level:** Low (each phase fully validated before next begins)

---

## Table of Contents

1. [Prerequisites & Dependencies](#prerequisites--dependencies)
2. [Phase 0: Foundation (BLOCKER)](#phase-0-foundation-blocker)
3. [Phase 1: Ecosystem + Logging](#phase-1-ecosystem--logging)
4. [Phase 2: Metrics Tracking](#phase-2-metrics-tracking)
5. [Phase 3: Blog CMS](#phase-3-blog-cms)
6. [Implementation Checklist](#implementation-checklist)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites & Dependencies

### Dependency Graph

```
Phase 0 (Foundation)
    ↓
Phase 1 (Ecosystem + Logging)
    ↓
    ├─→ Phase 2 (Metrics) ← depends on LoggingService
    └─→ Phase 3 (Blog CMS) ← independent, can run parallel
```

### Critical Blockers

| Blocker | Impact | Resolution Required |
|---------|--------|---------------------|
| Menu System | Blocks all new roles | Refactor for multi-role support |
| Role Hierarchy | Conflicts between docs | Align to 5-level hierarchy |
| APP_ID Hardcoding | Maintainability issue | Extract to shared constants |

---

## Phase 0: Foundation (BLOCKER)

**Duration:** 1-2 days
**Priority:** CRITICAL - Must complete before any feature work
**Status:** ⚠️ Blocks all subsequent phases

### Overview

Phase 0 addresses architectural blockers identified in the implementation review. These fixes are **required** before implementing any new features.

### Tasks

#### Task 0.1: Menu System Refactor

**Problem:** Current `MenuConfigService` only supports single-role filtering. New roles (LOGGING_ADMIN, METRICS_ADMIN, EDITOR) require checking if user has ANY of multiple roles.

**Location:** `packages/web/web-app/src/app/ui/menus/menu-config.service.ts`

**Current State:**
```typescript
public getMenus(restriction?: string, includeBeta?: boolean)
```

**Target State:**
```typescript
public getMenus(userRoles: string[], includeBeta?: boolean)
```

**Changes Required:**

1. **Update method signature:**
   ```typescript
   // packages/web/web-app/src/app/ui/menus/menu-config.service.ts
   public getMenus(userRoles: string[], includeBeta?: boolean): AppMenuType[] {
     const menus: AppMenuType[] = []

     // SUPER_ADMIN sees everything
     const isSuperAdmin = userRoles.includes(USER_ROLE.SUPER_ADMIN)

     for (const menu of this.CARDINAL_MENU_SET) {
       const menuItem = this.filterMenuByRoles(menu, userRoles, isSuperAdmin, includeBeta || false)
       if (menuItem) {
         menus.push(menuItem)
       }
     }

     return menus
   }
   ```

2. **Replace individual restrict methods with unified filtering:**
   ```typescript
   private filterMenuByRoles(
     menu: AppMenuType,
     userRoles: string[],
     isSuperAdmin: boolean,
     includeBeta: boolean
   ): AppMenuType | null {
     const items: AppMenuItemType[] = []

     for (const item of menu.items) {
       // Skip beta items if not enabled
       if (!includeBeta && item.beta) continue

       // No restriction = everyone sees it
       if (!item.restriction) {
         items.push(item)
         continue
       }

       // SUPER_ADMIN sees all restricted items
       if (isSuperAdmin) {
         items.push(item)
         continue
       }

       // Check if user has the required role
       if (userRoles.includes(item.restriction)) {
         items.push(item)
       }
     }

     return items.length > 0 ? { ...menu, items } : null
   }
   ```

3. **Update all call sites:**
   - Search for `getMenus(` calls throughout web app
   - Change from `getMenus(userProfile.role)` to `getMenus([userProfile.role])`
   - Or if multi-role support exists: `getMenus(userProfile.roles)`

**Testing:**
- [ ] User with single role sees correct menus
- [ ] SUPER_ADMIN sees all menus
- [ ] Beta flag works correctly
- [ ] No console errors on menu render

---

#### Task 0.2: Role Hierarchy Alignment

**Problem:** LOGGING doc uses order 3 for LOGGING_ADMIN, METRICS doc uses order 4. Additionally, the BLOG-CMS feature requires an EDITOR role that was not included in initial planning.

**Resolution:** Use a 6-level hierarchy with integer ordering to accommodate all roles including EDITOR.

**Target Hierarchy:**
```typescript
USER (1) → EDITOR (2) → ADMIN (3) → METRICS_ADMIN (4) → LOGGING_ADMIN (5) → SUPER_ADMIN (6)
```

**Role Descriptions:**
| Role | Order | Description |
|------|-------|-------------|
| USER | 1 | Standard authenticated user |
| EDITOR | 2 | Blog/content management (Phase 3) |
| ADMIN | 3 | General admin access |
| METRICS_ADMIN | 4 | Business metrics and analytics |
| LOGGING_ADMIN | 5 | System logs (security-sensitive) |
| SUPER_ADMIN | 6 | Full system access |

**Changes Required:**

1. **Update role constants** (if order numbers are defined):
   ```typescript
   // packages/shared/models/src/user-privilege-set/user-privilege-set.consts.ts
   export const USER_PRIVILEGE_SETS_SEED = [
     { name: 'USER', order: 1 },
     { name: 'EDITOR', order: 2 },
     { name: 'ADMIN', order: 3 },
     { name: 'METRICS_ADMIN', order: 4 },
     { name: 'LOGGING_ADMIN', order: 5 },
     { name: 'SUPER_ADMIN', order: 6 },
   ]
   ```

2. **Update LOGGING-TABLE-IMPLEMENTATION-CORRECTED.md:**
   - Find references to LOGGING_ADMIN order: 3
   - Change to order: 5
   - Find references to SUPER_ADMIN order: 4
   - Change to order: 6

3. **Update METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md:**
   - Find references to METRICS_ADMIN order: 3
   - Change to order: 4
   - Find references to LOGGING_ADMIN order: 4
   - Change to order: 5

4. **Update BLOG-CMS-IMPLEMENTATION.md:**
   - EDITOR role now uses integer order: 2 (not 2.5)

**Rationale:**
- EDITOR is above USER but below ADMIN (content management, not system admin)
- ADMIN handles general admin tasks without specialized logging/metrics access
- METRICS_ADMIN sees business metrics (less sensitive than logs)
- LOGGING_ADMIN can view system logs (security-sensitive), inherits METRICS_ADMIN
- SUPER_ADMIN has full access to everything

**Testing:**
- [ ] Role order comparison works correctly (higher order > lower order)
- [ ] Privilege inheritance behaves as expected
- [ ] Database seed creates roles with correct order

---

#### Task 0.3: APP_ID Configuration Constants

**Problem:** Both LOGGING and METRICS docs hardcode parent dashboard check:
```typescript
const IS_PARENT_DASHBOARD = APP_ID === 'dx3-admin'
```

**Resolution:** Extract to shared constants for maintainability.

**Changes Required:**

1. **Add to shared config constants:**
   ```typescript
   // packages/shared/models/src/config/config-shared.consts.ts

   /**
    * Unique identifier for this application in the ecosystem.
    * Set via environment variable APP_ID.
    * Used for logging partitioning and multi-app architectures.
    */
   export const APP_ID = process.env.APP_ID || 'dx3-default'

   /**
    * The APP_ID of the parent dashboard application.
    * Used to determine if current app is the umbrella dashboard.
    */
   export const PARENT_DASHBOARD_APP_ID = 'dx3-admin'

   /**
    * Boolean flag indicating if current app is the parent dashboard.
    * Parent dashboard has read access to all app logs.
    */
   export const IS_PARENT_DASHBOARD_APP = APP_ID === PARENT_DASHBOARD_APP_ID
   ```

2. **Update LOGGING-TABLE-IMPLEMENTATION-CORRECTED.md:**
   - Find: `const IS_PARENT_DASHBOARD = APP_ID === 'dx3-admin'`
   - Replace with: `import { IS_PARENT_DASHBOARD_APP } from '@dx3/models-shared'`
   - Update all usages from `IS_PARENT_DASHBOARD` to `IS_PARENT_DASHBOARD_APP`

3. **Update METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md:**
   - Same changes as above

**Testing:**
- [ ] APP_ID constant available in all packages
- [ ] IS_PARENT_DASHBOARD_APP evaluates correctly
- [ ] No hardcoded 'dx3-admin' strings remain in codebase

---

#### Task 0.4: Create dx-infrastructure Repository

**Purpose:** Separate repository for shared services used across all apps.

**Changes Required:**

1. **Create new GitHub repository:**
   - Name: `dx-infrastructure`
   - Visibility: Private (if apps are private)
   - Description: "Shared infrastructure for dx3 ecosystem (TimescaleDB, PostgreSQL, Redis)"

2. **Create repository structure:**
   ```
   dx-infrastructure/
   ├── docker-compose.yml
   ├── init-scripts/
   │   ├── init-timescale.sql
   │   └── init-shared-pg.sql
   ├── .env.example
   ├── Makefile
   └── README.md
   ```

3. **Create `docker-compose.yml`:**
   ```yaml
   name: dx-infrastructure

   services:
     timescaledb:
       image: timescale/timescaledb:latest-pg16
       container_name: dx-timescaledb-shared
       ports:
         - "5434:5432"
       environment:
         POSTGRES_USER: dxuser
         POSTGRES_PASSWORD: dxpassword
         POSTGRES_DB: dx_logs
       volumes:
         - timescale-data:/var/lib/postgresql/data
         - ./init-scripts/init-timescale.sql:/docker-entrypoint-initdb.d/init.sql
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U dxuser -d dx_logs"]
         interval: 5s
         timeout: 5s
         retries: 5

     postgres-shared:
       image: postgres:16-alpine
       container_name: dx-postgres-shared
       ports:
         - "5435:5432"
       environment:
         POSTGRES_USER: dxuser
         POSTGRES_PASSWORD: dxpassword
         POSTGRES_DB: postgres
       volumes:
         - postgres-shared-data:/var/lib/postgresql/data
         - ./init-scripts/init-shared-pg.sql:/docker-entrypoint-initdb.d/init.sql
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U dxuser"]
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

4. **Create `init-scripts/init-shared-pg.sql`:**
   ```sql
   -- Create databases for lightweight apps
   CREATE DATABASE dx3_admin;
   CREATE DATABASE michelleradnia;
   CREATE DATABASE xxthcenturyboy;

   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE dx3_admin TO dxuser;
   GRANT ALL PRIVILEGES ON DATABASE michelleradnia TO dxuser;
   GRANT ALL PRIVILEGES ON DATABASE xxthcenturyboy TO dxuser;
   ```

5. **Create `init-scripts/init-timescale.sql`:**
   ```sql
   -- Enable extensions
   CREATE EXTENSION IF NOT EXISTS timescaledb;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Basic logs table structure (full schema in Phase 1)
   -- This is a placeholder for Phase 0, will be expanded in Phase 1
   CREATE TABLE IF NOT EXISTS logs (
     id UUID DEFAULT uuid_generate_v4() NOT NULL,
     app_id VARCHAR(64) NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

6. **Create `Makefile`:**
   ```makefile
   .PHONY: help up down logs restart reset

   help:
   	@echo "dx-infrastructure commands:"
   	@echo "  make up       - Start all shared services"
   	@echo "  make down     - Stop all shared services"
   	@echo "  make logs     - View logs from all services"
   	@echo "  make restart  - Restart all services"
   	@echo "  make reset    - Remove all data and restart fresh"

   up:
   	docker compose up -d
   	@echo "Shared infrastructure started:"
   	@echo "  TimescaleDB:       localhost:5434"
   	@echo "  Shared PostgreSQL: localhost:5435"
   	@echo "  Shared Redis:      localhost:6379"

   down:
   	docker compose down

   logs:
   	docker compose logs -f

   restart:
   	docker compose restart

   reset:
   	docker compose down -v
   	docker compose up -d
   ```

7. **Create `README.md`:**
   ```markdown
   # dx-infrastructure

   Shared infrastructure for the dx3 application ecosystem.

   ## Services Provided

   - **TimescaleDB** (port 5434): Centralized logging and metrics
   - **Shared PostgreSQL** (port 5435): Database for lightweight apps
   - **Shared Redis** (port 6379): Cache for lightweight apps

   ## Quick Start

   ```bash
   # Start all services
   make up

   # View logs
   make logs

   # Stop services
   make down
   ```

   ## First-Time Setup

   1. Clone this repository
   2. Run `make up`
   3. Verify services are healthy: `docker ps`

   ## Integration with Apps

   Apps using this infrastructure should set these environment variables:

   ```bash
   TIMESCALE_ENABLED=true
   TIMESCALE_URI=postgresql://dxuser:dxpassword@localhost:5434/dx_logs
   POSTGRES_URI=postgresql://dxuser:dxpassword@localhost:5435/your_db_name
   REDIS_URL=redis://localhost
   REDIS_PORT=6379
   ```
   ```

**Testing:**
- [ ] Repository created and accessible
- [ ] `make up` starts all services successfully
- [ ] Services are accessible on correct ports
- [ ] Health checks pass for all containers
- [ ] Databases are created in shared PostgreSQL

---

#### Task 0.5: Update dx3-monorepo Template

**Purpose:** Add environment variables and integration mode support to template.

**Changes Required:**

1. **Create `.env.integration.example` in root:**
   ```bash
   # Integration Mode Environment Variables
   # Copy to .env.integration and configure for integration development

   # App Identity
   APP_ID=dx3-default

   # Shared Infrastructure
   TIMESCALE_ENABLED=true
   TIMESCALE_URI=postgresql://dxuser:dxpassword@localhost:5434/dx_logs

   # For lightweight apps using shared PostgreSQL
   POSTGRES_URI=postgresql://dxuser:dxpassword@localhost:5435/dx3_admin

   # Shared Redis
   REDIS_URL=redis://localhost
   REDIS_PORT=6379

   # API Configuration (same as standalone)
   API_PORT=4000
   API_URL=http://localhost:4000
   NODE_ENV=development
   ```

2. **Add to all `.env.sample` files:**
   ```bash
   # App Identity (for ecosystem mode)
   APP_ID=dx3-default

   # External Logging (optional)
   TIMESCALE_ENABLED=false
   TIMESCALE_URI=
   ```

3. **Add `make dev:integration` to root Makefile:**
   ```makefile
   dev-integration:
   	@if [ ! -f .env.integration ]; then \
   		echo "Error: .env.integration not found"; \
   		echo "Copy .env.integration.example and configure"; \
   		exit 1; \
   	fi
   	@echo "Starting in integration mode..."
   	@echo "Ensure dx-infrastructure is running: cd ~/Developer/dx-infrastructure && make up"
   	docker compose --env-file .env.integration up -d
   	@echo "Run 'make api-watch' and 'make api-start' in separate terminals"
   ```

**Testing:**
- [ ] `.env.integration.example` exists and is complete
- [ ] `make dev:integration` command works
- [ ] APP_ID environment variable is accessible in code
- [ ] TIMESCALE_ENABLED toggles logging behavior

---

### Phase 0 Completion Checklist

- [ ] Task 0.1: Menu system refactored and tested
- [ ] Task 0.2: Role hierarchy aligned across all docs
- [ ] Task 0.3: APP_ID constants extracted to shared package
- [ ] Task 0.4: dx-infrastructure repository created and working
- [ ] Task 0.5: Template updated with integration mode support
- [ ] All existing tests pass
- [ ] Documentation updated (README.md, CLAUDE.md)

**Exit Criteria:** All tasks complete, all tests passing, dx-infrastructure running successfully.

---

## Phase 1: Ecosystem + Logging

**Duration:** 5-7 days
**Priority:** HIGH - Foundation for Phase 2
**Dependencies:** Phase 0 must be complete
**Reference:** `docs/LOGGING-TABLE-IMPLEMENTATION-CORRECTED.md`

### Overview

Phase 1 implements centralized logging infrastructure with TimescaleDB, including:
- Complete logs hypertable with space partitioning
- LoggingService implementation with fire-and-forget pattern
- LOGGING_ADMIN role and middleware
- Admin dashboard for log viewing
- Real-time Socket.IO notifications
- Continuous aggregates for analytics

### Tasks

#### Task 1.1: TimescaleDB Schema

**Location:** `dx-infrastructure/init-scripts/init-timescale.sql`

**Replace placeholder with full schema:**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create logs hypertable
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  app_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(64) NOT NULL,
  event_subtype VARCHAR(64),
  user_id UUID,
  fingerprint VARCHAR(64),
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  metadata JSONB,
  success BOOLEAN DEFAULT true,
  message TEXT,
  PRIMARY KEY (id, created_at)
);

-- Convert to hypertable with space partitioning by app_id
SELECT create_hypertable(
  'logs',
  'created_at',
  partitioning_column => 'app_id',
  number_partitions => 8,
  if_not_exists => TRUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_app_id ON logs(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_success ON logs(success, created_at DESC);

-- Continuous aggregates for hourly stats
CREATE MATERIALIZED VIEW IF NOT EXISTS logs_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', created_at) AS bucket,
  app_id,
  event_type,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE success = true) AS success_count,
  COUNT(*) FILTER (WHERE success = false) AS error_count,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(duration_ms) AS avg_duration_ms,
  MAX(duration_ms) AS max_duration_ms
FROM logs
GROUP BY bucket, app_id, event_type
WITH NO DATA;

-- Refresh policy for hourly aggregate
SELECT add_continuous_aggregate_policy('logs_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Continuous aggregate for daily stats
CREATE MATERIALIZED VIEW IF NOT EXISTS logs_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  app_id,
  event_type,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE success = true) AS success_count,
  COUNT(*) FILTER (WHERE success = false) AS error_count,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(duration_ms) AS avg_duration_ms
FROM logs
GROUP BY bucket, app_id, event_type
WITH NO DATA;

-- Refresh policy for daily aggregate
SELECT add_continuous_aggregate_policy('logs_daily',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Cross-app aggregate for parent dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS logs_daily_all_apps
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  app_id,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(duration_ms) AS avg_duration_ms
FROM logs
GROUP BY bucket, app_id, event_type
WITH NO DATA;

-- Refresh policy for cross-app aggregate
SELECT add_continuous_aggregate_policy('logs_daily_all_apps',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Retention policy (90 days)
SELECT add_retention_policy('logs', INTERVAL '90 days', if_not_exists => TRUE);
```

**Testing:**
- [ ] Schema applies without errors
- [ ] Hypertable created successfully
- [ ] All indexes exist
- [ ] Continuous aggregates refresh correctly

---

#### Task 1.2: Shared Models & Types

**Location:** `packages/shared/models/src/logging/`

**Files to create:**

1. **`logging-shared.types.ts`:**
   ```typescript
   export type LogEventType =
     | 'USER_LOGIN'
     | 'USER_LOGOUT'
     | 'USER_SIGNUP'
     | 'API_REQUEST'
     | 'API_ERROR'
     | 'DATABASE_QUERY'
     | 'CACHE_HIT'
     | 'CACHE_MISS'
     // ... more event types

   export type LogRecordType = {
     appId: string
     eventType: LogEventType
     eventSubtype?: string
     userId?: string
     fingerprint?: string
     ipAddress?: string
     userAgent?: string
     requestMethod?: string
     requestPath?: string
     statusCode?: number
     durationMs?: number
     metadata?: Record<string, unknown>
     success?: boolean
     message?: string
   }

   export type LogFilters = {
     appId?: string
     eventType?: LogEventType
     userId?: string
     startDate?: Date
     endDate?: Date
     success?: boolean
     limit?: number
     offset?: number
   }
   ```

2. **`logging-shared.consts.ts`:**
   ```typescript
   export const LOG_EVENT_TYPES = {
     USER_LOGIN: 'USER_LOGIN',
     USER_LOGOUT: 'USER_LOGOUT',
     USER_SIGNUP: 'USER_SIGNUP',
     // ... all event types
   } as const

   export const DEFAULT_LOG_LIMIT = 100
   export const MAX_LOG_LIMIT = 1000
   ```

3. **Add barrel export in `index.ts`:**
   ```typescript
   export * from './logging-shared.types'
   export * from './logging-shared.consts'
   ```

**Testing:**
- [ ] Types importable in API and web packages
- [ ] No TypeScript errors

---

#### Task 1.3: LoggingService Implementation

**Location:** `packages/api/libs/logging/`

**Files to create:**

1. **`timescale-connection.service.ts`:**
   ```typescript
   import { Pool } from 'pg'

   export class TimescaleDbConnection {
     private static pool: Pool | null = null
     private static enabled = process.env.TIMESCALE_ENABLED === 'true'

     static async getPool(): Promise<Pool | null> {
       if (!this.enabled) return null

       if (!this.pool) {
         const uri = process.env.TIMESCALE_URI
         if (!uri) {
           console.warn('TIMESCALE_URI not configured')
           return null
         }

         this.pool = new Pool({
           connectionString: uri,
           max: 20,
           idleTimeoutMillis: 30000,
           connectionTimeoutMillis: 2000,
         })
       }

       return this.pool
     }

     static async query(sql: string, params: unknown[]): Promise<unknown> {
       const pool = await this.getPool()
       if (!pool) return null

       return pool.query(sql, params)
     }

     static async close(): Promise<void> {
       if (this.pool) {
         await this.pool.end()
         this.pool = null
       }
     }
   }
   ```

2. **`logging-api.service.ts`:**
   ```typescript
   import { APP_ID, IS_PARENT_DASHBOARD_APP } from '@dx3/models-shared'
   import type { LogRecordType, LogFilters } from '@dx3/models-shared'
   import { TimescaleDbConnection } from './timescale-connection.service'

   export class LoggingService {
     /**
      * Fire-and-forget logging - never blocks main request flow
      */
     async record(data: LogRecordType): Promise<void> {
       try {
         await this.insertLog({
           ...data,
           appId: APP_ID, // Always inject from environment
         })
       } catch (error) {
         // Silent degradation - log to console but don't throw
         console.error('Logging failed (non-blocking):', error)
       }
     }

     private async insertLog(data: LogRecordType): Promise<void> {
       const sql = `
         INSERT INTO logs (
           app_id, event_type, event_subtype, user_id,
           fingerprint, ip_address, user_agent, request_method,
           request_path, status_code, duration_ms, metadata,
           success, message
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       `

       await TimescaleDbConnection.query(sql, [
         data.appId,
         data.eventType,
         data.eventSubtype || null,
         data.userId || null,
         data.fingerprint || null,
         data.ipAddress || null,
         data.userAgent || null,
         data.requestMethod || null,
         data.requestPath || null,
         data.statusCode || null,
         data.durationMs || null,
         data.metadata ? JSON.stringify(data.metadata) : null,
         data.success !== undefined ? data.success : true,
         data.message || null,
       ])
     }

     /**
      * Query logs - respects app_id unless parent dashboard
      */
     async getLogs(filters: LogFilters): Promise<unknown[]> {
       let sql = 'SELECT * FROM logs WHERE 1=1'
       const params: unknown[] = []
       let paramIndex = 1

       // Parent dashboard can query all apps
       if (!IS_PARENT_DASHBOARD_APP && filters.appId) {
         sql += ` AND app_id = $${paramIndex++}`
         params.push(filters.appId)
       } else if (!IS_PARENT_DASHBOARD_APP) {
         // Non-parent apps MUST filter to their own app_id
         sql += ` AND app_id = $${paramIndex++}`
         params.push(APP_ID)
       }

       if (filters.eventType) {
         sql += ` AND event_type = $${paramIndex++}`
         params.push(filters.eventType)
       }

       if (filters.userId) {
         sql += ` AND user_id = $${paramIndex++}`
         params.push(filters.userId)
       }

       if (filters.startDate) {
         sql += ` AND created_at >= $${paramIndex++}`
         params.push(filters.startDate)
       }

       if (filters.endDate) {
         sql += ` AND created_at <= $${paramIndex++}`
         params.push(filters.endDate)
       }

       if (filters.success !== undefined) {
         sql += ` AND success = $${paramIndex++}`
         params.push(filters.success)
       }

       sql += ' ORDER BY created_at DESC'
       sql += ` LIMIT $${paramIndex++}`
       params.push(filters.limit || 100)

       sql += ` OFFSET $${paramIndex++}`
       params.push(filters.offset || 0)

       const result = await TimescaleDbConnection.query(sql, params)
       return (result as { rows: unknown[] }).rows
     }
   }

   export const loggingService = new LoggingService()
   ```

**Testing:**
- [ ] Fire-and-forget pattern works (errors don't crash app)
- [ ] APP_ID correctly injected
- [ ] Parent dashboard can query all apps
- [ ] Regular apps restricted to own app_id
- [ ] Filters work correctly

---

#### Task 1.4: LOGGING_ADMIN Role

**Location:** `packages/api/libs/pg/seeders/`

**Update role seeder:**
```typescript
// Add to existing privilege sets seeder
{
  name: 'LOGGING_ADMIN',
  order: 5,
  description: 'Access to system logs and metrics',
}
```

**Update role middleware:**
```typescript
// packages/api/libs/auth/middleware/role.middleware.ts
export const requireLoggingAdmin = requireRole('LOGGING_ADMIN')
```

**Testing:**
- [ ] Role created in database
- [ ] Order number correct (4)
- [ ] Middleware blocks non-LOGGING_ADMIN users

---

#### Task 1.5: Admin Logging Dashboard

**Location:** `packages/web/web-app/src/app/admin/logs/`

**Files to create:**

1. **Route configuration:**
   - Add to admin menu with `restriction: 'LOGGING_ADMIN'`
   - Route: `/admin/logs`

2. **Components:**
   - `AdminLogsPage.tsx` - Main page wrapper
   - `LogsTable.tsx` - Table with filters
   - `LogsFilters.tsx` - Filter form
   - `LogDetail.tsx` - Detailed log view modal

3. **Redux slice:**
   - `logsSlice.ts` - State management for logs
   - RTK Query endpoints for fetching logs

4. **Socket.IO integration:**
   - Connect to `/admin-logs` namespace
   - Real-time log updates

**Testing:**
- [ ] Only LOGGING_ADMIN can access
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Real-time updates appear
- [ ] Detail view shows full log

---

#### Task 1.6: Socket.IO Real-time Notifications

**Location:** `packages/api/api-app/src/socket/`

**Create `/admin-logs` namespace:**
```typescript
// socket-admin-logs.service.ts
import { Server } from 'socket.io'
import { verifyJWT } from '../auth/jwt.service'
import { UserService } from '../../libs/user/user-api.service'

export function setupAdminLogsNamespace(io: Server) {
  const adminLogsNs = io.of('/admin-logs')

  // Authentication middleware
  adminLogsNs.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const decoded = verifyJWT(token)
      const user = await UserService.findById(decoded.userId)

      if (!user || !hasRole(user, 'LOGGING_ADMIN')) {
        return next(new Error('Insufficient permissions'))
      }

      socket.data.user = user
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  adminLogsNs.on('connection', (socket) => {
    console.log('Admin connected to logs namespace:', socket.data.user.id)

    socket.on('disconnect', () => {
      console.log('Admin disconnected from logs namespace')
    })
  })

  return adminLogsNs
}
```

**Emit logs on critical events:**
```typescript
// After inserting error log
if (data.success === false) {
  io.of('/admin-logs').emit('new-error-log', logData)
}
```

**Testing:**
- [ ] Only authenticated LOGGING_ADMIN can connect
- [ ] Real-time events received in admin dashboard
- [ ] Disconnection handled gracefully

---

### Phase 1 Completion Checklist

- [ ] Task 1.1: TimescaleDB schema deployed
- [ ] Task 1.2: Shared types and constants created
- [ ] Task 1.3: LoggingService implemented and tested
- [ ] Task 1.4: LOGGING_ADMIN role created
- [ ] Task 1.5: Admin dashboard functional
- [ ] Task 1.6: Socket.IO real-time working
- [ ] Integration tests pass
- [ ] Logging works in both standalone and integration modes
- [ ] Documentation updated

**Exit Criteria:** Complete logging infrastructure operational, admin dashboard functional, all tests passing.

---

## Phase 2: Metrics Tracking

**Duration:** 3-5 days
**Priority:** MEDIUM - Business analytics
**Dependencies:** Phase 1 (uses LoggingService)
**Reference:** `docs/METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md`

### Overview

Phase 2 implements hybrid metrics tracking using both GA4 (for marketing) and TimescaleDB (for business metrics), including:
- MetricsService (extends LoggingService)
- METRICS_ADMIN role
- Metrics dashboard
- GTM + GA4 integration
- Continuous aggregates for metrics

### Tasks

#### Task 2.1: Metrics Schema

**Location:** `dx-infrastructure/init-scripts/init-timescale.sql`

**Add to existing schema:**
```sql
-- Metrics table (similar to logs but with metric-specific fields)
CREATE TABLE IF NOT EXISTS metrics (
  id UUID DEFAULT uuid_generate_v4() NOT NULL,
  app_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type VARCHAR(64) NOT NULL,
  metric_name VARCHAR(128) NOT NULL,
  metric_value NUMERIC,
  user_id UUID,
  metadata JSONB,
  PRIMARY KEY (id, created_at)
);

-- Convert to hypertable
SELECT create_hypertable(
  'metrics',
  'created_at',
  partitioning_column => 'app_id',
  number_partitions => 8,
  if_not_exists => TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_app_id ON metrics(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metric_type, created_at DESC);

-- Daily metrics aggregate
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  app_id,
  metric_type,
  metric_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(metric_value) AS avg_value,
  SUM(metric_value) AS total_value
FROM metrics
GROUP BY bucket, app_id, metric_type, metric_name
WITH NO DATA;

-- Refresh policy: refresh daily (aligned with METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md)
SELECT add_continuous_aggregate_policy('metrics_daily',
  start_offset => INTERVAL '1 day',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);
```

**Testing:**
- [ ] Schema applies successfully
- [ ] Hypertable and aggregates created

---

#### Task 2.2: MetricsService Implementation

**Location:** `packages/api/libs/metrics/`

**Create service that reuses LoggingService:**
```typescript
import { loggingService } from '../logging/logging-api.service'
import type { LogRecordType } from '@dx3/models-shared'

export class MetricsService {
  /**
   * Track metric by logging to metrics table via LoggingService
   */
  async track(metricData: MetricRecordType): Promise<void> {
    // Convert metric to log format
    const logData: LogRecordType = {
      eventType: 'METRIC_TRACKED',
      eventSubtype: metricData.metricType,
      userId: metricData.userId,
      metadata: {
        metricName: metricData.metricName,
        metricValue: metricData.metricValue,
        ...metricData.metadata,
      },
    }

    await loggingService.record(logData)
  }

  /**
   * Query metrics - similar to loggingService.getLogs
   */
  async getMetrics(filters: MetricFilters): Promise<unknown[]> {
    // Implementation similar to getLogs
  }
}

export const metricsService = new MetricsService()
```

**Testing:**
- [ ] Metrics tracked successfully
- [ ] Dual tracking to GA4 and TimescaleDB works
- [ ] No duplicate events (deduplication working)

---

#### Task 2.3: METRICS_ADMIN Role

**Update seeder:**
```typescript
{
  name: 'METRICS_ADMIN',
  order: 4,
  description: 'Access to business metrics and analytics',
}
```

**Testing:**
- [ ] Role created with correct order
- [ ] Middleware works

---

#### Task 2.4: Metrics Dashboard

**Location:** `packages/web/web-app/src/app/admin/metrics/`

**Components:**
- Charts for DAU, MAU, signups, revenue
- Date range selector
- App filter (for parent dashboard)
- Export functionality

**Testing:**
- [ ] Only METRICS_ADMIN can access
- [ ] Charts render correctly
- [ ] Data updates daily

---

#### Task 2.5: GTM + GA4 Integration

**Location:** `packages/web/web-app/src/app/analytics/`

**GTM script loader with error handling (from CORRECTED doc):**
```typescript
const script = document.createElement('script')
script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
script.onerror = () => {
  console.error('Failed to load GTM script')
  // Fallback: metrics still tracked to TimescaleDB
}
document.head.appendChild(script)
```

**Testing:**
- [ ] GTM loads successfully
- [ ] GA4 events tracked
- [ ] Fallback works when GTM fails

---

### Phase 2 Completion Checklist

- [ ] Task 2.1: Metrics schema deployed
- [ ] Task 2.2: MetricsService implemented
- [ ] Task 2.3: METRICS_ADMIN role created
- [ ] Task 2.4: Metrics dashboard functional
- [ ] Task 2.5: GTM + GA4 integrated
- [ ] Deduplication strategy implemented
- [ ] All tests passing

**Exit Criteria:** Hybrid metrics tracking operational, dashboards functional, GA4 integration working.

---

## Phase 3: Blog CMS

**Duration:** 3-5 days
**Priority:** LOW - Can be deferred if needed
**Dependencies:** None (completely independent)
**Reference:** `docs/BLOG-CMS-IMPLEMENTATION.md`

### Overview

Phase 3 implements a full-featured blog/CMS system, including:
- Blog post CRUD operations
- Markdown rendering (existing capability)
- Draft/schedule/publish workflow
- Revision history
- SEO optimization (SSR)
- Editor role

### Tasks Summary

(See BLOG-CMS-IMPLEMENTATION.md for full details)

#### Task 3.1: Database Models
- Blog posts table
- Revisions table
- Tags/categories

#### Task 3.2: API Endpoints
- CRUD operations
- Publish/unpublish
- Scheduling
- Revision restore

#### Task 3.3: Editor Role
- Create EDITOR role (order: 2, between USER and ADMIN)
- Middleware for blog management (`requireRole('EDITOR')`)
- Add menu restriction for `/admin/blog/*` routes: `restriction: 'EDITOR'`

#### Task 3.4: Admin UI
- Post editor (Markdown)
- Post list with filters
- Scheduling interface
- Revision history viewer

#### Task 3.5: Public Blog Pages
- Blog index (SSR)
- Individual post pages (SSR)
- Tag/category filtering
- RSS feed generation

### Phase 3 Completion Checklist

- [ ] All database models created
- [ ] API endpoints functional
- [ ] EDITOR role working
- [ ] Admin UI complete
- [ ] Public pages rendering (SSR)
- [ ] SEO optimized
- [ ] Tests passing

---

## Implementation Checklist

### Pre-Implementation

- [ ] Review all 4 corrected/original documents
- [ ] Ensure team understands dependency graph
- [ ] Set up development environment (dx-infrastructure repo)
- [ ] Backup current database state

### Phase 0: Foundation

- [ ] Menu system supports multi-role
- [ ] Role hierarchy aligned (order 1-6, includes EDITOR)
- [ ] APP_ID constants in shared package
- [ ] dx-infrastructure repository created
- [ ] Template updated with integration mode
- [ ] All tests pass

### Phase 1: Ecosystem + Logging

- [ ] TimescaleDB schema complete
- [ ] LoggingService implemented
- [ ] LOGGING_ADMIN role active
- [ ] Admin dashboard functional
- [ ] Socket.IO real-time working
- [ ] Integration tests pass

### Phase 2: Metrics Tracking

- [ ] Metrics schema deployed
- [ ] MetricsService working
- [ ] METRICS_ADMIN role active
- [ ] Metrics dashboard complete
- [ ] GA4 integrated
- [ ] Deduplication working

### Phase 3: Blog CMS

- [ ] Database models created
- [ ] API complete
- [ ] EDITOR role active
- [ ] Admin UI functional
- [ ] Public pages live
- [ ] SEO optimized

### Post-Implementation

- [ ] Full integration test across all features
- [ ] Performance testing (query times, dashboard load)
- [ ] Security audit (role permissions, Socket.IO auth)
- [ ] Documentation complete
- [ ] Training materials created (if needed)

---

## Testing Strategy

### Unit Tests

**Phase 0:**
- Menu system filtering logic
- Role hierarchy comparisons

**Phase 1:**
- LoggingService.record() with mocks
- Log filtering by app_id
- Parent dashboard query logic

**Phase 2:**
- MetricsService.track() with mocks
- Deduplication logic
- Aggregate calculations

**Phase 3:**
- Blog CRUD operations
- Markdown rendering
- Revision history

### Integration Tests

**Phase 1:**
- End-to-end logging flow (API → TimescaleDB → Query)
- Continuous aggregate refresh
- Multi-app partitioning

**Phase 2:**
- Dual tracking (GA4 + TimescaleDB)
- Metrics aggregation
- Dashboard data flow

**Phase 3:**
- Full blog workflow (draft → publish → view)
- SSR rendering
- Scheduling system

### E2E Tests

**Phase 1:**
- Admin can view logs dashboard
- Real-time updates appear
- Export CSV works

**Phase 2:**
- Admin can view metrics dashboard
- Charts render correctly
- GA4 events tracked

**Phase 3:**
- Editor can create/publish post
- Public blog pages accessible
- SEO tags present

---

## Rollback Procedures

### Phase 0 Rollback

**If menu system breaks:**
```bash
git revert <menu-refactor-commit>
pnpm build
```

**If role seeder fails:**
```sql
DELETE FROM user_privilege_sets WHERE name IN ('EDITOR', 'LOGGING_ADMIN', 'METRICS_ADMIN');
```

### Phase 1 Rollback

**If logging breaks production:**
1. Set `TIMESCALE_ENABLED=false` in environment
2. Restart API (falls back to console logging)
3. Debug TimescaleDB connection

**If dashboard has issues:**
1. Remove `/admin/logs` route
2. Deploy without dashboard
3. Fix and redeploy later

### Phase 2 Rollback

**If metrics tracking fails:**
1. Disable GTM script loader
2. Set `TIMESCALE_ENABLED=false` for metrics
3. Continue with logs only

### Phase 3 Rollback

**If blog CMS breaks:**
1. Remove blog routes
2. Hide blog from menu
3. Blog is independent - no impact on other features

---

## Success Criteria

### Phase 0
✅ All existing tests pass
✅ Menu system supports multiple roles
✅ dx-infrastructure running locally
✅ Template ready for cloning

### Phase 1
✅ Logs written to TimescaleDB successfully
✅ Admin dashboard shows logs in real-time
✅ Parent dashboard can query all apps
✅ Performance: 95th percentile query < 100ms

### Phase 2
✅ Metrics tracked to both GA4 and TimescaleDB
✅ Dashboards show accurate DAU/MAU/signups
✅ No duplicate events
✅ GTM integration working

### Phase 3
✅ Blog posts publishable by editors
✅ Public blog pages load with SSR
✅ SEO tags present and correct
✅ Performance: Time to First Byte < 200ms

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Menu system breaks existing roles | Medium | High | Comprehensive testing before Phase 1 |
| TimescaleDB performance issues | Low | Medium | Start with small data, monitor query times |
| Dual tracking creates duplicates | Medium | Low | Implement deduplication from start |
| Blog SSR impacts performance | Low | Medium | Use caching, monitor TTFB |
| Role hierarchy confusion | Low | Low | Clear documentation, visual diagrams |

---

## Next Steps

1. **Review this document** with team
2. **Set up dx-infrastructure** repository
3. **Begin Phase 0** implementation
4. **Run Phase 0 tests** until all pass
5. **Proceed to Phase 1**

---

**Document Version:** 1.2
**Last Updated:** January 29, 2026
**Status:** Ready for Implementation
**Estimated Total Duration:** 12-19 days
**Recommended Strategy:** Sequential (Option A)
**Change Log:**
- v1.2 - Updated role hierarchy to 6-level system (1-6) including EDITOR role for Blog CMS; aligned all role order references
- v1.1 - Aligned metrics_daily refresh policy to daily (matches METRICS-TRACKING-IMPLEMENTATION-CORRECTED.md)
