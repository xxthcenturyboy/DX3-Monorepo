# Logging Table Implementation Plan

## Overview

This document outlines the implementation strategy for a comprehensive logging system in the DX3 monorepo. The system will capture request logs, authentication attempts, and other trackable events to a **dedicated TimescaleDB database** (separate from the main application database) for analytics, security auditing, and debugging purposes.

### Why TimescaleDB?

- **Optimized for time-series data**: Logs are inherently time-series data with high write throughput
- **Automatic partitioning**: Hypertables handle time-based partitioning automatically
- **Built-in compression**: Up to 90% storage reduction for older data
- **Retention policies**: Automatic cleanup of old data without manual maintenance
- **Continuous aggregates**: Pre-computed rollups for fast dashboard queries
- **Isolation**: Separate database prevents logging from impacting main app performance

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
   - [Architecture Options](#architecture-options)
   - [Migration Guide for Option B](#migration-guide-for-option-b-existing-database)
3. [Database Schema Design](#database-schema-design)
4. [File Structure](#file-structure)
5. [Implementation Details](#implementation-details)
6. [Integration Points](#integration-points)
7. [Usage Examples](#usage-examples)
8. [Testing Considerations](#testing-considerations)
9. [Future Enhancements](#future-enhancements)
10. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### System Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           LOGGING ARCHITECTURE                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         ENTRY POINTS                                 │     │
│  ├─────────────────┬─────────────────┬─────────────────┬───────────────┤     │
│  │  logRequest()   │  Auth Attempts  │  Rate Limiter   │  Custom Events│     │
│  │  (existing)     │  (login/signup) │  Triggers       │  (extensible) │     │
│  └────────┬────────┴────────┬────────┴────────┬────────┴───────┬───────┘     │
│           │                 │                 │                │             │
│           ▼                 ▼                 ▼                ▼             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                    LOGGING SERVICE                                   │     │
│  │  ┌─────────────────────────────────────────────────────────────┐    │     │
│  │  │  LoggingService.record({...})                                │    │     │
│  │  │  - Validates data                                            │    │     │
│  │  │  - Extracts request context (IP, geo, user agent, etc.)      │    │     │
│  │  │  - Writes to TimescaleDB (async, non-blocking)               │    │     │
│  │  └─────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│           ┌────────────────────────┴────────────────────────┐                │
│           ▼                                                  ▼               │
│  ┌─────────────────────────┐              ┌──────────────────────────────┐   │
│  │   dx-app (PostgreSQL)   │              │   dx-logs (TimescaleDB)      │   │
│  │  ┌───────────────────┐  │              │  ┌────────────────────────┐  │   │
│  │  │  users            │  │              │  │  logs (Hypertable)     │  │   │
│  │  │  devices          │  │              │  │  - Auto-partitioned    │  │   │
│  │  │  emails           │  │              │  │  - Compressed (>7d)    │  │   │
│  │  │  phones           │  │              │  │  - Retention: 90 days  │  │   │
│  │  │  feature_flags    │  │              │  └────────────────────────┘  │   │
│  │  │  support_requests │  │              │  ┌────────────────────────┐  │   │
│  │  │  ...              │  │              │  │  logs_hourly (CAgg)    │  │   │
│  │  └───────────────────┘  │              │  │  logs_daily (CAgg)     │  │   │
│  └─────────────────────────┘              │  └────────────────────────┘  │   │
│                                           └──────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request Entry**: API requests trigger `logRequest()` or auth controllers
2. **Context Extraction**: LoggingService extracts all available context from the Express Request
3. **Async Write**: Logs are written to TimescaleDB (non-blocking, fire-and-forget)
4. **Automatic Management**: TimescaleDB handles partitioning, compression, and retention
5. **Queryable Data**: Data available for admin dashboards, security audits, analytics

---

## Database Setup

### Environment Variables

Add to `.env` files:

```bash
# Main application database (existing)
POSTGRES_URI=postgresql://user:password@localhost:5432/dx-app

# Logs database (new - TimescaleDB)
TIMESCALE_URI=postgresql://user:password@localhost:5432/dx-logs
```

---

### Architecture Options

#### Option A: Separate Container (Recommended for Production)

Spin up a dedicated TimescaleDB container for complete isolation:

```yaml
services:
  # Existing main postgres for dx-app
  postgres:
    image: postgres:16
    # ... existing config ...

  # New TimescaleDB container for dx-logs
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: dx-timescaledb
    environment:
      POSTGRES_USER: ${TIMESCALE_USER:-dx}
      POSTGRES_PASSWORD: ${TIMESCALE_PASSWORD:-dx_password}
      POSTGRES_DB: dx-logs
    ports:
      - "5433:5432"  # Different external port
    volumes:
      - timescale_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dx -d dx-logs"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  timescale_data:
```

With this option, update `.env`:
```bash
TIMESCALE_URI=postgresql://user:password@localhost:5433/dx-logs
```

#### Option B: Same Container, Separate Database (Simpler Setup)

Replace your existing postgres image with TimescaleDB and create both databases in one container:

```yaml
services:
  # Single TimescaleDB container with both databases
  postgres:
    image: timescale/timescaledb:latest-pg16  # Changed from postgres:16
    container_name: dx-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-dx}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dx_password}
      POSTGRES_DB: dx-app  # Primary database
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-databases.sql:/docker-entrypoint-initdb.d/init-databases.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dx -d dx-app"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Create `init-databases.sql` to set up the logs database:
```sql
-- Create the logs database
CREATE DATABASE "dx-logs";

-- Connect to dx-logs and enable TimescaleDB
\c "dx-logs"
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Also enable extensions on dx-app if needed
\c "dx-app"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";
```

With this option, `.env` stays on the same host:
```bash
POSTGRES_URI=postgresql://user:password@localhost:5432/dx-app
TIMESCALE_URI=postgresql://user:password@localhost:5432/dx-logs
```

**Note:** Option B requires using the TimescaleDB image for your main postgres. This is fully compatible with standard PostgreSQL - TimescaleDB is just PostgreSQL with added features.

---

### Migration Guide for Option B (Existing Database)

If you have an existing PostgreSQL database with data, follow these steps to migrate to the TimescaleDB image.

#### About the TimescaleDB Image

The `timescale/timescaledb` image is the **official image from Timescale Inc.**, built directly on top of the official PostgreSQL image. Your existing data is fully compatible because:
- TimescaleDB uses the same data directory format as PostgreSQL
- Your existing `dx-app` database doesn't need to change
- Only the new `dx-logs` database will use TimescaleDB features

**Important:** Match the PostgreSQL major version:
| Current Image | TimescaleDB Image |
|---------------|-------------------|
| `postgres:16` | `timescale/timescaledb:latest-pg16` |
| `postgres:15` | `timescale/timescaledb:latest-pg15` |
| `postgres:14` | `timescale/timescaledb:latest-pg14` |

#### Pre-Migration Checklist

- [ ] Verify current PostgreSQL version
- [ ] Ensure you have enough disk space for a backup
- [ ] Notify team members of planned downtime
- [ ] Have rollback plan ready (keep backup accessible)

#### Step 1: Verify Current PostgreSQL Version

```bash
docker exec dx-postgres psql -V
# Example output: psql (PostgreSQL) 16.1
```

#### Step 2: Backup Your Database

**Always backup before making infrastructure changes!**

```bash
# Full backup of all databases
docker exec dx-postgres pg_dumpall -U dx > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file was created and has content
ls -la backup_*.sql
head -50 backup_*.sql
```

#### Step 3: Bring Down All Services

```bash
docker compose down
```

#### Step 4: Update docker-compose.yml

Change the postgres image from `postgres:16` to `timescale/timescaledb:latest-pg16`:

```yaml
services:
  postgres:
    image: timescale/timescaledb:latest-pg16  # Changed from postgres:16
    container_name: dx-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-dx}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dx_password}
      POSTGRES_DB: dx-app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Same volume - data preserved!
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dx -d dx-app"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Note:** Do NOT include the `init-databases.sql` mount for existing databases - init scripts only run on empty data directories.

#### Step 5: Bring Services Back Up

```bash
docker compose up -d

# Watch the logs to ensure startup is successful
docker compose logs -f postgres
```

#### Step 6: Verify TimescaleDB is Available

```bash
# Check that TimescaleDB extension is available
docker exec dx-postgres psql -U dx -d dx-app -c \
  "SELECT default_version FROM pg_available_extensions WHERE name = 'timescaledb';"

# Expected output:
#  default_version
# -----------------
#  2.x.x
```

#### Step 7: Create the dx-logs Database

Since the init script doesn't run on existing data directories, create the logs database manually:

```bash
# Create the dx-logs database
docker exec dx-postgres psql -U dx -d postgres -c 'CREATE DATABASE "dx-logs";'

# Enable TimescaleDB extension
docker exec dx-postgres psql -U dx -d dx-logs -c 'CREATE EXTENSION IF NOT EXISTS timescaledb;'

# Enable UUID extension
docker exec dx-postgres psql -U dx -d dx-logs -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

# Verify extensions are enabled
docker exec dx-postgres psql -U dx -d dx-logs -c '\dx'
```

#### Step 8: Verify Everything Works

```bash
# Test connection to dx-app (existing data should be intact)
docker exec dx-postgres psql -U dx -d dx-app -c 'SELECT COUNT(*) FROM users;'

# Test connection to dx-logs
docker exec dx-postgres psql -U dx -d dx-logs -c 'SELECT extversion FROM pg_extension WHERE extname = '\''timescaledb'\'';'

# Verify both databases exist
docker exec dx-postgres psql -U dx -d postgres -c '\l'
```

#### Rollback Plan (If Something Goes Wrong)

If the migration fails, you can rollback:

```bash
# 1. Bring down services
docker compose down

# 2. Revert docker-compose.yml to use postgres:16

# 3. Bring services back up
docker compose up -d

# 4. If data was corrupted, restore from backup:
cat backup_YYYYMMDD_HHMMSS.sql | docker exec -i dx-postgres psql -U dx -d postgres
```

#### Migration Complete Checklist

- [ ] Services are running: `docker compose ps`
- [ ] dx-app database accessible with existing data
- [ ] dx-logs database created
- [ ] TimescaleDB extension enabled in dx-logs
- [ ] UUID extension enabled in dx-logs
- [ ] Application connects successfully
- [ ] Backup file stored safely (keep for at least 1 week)

---

### Initial Database Setup Script (New Installations Only)

> **Note:** This script is for **fresh installations** where no data exists. If you're migrating an existing database, follow the [Migration Guide for Option B](#migration-guide-for-option-b-existing-database) above instead.

Create `_devops/scripts/timescale-init.sh`:

```bash
#!/bin/bash
# Initialize TimescaleDB for logging
# NOTE: Only run this for NEW installations, not migrations!

set -e

TIMESCALE_URI="${TIMESCALE_URI:-postgresql://dx:dx_password@localhost:5432/dx-logs}"

echo "Initializing TimescaleDB..."

# Check if dx-logs database exists, create if not
psql "${TIMESCALE_URI%/*}/postgres" -tc "SELECT 1 FROM pg_database WHERE datname = 'dx-logs'" | grep -q 1 || \
  psql "${TIMESCALE_URI%/*}/postgres" -c 'CREATE DATABASE "dx-logs";'

psql "$TIMESCALE_URI" <<EOF
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify TimescaleDB is enabled
SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';

\echo 'TimescaleDB initialized successfully!'
EOF
```

---

## Database Schema Design

### Core Schema: `logs` Hypertable

```sql
-- Create the base table
CREATE TABLE logs (
  -- Primary identifier (NOT a primary key - hypertables use time + unique constraint)
  id UUID DEFAULT uuid_generate_v4() NOT NULL,

  -- Time column (required for hypertable, must be NOT NULL)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Event Classification
  event_type VARCHAR(64) NOT NULL,          -- e.g., 'REQUEST', 'AUTH_LOGIN', 'AUTH_SIGNUP', 'AUTH_FAILURE', 'RATE_LIMIT'
  event_subtype VARCHAR(64),                -- e.g., 'success', 'failure', 'otp_sent', 'biometric'

  -- User Context (nullable for anonymous requests)
  user_id UUID,                             -- References users table in main DB (not FK - separate DB)
  fingerprint VARCHAR(64),                  -- Browser/device fingerprint
  device_id VARCHAR(128),                   -- Mobile device ID (from headers/body)

  -- Request Context
  ip_address INET,                          -- PostgreSQL INET type for proper IP handling
  user_agent TEXT,
  http_method VARCHAR(10),                  -- GET, POST, PUT, DELETE, PATCH
  request_path VARCHAR(512),                -- The endpoint path
  request_params JSONB,                     -- Sanitized params/query (no sensitive data)
  request_body_summary JSONB,               -- Sanitized summary of body (no passwords, etc.)

  -- Response Info
  response_status_code SMALLINT,
  response_time_ms INTEGER,                 -- Time to process request in milliseconds

  -- Geolocation (from MaxMind GeoIP)
  geo_country VARCHAR(3),                   -- ISO country code (e.g., 'US')
  geo_region VARCHAR(10),                   -- State/province code
  geo_city VARCHAR(128),
  geo_timezone VARCHAR(64),

  -- Additional Context
  session_id VARCHAR(128),                  -- Session identifier if available
  referrer VARCHAR(512),                    -- HTTP Referrer header
  origin VARCHAR(256),                      -- Request origin

  -- Outcome/Message
  success BOOLEAN DEFAULT true,
  message TEXT,                             -- Error message, info, etc.
  error_code VARCHAR(32),                   -- Our error codes (from ERROR_CODES)

  -- Metadata
  metadata JSONB                            -- Extensible field for additional data
);

-- Convert to hypertable (partitioned by time, 1-day chunks)
SELECT create_hypertable(
  'logs',
  'created_at',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- Create indexes (TimescaleDB automatically creates index on time column)
CREATE INDEX idx_logs_event_type ON logs(event_type, created_at DESC);
CREATE INDEX idx_logs_user_id ON logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_logs_fingerprint ON logs(fingerprint, created_at DESC) WHERE fingerprint IS NOT NULL;
CREATE INDEX idx_logs_ip_address ON logs(ip_address, created_at DESC);
CREATE INDEX idx_logs_success ON logs(success, created_at DESC) WHERE success = false;

-- Composite index for auth failure lookups
CREATE INDEX idx_logs_auth_failures ON logs(event_type, ip_address, created_at DESC)
  WHERE event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE') AND success = false;
```

### Compression Policy (Automatic)

```sql
-- Enable compression on the hypertable
ALTER TABLE logs SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'event_type',
  timescaledb.compress_orderby = 'created_at DESC'
);

-- Add compression policy: compress chunks older than 7 days
SELECT add_compression_policy('logs', INTERVAL '7 days');
```

### Retention Policy (Automatic Cleanup)

```sql
-- Automatically drop data older than 90 days
SELECT add_retention_policy('logs', INTERVAL '90 days');
```

### Continuous Aggregates (Pre-computed Rollups)

```sql
-- Hourly aggregates for dashboard queries
CREATE MATERIALIZED VIEW logs_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', created_at) AS bucket,
  event_type,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE success = true) AS success_count,
  COUNT(*) FILTER (WHERE success = false) AS failure_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT ip_address) AS unique_ips,
  AVG(response_time_ms) AS avg_response_time_ms,
  MAX(response_time_ms) AS max_response_time_ms
FROM logs
GROUP BY bucket, event_type
WITH NO DATA;

-- Refresh policy: refresh hourly aggregates every hour
SELECT add_continuous_aggregate_policy('logs_hourly',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);

-- Daily aggregates for longer-term analytics
CREATE MATERIALIZED VIEW logs_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  event_type,
  geo_country,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE success = true) AS success_count,
  COUNT(*) FILTER (WHERE success = false) AS failure_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT ip_address) AS unique_ips,
  COUNT(DISTINCT fingerprint) AS unique_fingerprints,
  AVG(response_time_ms) AS avg_response_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_response_time_ms
FROM logs
GROUP BY bucket, event_type, geo_country
WITH NO DATA;

-- Refresh policy: refresh daily aggregates every day
SELECT add_continuous_aggregate_policy('logs_daily',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day'
);
```

### Event Types (Constants)

```typescript
export const LOG_EVENT_TYPE = {
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_SIGNUP: 'AUTH_SIGNUP',
  DEVICE_REJECTED: 'DEVICE_REJECTED',
  DEVICE_VERIFIED: 'DEVICE_VERIFIED',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  RATE_LIMIT: 'RATE_LIMIT',
  REQUEST: 'REQUEST',
  SECURITY_ALERT: 'SECURITY_ALERT',
} as const

export type LogEventType = (typeof LOG_EVENT_TYPE)[keyof typeof LOG_EVENT_TYPE]

export const LOG_EVENT_SUBTYPE = {
  BIOMETRIC: 'biometric',
  EMAIL: 'email',
  FAILURE: 'failure',
  PASSWORD: 'password',
  PHONE: 'phone',
  SUCCESS: 'success',
  USERNAME: 'username',
} as const

export type LogEventSubtype = (typeof LOG_EVENT_SUBTYPE)[keyof typeof LOG_EVENT_SUBTYPE]
```

---

## File Structure

```
packages/
├── shared/
│   └── models/
│       └── src/
│           └── logging/
│               ├── logging-shared.consts.ts      # LOG_EVENT_TYPE, LOG_EVENT_SUBTYPE
│               ├── logging-shared.consts.spec.ts
│               ├── logging-shared.types.ts       # LogEventType, LogRecordType
│               └── index.ts
│
├── api/
│   ├── libs/
│   │   ├── logging/
│   │   │   ├── logging-api.consts.ts             # LOGS_TABLE_NAME
│   │   │   ├── logging-api.consts.spec.ts
│   │   │   ├── logging-api.service.ts            # LoggingService class
│   │   │   ├── logging-api.service.spec.ts
│   │   │   ├── logging-api.types.ts              # Service-specific types
│   │   │   └── index.ts
│   │   │
│   │   ├── timescale/                            # NEW: TimescaleDB connection
│   │   │   ├── timescale.db-connection.ts        # TimescaleDbConnection class
│   │   │   ├── timescale.db-connection.spec.ts
│   │   │   ├── timescale.environment.ts          # getTimescaleUriForEnvironment
│   │   │   ├── timescale.environment.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   └── logger/
│   │       └── log-request.util.ts               # Modified to call LoggingService
│   │
│   └── api-app/
│       └── src/
│           ├── data/
│           │   └── timescale/                    # NEW: TimescaleDB initialization
│           │       ├── dx-timescale.db.ts        # DxTimescaleDb class
│           │       └── dx-timescale.schema.ts    # Schema creation SQL
│           │
│           └── logging/                          # Optional: Admin routes for viewing logs
│               ├── logging-api.controller.ts
│               ├── logging-api.controller.spec.ts
│               ├── logging-api.routes.ts
│               └── logging-api.routes.spec.ts

_devops/
└── scripts/
    └── timescale-init.sh                         # NEW: TimescaleDB initialization script
```

---

## Implementation Details

### 1. Shared Constants and Types

**`packages/shared/models/src/logging/logging-shared.consts.ts`**

```typescript
export const LOG_EVENT_TYPE = {
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_SIGNUP: 'AUTH_SIGNUP',
  DEVICE_REJECTED: 'DEVICE_REJECTED',
  DEVICE_VERIFIED: 'DEVICE_VERIFIED',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  RATE_LIMIT: 'RATE_LIMIT',
  REQUEST: 'REQUEST',
  SECURITY_ALERT: 'SECURITY_ALERT',
} as const

export const LOG_EVENT_TYPE_ARRAY = Object.values(LOG_EVENT_TYPE)

export const LOG_EVENT_SUBTYPE = {
  BIOMETRIC: 'biometric',
  EMAIL: 'email',
  FAILURE: 'failure',
  PASSWORD: 'password',
  PHONE: 'phone',
  SUCCESS: 'success',
  USERNAME: 'username',
} as const

export const LOG_EVENT_SUBTYPE_ARRAY = Object.values(LOG_EVENT_SUBTYPE)
```

**`packages/shared/models/src/logging/logging-shared.types.ts`**

```typescript
import type { LOG_EVENT_SUBTYPE, LOG_EVENT_TYPE } from './logging-shared.consts'

export type LogEventSubtype = (typeof LOG_EVENT_SUBTYPE)[keyof typeof LOG_EVENT_SUBTYPE]

export type LogEventType = (typeof LOG_EVENT_TYPE)[keyof typeof LOG_EVENT_TYPE]

export type LogRecordType = {
  createdAt?: Date
  deviceId?: string
  errorCode?: string
  eventSubtype?: LogEventSubtype | string
  eventType: LogEventType
  fingerprint?: string
  geoCity?: string
  geoCountry?: string
  geoRegion?: string
  geoTimezone?: string
  httpMethod?: string
  id?: string
  ipAddress?: string
  message?: string
  metadata?: Record<string, unknown>
  origin?: string
  referrer?: string
  requestBodySummary?: Record<string, unknown>
  requestParams?: Record<string, unknown>
  requestPath?: string
  responseStatusCode?: number
  responseTimeMs?: number
  sessionId?: string
  success?: boolean
  userAgent?: string
  userId?: string
}

export type LogsHourlySummaryType = {
  avgResponseTimeMs: number
  bucket: Date
  eventType: LogEventType
  failureCount: number
  maxResponseTimeMs: number
  successCount: number
  totalCount: number
  uniqueIps: number
  uniqueUsers: number
}

export type LogsDailySummaryType = {
  avgResponseTimeMs: number
  bucket: Date
  eventType: LogEventType
  failureCount: number
  geoCountry: string
  p95ResponseTimeMs: number
  successCount: number
  totalCount: number
  uniqueFingerprints: number
  uniqueIps: number
  uniqueUsers: number
}

export type GetLogsListQueryType = {
  endDate?: Date
  eventType?: LogEventType
  filterValue?: string
  fingerprint?: string
  ipAddress?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'eventType' | 'ipAddress'
  sortDir?: 'ASC' | 'DESC'
  startDate?: Date
  success?: boolean
  userId?: string
}
```

### 2. TimescaleDB Connection Class

**`packages/api/libs/timescale/timescale.db-connection.ts`**

```typescript
import { Pool, type PoolClient, type QueryResult } from 'pg'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'

export type TimescaleConnectionConfig = {
  connectionTimeoutMillis?: number
  idleTimeoutMillis?: number
  max?: number
  timescaleUri: string
}

export class TimescaleDbConnection {
  private static instance: TimescaleDbConnection | null = null
  private static pool: Pool | null = null

  private config: TimescaleConnectionConfig
  private logger: ApiLoggingClassType
  private retries = 5

  private constructor(config: TimescaleConnectionConfig) {
    this.config = config
    this.logger = ApiLoggingClass.instance
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(config?: TimescaleConnectionConfig): TimescaleDbConnection {
    if (!TimescaleDbConnection.instance) {
      if (!config) {
        throw new Error('TimescaleDbConnection requires config on first initialization')
      }
      TimescaleDbConnection.instance = new TimescaleDbConnection(config)
    }
    return TimescaleDbConnection.instance
  }

  /**
   * Get the connection pool
   */
  public static get pool(): Pool | null {
    return TimescaleDbConnection.pool
  }

  /**
   * Initialize the connection pool
   */
  public async initialize(): Promise<void> {
    if (TimescaleDbConnection.pool) {
      this.logger.logInfo('TimescaleDB pool already initialized')
      return
    }

    TimescaleDbConnection.pool = new Pool({
      connectionString: this.config.timescaleUri,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis ?? 10000,
      idleTimeoutMillis: this.config.idleTimeoutMillis ?? 30000,
      max: this.config.max ?? 20,
    })

    // Handle pool errors
    TimescaleDbConnection.pool.on('error', (err) => {
      this.logger.logError(`TimescaleDB pool error: ${err.message}`)
    })

    while (this.retries > 0) {
      try {
        this.logger.logInfo('Establishing TimescaleDB Connection...')
        const client = await TimescaleDbConnection.pool.connect()

        // Verify TimescaleDB extension is enabled
        const result = await client.query(
          "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'"
        )

        if (result.rows.length === 0) {
          throw new Error('TimescaleDB extension is not installed')
        }

        this.logger.logInfo(`
  TimescaleDB:
    Version:   ${result.rows[0].extversion}
    Pool Max:  ${this.config.max ?? 20}
        `)

        client.release()
        break
      } catch (err) {
        this.logger.logError((err as Error).message, err)
        this.retries -= 1
        if (this.retries === 0) {
          throw new Error('Could not establish a connection to TimescaleDB.')
        }
        this.logger.logInfo(`${this.retries} TimescaleDB connection retries left.`)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  /**
   * Execute a query
   */
  public static async query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (!TimescaleDbConnection.pool) {
      throw new Error('TimescaleDB pool not initialized')
    }
    return TimescaleDbConnection.pool.query<T>(text, params)
  }

  /**
   * Get a client from the pool (for transactions)
   */
  public static async getClient(): Promise<PoolClient> {
    if (!TimescaleDbConnection.pool) {
      throw new Error('TimescaleDB pool not initialized')
    }
    return TimescaleDbConnection.pool.connect()
  }

  /**
   * Close the pool
   */
  public static async close(): Promise<void> {
    if (TimescaleDbConnection.pool) {
      await TimescaleDbConnection.pool.end()
      TimescaleDbConnection.pool = null
      TimescaleDbConnection.instance = null
    }
  }
}
```

### 3. TimescaleDB Initialization

**`packages/api/api-app/src/data/timescale/dx-timescale.db.ts`**

```typescript
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { TimescaleDbConnection } from '@dx3/api-libs/timescale'

import { TIMESCALE_URI } from '../../config/config-api.consts'
import { createLogsSchema } from './dx-timescale.schema'

export class DxTimescaleDb {
  public static async getTimescaleConnection(): Promise<typeof TimescaleDbConnection | null> {
    const logger = ApiLoggingClass.instance

    if (!TIMESCALE_URI) {
      logger.logWarn('TIMESCALE_URI not configured - logs will not be recorded to TimescaleDB')
      return null
    }

    try {
      const timescale = TimescaleDbConnection.getInstance({
        max: 10,  // Smaller pool for logging
        timescaleUri: TIMESCALE_URI,
      })

      await timescale.initialize()

      // Ensure schema exists
      await createLogsSchema()

      logger.logInfo('Successfully Connected to TimescaleDB for logging')
      return TimescaleDbConnection
    } catch (err) {
      logger.logError(`TimescaleDB connection failed: ${(err as Error).message}`, err)
      // Don't throw - logging failure shouldn't crash the app
      return null
    }
  }
}
```

**`packages/api/api-app/src/data/timescale/dx-timescale.schema.ts`**

```typescript
import { TimescaleDbConnection } from '@dx3/api-libs/timescale'
import { LOG_EVENT_TYPE_ARRAY } from '@dx3/models-shared'

import { ApiLoggingClass } from '@dx3/api-libs/logger'

export async function createLogsSchema(): Promise<void> {
  const logger = ApiLoggingClass.instance

  // Check if table already exists
  const tableCheck = await TimescaleDbConnection.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'logs'
    );
  `)

  if (tableCheck.rows[0].exists) {
    logger.logInfo('Logs table already exists')
    return
  }

  logger.logInfo('Creating logs schema...')

  // Create the base table
  await TimescaleDbConnection.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id UUID DEFAULT uuid_generate_v4() NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      event_type VARCHAR(64) NOT NULL,
      event_subtype VARCHAR(64),
      user_id UUID,
      fingerprint VARCHAR(64),
      device_id VARCHAR(128),
      ip_address INET,
      user_agent TEXT,
      http_method VARCHAR(10),
      request_path VARCHAR(512),
      request_params JSONB,
      request_body_summary JSONB,
      response_status_code SMALLINT,
      response_time_ms INTEGER,
      geo_country VARCHAR(3),
      geo_region VARCHAR(10),
      geo_city VARCHAR(128),
      geo_timezone VARCHAR(64),
      session_id VARCHAR(128),
      referrer VARCHAR(512),
      origin VARCHAR(256),
      success BOOLEAN DEFAULT true,
      message TEXT,
      error_code VARCHAR(32),
      metadata JSONB
    );
  `)

  // Convert to hypertable
  await TimescaleDbConnection.query(`
    SELECT create_hypertable(
      'logs',
      'created_at',
      chunk_time_interval => INTERVAL '1 day',
      if_not_exists => TRUE
    );
  `)

  // Create indexes
  await TimescaleDbConnection.query(`
    CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_logs_fingerprint ON logs(fingerprint, created_at DESC) WHERE fingerprint IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_logs_ip_address ON logs(ip_address, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_success ON logs(success, created_at DESC) WHERE success = false;
    CREATE INDEX IF NOT EXISTS idx_logs_auth_failures ON logs(event_type, ip_address, created_at DESC)
      WHERE event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE') AND success = false;
  `)

  // Enable compression
  await TimescaleDbConnection.query(`
    ALTER TABLE logs SET (
      timescaledb.compress,
      timescaledb.compress_segmentby = 'event_type',
      timescaledb.compress_orderby = 'created_at DESC'
    );
  `)

  // Add compression policy (7 days)
  await TimescaleDbConnection.query(`
    SELECT add_compression_policy('logs', INTERVAL '7 days', if_not_exists => TRUE);
  `)

  // Add retention policy (90 days)
  await TimescaleDbConnection.query(`
    SELECT add_retention_policy('logs', INTERVAL '90 days', if_not_exists => TRUE);
  `)

  logger.logInfo('Logs schema created successfully')
}
```

### 4. Logging Service (Using Raw SQL for TimescaleDB)

**`packages/api/libs/logging/logging-api.service.ts`**

```typescript
import type { Request } from 'express'

import {
  LOG_EVENT_TYPE,
  type LogEventSubtype,
  type LogEventType,
  type LogRecordType,
  type LogsHourlySummaryType,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { sanitizeForLogging } from '../logger/sanitize-log.util'
import { TimescaleDbConnection } from '../timescale'

export class LoggingService {
  private logger: ApiLoggingClassType
  private isEnabled: boolean

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.isEnabled = TimescaleDbConnection.pool !== null
  }

  /**
   * Extract context from Express Request object
   */
  private extractRequestContext(req: Request): Partial<LogRecordType> {
    return {
      deviceId: (req.headers['x-device-id'] as string) || undefined,
      fingerprint: req.fingerprint,
      geoCity: req.geo?.city?.names?.en,
      geoCountry: req.geo?.country?.iso_code,
      geoRegion: req.geo?.subdivisions?.[0]?.iso_code,
      geoTimezone: req.geo?.location?.time_zone,
      httpMethod: req.method,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      origin: req.headers.origin as string,
      referrer: req.headers.referer as string,
      requestParams: Object.keys(req.params || {}).length ? req.params : undefined,
      requestPath: req.path,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    }
  }

  /**
   * Sanitize request body for storage (remove sensitive fields)
   */
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body || !Object.keys(body).length) return undefined
    return sanitizeForLogging(body)
  }

  /**
   * Record a log entry (fire-and-forget, non-blocking)
   */
  async record(data: LogRecordType): Promise<void> {
    if (!this.isEnabled) return

    // Fire and forget - don't await
    this.insertLog(data).catch((err) => {
      this.logger.logError(`LoggingService.record failed: ${(err as Error).message}`)
    })
  }

  /**
   * Internal insert method
   */
  private async insertLog(data: LogRecordType): Promise<void> {
    const sql = `
      INSERT INTO logs (
        event_type, event_subtype, user_id, fingerprint, device_id,
        ip_address, user_agent, http_method, request_path, request_params,
        request_body_summary, response_status_code, response_time_ms,
        geo_country, geo_region, geo_city, geo_timezone,
        session_id, referrer, origin, success, message, error_code, metadata
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24
      )
    `

    await TimescaleDbConnection.query(sql, [
      data.eventType,
      data.eventSubtype || null,
      data.userId || null,
      data.fingerprint || null,
      data.deviceId || null,
      data.ipAddress || null,
      data.userAgent || null,
      data.httpMethod || null,
      data.requestPath || null,
      data.requestParams ? JSON.stringify(data.requestParams) : null,
      data.requestBodySummary ? JSON.stringify(data.requestBodySummary) : null,
      data.responseStatusCode || null,
      data.responseTimeMs || null,
      data.geoCountry || null,
      data.geoRegion || null,
      data.geoCity || null,
      data.geoTimezone || null,
      data.sessionId || null,
      data.referrer || null,
      data.origin || null,
      data.success ?? true,
      data.message || null,
      data.errorCode || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ])
  }

  /**
   * Record a log from an Express request
   */
  async recordFromRequest(params: {
    errorCode?: string
    eventSubtype?: LogEventSubtype | string
    eventType: LogEventType
    message?: string
    metadata?: Record<string, unknown>
    req: Request
    responseStatusCode?: number
    responseTimeMs?: number
    success?: boolean
  }): Promise<void> {
    if (!this.isEnabled) return

    const { req, ...rest } = params
    const context = this.extractRequestContext(req)
    const bodyData = this.sanitizeBody(req.body)

    await this.record({
      ...context,
      ...rest,
      requestBodySummary: bodyData,
    })
  }

  /**
   * Convenience method for logging auth success
   */
  async recordAuthSuccess(req: Request, subtype: LogEventSubtype | string): Promise<void> {
    await this.recordFromRequest({
      eventSubtype: subtype,
      eventType: LOG_EVENT_TYPE.AUTH_LOGIN,
      req,
      success: true,
    })
  }

  /**
   * Convenience method for logging auth failure
   */
  async recordAuthFailure(
    req: Request,
    subtype: LogEventSubtype | string,
    errorCode?: string,
    message?: string
  ): Promise<void> {
    await this.recordFromRequest({
      errorCode,
      eventSubtype: subtype,
      eventType: LOG_EVENT_TYPE.AUTH_FAILURE,
      message,
      req,
      success: false,
    })
  }

  /**
   * Convenience method for logging rate limit hits
   */
  async recordRateLimitHit(req: Request, message?: string): Promise<void> {
    await this.recordFromRequest({
      eventType: LOG_EVENT_TYPE.RATE_LIMIT,
      message,
      req,
      success: false,
    })
  }

  /**
   * Get failed auth attempts count for security checks
   */
  async getFailedAuthAttempts(
    identifier: { fingerprint?: string; ipAddress?: string; userId?: string },
    minutesAgo: number = 15
  ): Promise<number> {
    if (!this.isEnabled) return 0

    const conditions: string[] = [
      "event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE')",
      'success = false',
      `created_at >= NOW() - INTERVAL '${minutesAgo} minutes'`,
    ]
    const params: unknown[] = []
    let paramIndex = 1

    if (identifier.userId) {
      conditions.push(`user_id = $${paramIndex++}`)
      params.push(identifier.userId)
    }
    if (identifier.ipAddress) {
      conditions.push(`ip_address = $${paramIndex++}`)
      params.push(identifier.ipAddress)
    }
    if (identifier.fingerprint) {
      conditions.push(`fingerprint = $${paramIndex++}`)
      params.push(identifier.fingerprint)
    }

    const result = await TimescaleDbConnection.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM logs WHERE ${conditions.join(' AND ')}`,
      params
    )

    return parseInt(result.rows[0].count, 10)
  }

  /**
   * Get hourly summary from continuous aggregate
   */
  async getHourlySummary(hoursAgo: number = 24): Promise<LogsHourlySummaryType[]> {
    if (!this.isEnabled) return []

    const result = await TimescaleDbConnection.query<LogsHourlySummaryType>(`
      SELECT
        bucket,
        event_type as "eventType",
        total_count as "totalCount",
        success_count as "successCount",
        failure_count as "failureCount",
        unique_users as "uniqueUsers",
        unique_ips as "uniqueIps",
        avg_response_time_ms as "avgResponseTimeMs",
        max_response_time_ms as "maxResponseTimeMs"
      FROM logs_hourly
      WHERE bucket >= NOW() - INTERVAL '${hoursAgo} hours'
      ORDER BY bucket DESC
    `)

    return result.rows
  }

  /**
   * Get summary for dashboard
   */
  async getSummary(hoursAgo: number = 24): Promise<{
    authFailures: number
    rateLimitHits: number
    successfulLogins: number
    totalRequests: number
    uniqueIps: number
    uniqueUsers: number
  }> {
    if (!this.isEnabled) {
      return {
        authFailures: 0,
        rateLimitHits: 0,
        successfulLogins: 0,
        totalRequests: 0,
        uniqueIps: 0,
        uniqueUsers: 0,
      }
    }

    const result = await TimescaleDbConnection.query<{
      auth_failures: string
      rate_limit_hits: string
      successful_logins: string
      total_requests: string
      unique_ips: string
      unique_users: string
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'REQUEST') as total_requests,
        COUNT(*) FILTER (WHERE event_type = 'AUTH_LOGIN' AND success = true) as successful_logins,
        COUNT(*) FILTER (WHERE event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE') AND success = false) as auth_failures,
        COUNT(*) FILTER (WHERE event_type = 'RATE_LIMIT') as rate_limit_hits,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM logs
      WHERE created_at >= NOW() - INTERVAL '${hoursAgo} hours'
    `)

    const row = result.rows[0]
    return {
      authFailures: parseInt(row.auth_failures, 10),
      rateLimitHits: parseInt(row.rate_limit_hits, 10),
      successfulLogins: parseInt(row.successful_logins, 10),
      totalRequests: parseInt(row.total_requests, 10),
      uniqueIps: parseInt(row.unique_ips, 10),
      uniqueUsers: parseInt(row.unique_users, 10),
    }
  }
}

export type LoggingServiceType = typeof LoggingService.prototype
```

---

## Integration Points

### 1. Initialize TimescaleDB on App Startup

**`packages/api/api-app/src/main.ts`** (Updated)

```typescript
import { DxPostgresDb } from './data/pg/dx-postgres.db'
import { DxTimescaleDb } from './data/timescale/dx-timescale.db'

async function bootstrap() {
  // ... existing code ...

  // Initialize main Postgres
  await DxPostgresDb.getPostgresConnection()

  // Initialize TimescaleDB for logging (non-blocking, optional)
  DxTimescaleDb.getTimescaleConnection().catch((err) => {
    logger.logWarn(`TimescaleDB not available: ${err.message}`)
  })

  // ... rest of bootstrap ...
}
```

### 2. Modified `logRequest` Utility

**`packages/api/libs/logger/log-request.util.ts`** (Updated)

```typescript
import type { Request } from 'express'

import { LOG_EVENT_TYPE } from '@dx3/models-shared'

import { LoggingService } from '../logging/logging-api.service'
import { ApiLoggingClass } from './logger-api.class'
import { safeStringify } from './sanitize-log.util'

// ... existing helper functions (_getUserId, _getFingerprint, etc.) ...

export function logRequest(data: { message?: string; req: Request; type: string }) {
  const { message, req, type } = data

  // Existing console logging logic
  const fingerprint = _getFingerprint(req)
  const geoSummary = _getGeoSummary(req)
  const userId = _getUserId(req)
  const requestData = _getRequestData(req)

  const segments = [
    `method: ${req.method}`,
    `ip: ${req.headers['X-Forwarded-For'] || req.ip}`,
    userId,
    requestData,
  ]

  if (fingerprint) segments.push(fingerprint)
  if (geoSummary) segments.push(geoSummary)
  if (message) segments.push(`msg: ${message}`)

  const isFailed = type.toLowerCase().startsWith('fail')

  if (isFailed) {
    ApiLoggingClass?.instance?.logError(`${type}: ${segments.join(' | ')}`)
  } else {
    ApiLoggingClass?.instance?.logInfo(`${type}: ${segments.join(' | ')}`)
  }

  // NEW: Record to TimescaleDB logs (fire-and-forget)
  const loggingService = new LoggingService()
  loggingService.recordFromRequest({
    eventSubtype: type,
    eventType: LOG_EVENT_TYPE.REQUEST,
    message,
    req,
    success: !isFailed,
  })
}
```

### 3. Auth Controller Integration

**`packages/api/api-app/src/auth/auth-api.controller.ts`** (Updated)

```typescript
import { LoggingService } from '@dx3/api-libs/logging/logging-api.service'
import { LOG_EVENT_SUBTYPE, LOG_EVENT_TYPE } from '@dx3/models-shared'

export const AuthController = {
  login: async (req: Request, res: Response) => {
    logRequest({ req, type: 'login' })
    const loggingService = new LoggingService()

    try {
      const service = new AuthLoginService()
      const profile = (await service.login(req.body as LoginPayloadType)) as UserProfileStateType

      // Record successful login to TimescaleDB
      loggingService.recordAuthSuccess(req, LOG_EVENT_SUBTYPE.SUCCESS)

      const tokens = TokenService.generateTokens(profile.id)
      // ... rest of success logic ...

    } catch (err) {
      // Record failed login to TimescaleDB
      loggingService.recordAuthFailure(
        req,
        LOG_EVENT_SUBTYPE.FAILURE,
        undefined,
        (err as Error)?.message,
      )

      logRequest({ message: (err as Error)?.message, req, type: 'Failed login' })
      sendBadRequest(req, res, err.message)
    }
  },
  // ... similar pattern for createAccount, logout, etc.
}
```

---

## Usage Examples

### Recording Custom Events

```typescript
import { LoggingService } from '@dx3/api-libs/logging/logging-api.service'
import { LOG_EVENT_TYPE } from '@dx3/models-shared'

const loggingService = new LoggingService()

// Record a security alert
loggingService.recordFromRequest({
  eventSubtype: 'suspicious_ip',
  eventType: LOG_EVENT_TYPE.SECURITY_ALERT,
  message: 'Multiple failed attempts from new location',
  metadata: {
    attemptCount: 5,
    newCountry: 'RU',
    previousCountry: 'US',
  },
  req,
  success: false,
})
```

### Querying Logs

```typescript
const loggingService = new LoggingService()

// Get failed auth attempts for rate limiting
const failedAttempts = await loggingService.getFailedAuthAttempts(
  { ipAddress: '192.168.1.1' },
  30  // last 30 minutes
)

// Get dashboard summary
const summary = await loggingService.getSummary(24)  // last 24 hours
// Returns: { totalRequests, successfulLogins, authFailures, rateLimitHits, uniqueUsers, uniqueIps }

// Get hourly breakdown from continuous aggregate
const hourlyData = await loggingService.getHourlySummary(48)  // last 48 hours
```

### Direct SQL Queries (Advanced)

```typescript
import { TimescaleDbConnection } from '@dx3/api-libs/timescale'

// Query the daily continuous aggregate
const dailyStats = await TimescaleDbConnection.query(`
  SELECT
    bucket,
    event_type,
    geo_country,
    total_count,
    unique_users
  FROM logs_daily
  WHERE bucket >= NOW() - INTERVAL '30 days'
    AND event_type = 'AUTH_LOGIN'
  ORDER BY bucket DESC, total_count DESC
`)

// Time-based analysis using TimescaleDB functions
const peakHours = await TimescaleDbConnection.query(`
  SELECT
    time_bucket('1 hour', created_at) AS hour,
    COUNT(*) as request_count
  FROM logs
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY hour
  ORDER BY request_count DESC
  LIMIT 10
`)
```

---

## Testing Considerations

### Unit Tests

```typescript
// packages/api/libs/logging/logging-api.service.spec.ts

import { LoggingService } from './logging-api.service'
import { TimescaleDbConnection } from '../timescale'

jest.mock('../timescale', () => ({
  TimescaleDbConnection: {
    pool: { query: jest.fn() },
    query: jest.fn(),
  },
}))

describe('LoggingService', () => {
  let service: LoggingService

  beforeEach(() => {
    service = new LoggingService()
    jest.clearAllMocks()
  })

  describe('recordFromRequest', () => {
    it('should extract context and insert log', async () => {
      const mockReq = {
        body: { email: 'test@example.com' },
        fingerprint: 'fp123',
        geo: { city: { names: { en: 'NYC' } }, country: { iso_code: 'US' } },
        headers: { 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '192.168.1.1' },
        ip: '127.0.0.1',
        method: 'POST',
        params: {},
        path: '/api/auth/login',
        user: { id: 'user123' },
      } as unknown as Request

      await service.recordFromRequest({
        eventType: LOG_EVENT_TYPE.AUTH_LOGIN,
        req: mockReq,
        success: true,
      })

      expect(TimescaleDbConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO logs'),
        expect.arrayContaining(['AUTH_LOGIN', 'user123', 'fp123', '192.168.1.1'])
      )
    })
  })
})
```

### Integration Tests

```typescript
// packages/api/api-app-e2e/src/logging/logging.e2e.spec.ts

describe('Logging Integration', () => {
  it('should record login logs to TimescaleDB', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrong', value: 'test@example.com' })
      .expect(400)

    // Query TimescaleDB directly
    const result = await TimescaleDbConnection.query(`
      SELECT * FROM logs
      WHERE event_type = 'AUTH_FAILURE'
      ORDER BY created_at DESC
      LIMIT 1
    `)

    expect(result.rows.length).toBe(1)
    expect(result.rows[0].request_path).toBe('/api/auth/login')
    expect(result.rows[0].success).toBe(false)
  })
})
```

---

## Future Enhancements

### 1. Geographic Heatmaps

```sql
-- Query for geo visualization
SELECT
  geo_country,
  geo_region,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE success = false) as failures
FROM logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY geo_country, geo_region
ORDER BY count DESC;
```

### 2. Anomaly Detection

```sql
-- Detect unusual spikes in auth failures
WITH hourly_failures AS (
  SELECT
    time_bucket('1 hour', created_at) AS hour,
    COUNT(*) as failure_count
  FROM logs
  WHERE event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE')
    AND success = false
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY hour
),
stats AS (
  SELECT
    AVG(failure_count) as avg_failures,
    STDDEV(failure_count) as stddev_failures
  FROM hourly_failures
)
SELECT h.hour, h.failure_count
FROM hourly_failures h, stats s
WHERE h.failure_count > s.avg_failures + (3 * s.stddev_failures)
ORDER BY h.hour DESC;
```

### 3. Real-time Alerting via PostgreSQL NOTIFY

```sql
-- Create a trigger for high failure rates
CREATE OR REPLACE FUNCTION notify_high_failure_rate()
RETURNS TRIGGER AS $$
DECLARE
  failure_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO failure_count
  FROM logs
  WHERE ip_address = NEW.ip_address
    AND success = false
    AND created_at >= NOW() - INTERVAL '5 minutes';

  IF failure_count >= 10 THEN
    PERFORM pg_notify('security_alert', json_build_object(
      'type', 'high_failure_rate',
      'ip', NEW.ip_address,
      'count', failure_count
    )::text);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Admin Dashboard API

```typescript
// GET /api/admin/logs/summary
// GET /api/admin/logs/hourly
// GET /api/admin/logs/daily
// GET /api/admin/logs/by-country
// GET /api/admin/logs/failed-auth
// GET /api/admin/logs/user/:userId
```

---

## Implementation Checklist

### Phase 0: Infrastructure Migration (Option B - Existing Database)

> Skip this phase if starting fresh or using Option A (separate container)

- [ ] Verify current PostgreSQL version: `docker exec dx-postgres psql -V`
- [ ] Create full database backup: `docker exec dx-postgres pg_dumpall -U dx > backup.sql`
- [ ] Verify backup file has content
- [ ] `docker compose down`
- [ ] Update docker-compose.yml: change `postgres:16` to `timescale/timescaledb:latest-pg16`
- [ ] `docker compose up -d`
- [ ] Verify TimescaleDB extension is available
- [ ] Create dx-logs database: `CREATE DATABASE "dx-logs";`
- [ ] Enable TimescaleDB extension in dx-logs
- [ ] Enable uuid-ossp extension in dx-logs
- [ ] Verify dx-app data is intact
- [ ] Store backup safely (keep for 1+ week)

### Phase 1: Infrastructure Setup
- [ ] Add TIMESCALE_URI to environment configs (.env files)
- [ ] Create timescale-init.sh script (for fresh installs)
- [ ] Create TimescaleDbConnection class (`packages/api/libs/timescale/`)
- [ ] Create DxTimescaleDb initialization class
- [ ] Create schema creation utility (dx-timescale.schema.ts)

### Phase 2: Core Implementation
- [ ] Create shared types and constants (`packages/shared/models/src/logging/`)
- [ ] Export from shared models index
- [ ] Create LoggingService (`packages/api/libs/logging/`)
- [ ] Write unit tests for LoggingService

### Phase 3: Integration
- [ ] Add TimescaleDB initialization to main.ts
- [ ] Update `logRequest` utility to record logs
- [ ] Update AuthController to record auth events
- [ ] Update rate limiter to record rate limit hits

### Phase 4: Continuous Aggregates (Optional)
- [ ] Create logs_hourly continuous aggregate
- [ ] Create logs_daily continuous aggregate
- [ ] Add refresh policies

### Phase 5: Admin Features (Optional)
- [ ] Create admin routes for log queries
- [ ] Add logs summary endpoint
- [ ] Add failed auth lookup endpoint

### Phase 6: Testing & Validation
- [ ] Unit tests for all new modules
- [ ] Integration tests for log recording
- [ ] Verify compression is working
- [ ] Verify retention policy is configured

---

*Document Version: 3.1*
*Created: January 27, 2026*
*Updated: January 27, 2026 - Added Option B migration guide*
