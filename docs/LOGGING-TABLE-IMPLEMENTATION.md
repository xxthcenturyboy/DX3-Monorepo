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

1. [Implementation Decisions](#implementation-decisions)
2. [Architecture Overview](#architecture-overview)
3. [Database Setup](#database-setup)
   - [Architecture Options](#architecture-options)
   - [Migration Guide for Option B](#migration-guide-for-option-b-existing-database)
4. [Database Schema Design](#database-schema-design)
5. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
6. [Admin UI Specifications](#admin-ui-specifications)
7. [Real-Time Notifications (Socket.IO)](#real-time-notifications-socketio)
8. [Data Sanitization Rules](#data-sanitization-rules)
9. [File Structure](#file-structure)
10. [Implementation Details](#implementation-details)
11. [Integration Points](#integration-points)
12. [Usage Examples](#usage-examples)
13. [Testing Considerations](#testing-considerations)
14. [Future Enhancements](#future-enhancements)
15. [Implementation Checklist](#implementation-checklist)

---

## Implementation Decisions

This section documents key decisions made during requirements interview and technical planning.

### Infrastructure Decisions

**Database Architecture:**
- ✅ **Option B Selected**: Same container, separate database (TimescaleDB)
- ✅ Replace `postgres:16` → `timescale/timescaledb:latest-pg16` in existing container
- ✅ Create separate `dx-logs` database for logging data
- ✅ **Future Migration Path**: Can migrate to separate container (Option A) later with simple dump/restore
- ✅ **Migration Cost**: Low effort (5-15 min downtime), minimal risk, standard database migration

**Data Policies:**
- ✅ **Retention**: 90 days with automatic cleanup
- ✅ **Compression**: 7-day policy (compress chunks older than 7 days)
- ✅ **Chunk Interval**: 1-day partitioning
- ✅ **Continuous Aggregates**: Create immediately (logs_hourly, logs_daily)

### Logging Behavior Decisions

**Failure Handling:**
- ✅ **Silent Degradation**: Continue serving requests if TimescaleDB unavailable
- ✅ Log errors to console only (no fallback buffering or file logging)
- ✅ Application availability takes priority over log collection

**Performance:**
- ✅ **Direct Writes**: Fire-and-forget async writes to TimescaleDB
- ✅ No Redis buffering or background workers (keep it simple)
- ✅ Acceptable to drop logs under extreme load (rare scenario)

**Alert Threshold Tracking:**
- ✅ **In-Memory Map**: Track failure counts per IP/fingerprint in memory
- ✅ **Single-Instance Limitation**: Thresholds reset on server restart; counts not shared across API instances
- ✅ **Acceptable Trade-off**: Simplicity over perfect accuracy; critical alerts may fire slightly later in multi-instance deployments
- ✅ **Future Option**: Can migrate to Redis if multi-instance accuracy becomes critical

**Rate Limiting Integration:**
- ✅ **Audit Only**: Logs are for analytics/auditing, NOT for rate limit decisions
- ✅ Keep existing Redis-based rate limiting unchanged
- ✅ No critical path dependency on TimescaleDB for authentication flow
- ✅ **Log Rate Limit Hits**: Record every rate limit trigger to TimescaleDB for security monitoring
- ✅ **Fire-and-Forget**: Rate limit logging is async and non-blocking (doesn't slow down the 429 response)

### Data Sanitization Decisions

**Context-Dependent Sanitization:**

**Failed Auth Logs (Moderate Sanitization):**
- ✅ Keep: Full email/username, IP address, fingerprint, device_id
- ✅ Store: Attempted credentials (what they tried to log in with)
- ✅ Store: Error messages for debugging
- ✅ Store: Request body summary with attempted login method
- ✅ Rationale: Security investigations need context to identify attack patterns

**Successful Auth Logs (Aggressive Sanitization):**
- ✅ Keep: user_id reference only
- ✅ Remove: Email, phone, passwords, tokens
- ✅ Minimal: No request body data
- ✅ Rationale: Success confirmed, no debugging needed, privacy-first

**All Logs (Universal Rules):**
- ✅ Always remove: passwords, tokens, API keys, payment info
- ✅ Sanitize: Credit card numbers, SSN, sensitive PII
- ✅ Use existing `sanitizeForLogging()` utility

### Admin UI Decisions

**Access Location:**
- ✅ **Separate admin portal route** in existing web-app
- ✅ New routes: `/admin/logs/dashboard`, `/admin/logs/list`, `/admin/logs/failed-auth`
- ✅ Reuse existing auth, RBAC, UI components (MUI v7)
- ✅ Integrate with current admin menu system

**MVP Features (First Release):**
- ✅ **Summary Dashboard**: Key metrics (total requests, auth failures, rate limits, unique users/IPs)
- ✅ **Failed Auth Lookup Tool**: Search by IP/fingerprint/user_id with time window selector
- ✅ **Filterable Log Table**: Pagination, filters (event type, date range, success/failure), sorting
- ✅ **Export Capability**: CSV/JSON export for compliance reporting

**Real-Time Features:**
- ✅ **Socket.IO Integration**: Yes - notify admins of security events
- ✅ **Threshold-Based Escalation**: Prevent alert noise (see Real-Time Notifications section)
- ✅ Admin namespace: `/admin-logs` socket room

**Downtime Handling:**
- ✅ **Graceful UI Degradation**: Show banner "Logging database unavailable"
- ✅ Display last successful query timestamp
- ✅ Disable log queries but keep rest of admin UI functional
- ✅ No data caching fallback (keep it simple)

### Role-Based Access Control

**New Role: LOGGING_ADMIN**
- ✅ Grants access to logging dashboard and log data
- ✅ **Assignment Control**: Only SUPER_ADMIN can assign/remove this role
- ✅ **Menu Visibility**: Logs menu item only appears if user has LOGGING_ADMIN or SUPER_ADMIN role
- ✅ **API Protection**: All `/api/logs/*` endpoints require LOGGING_ADMIN role
- ✅ **Route Protection**: Frontend `/admin/logs/*` routes check for LOGGING_ADMIN role
- ✅ **Specialized Role**: Does NOT grant user management or other admin powers

**Implementation Approach:**
- ✅ Add to existing three-tier role hierarchy (USER, ADMIN, SUPER_ADMIN)
- ✅ Leverage existing RBAC infrastructure
- ✅ Reuse existing role management UI in user admin section
- ✅ Create new `hasLoggingAdminRole` middleware for API routes

**Type Assumption - UserProfile.role:**
- ✅ **Assumption**: `userProfile.role` is an array of strings (`string[]`)
- ✅ **Verify Before Implementation**: Check `UserProfileStateType` in `packages/shared/models/`
- ✅ **If Currently Single String**: Will need to migrate type and update dependent code
- ✅ **Menu Service**: Must be updated to accept `string[]` for role filtering

### Implementation Phasing

**Selected Approach:**
- ✅ **Full Implementation**: All phases (0-6) at once
- ✅ Infrastructure + Core Service + Integration + Aggregates + Admin UI + RBAC
- ✅ Comprehensive feature set ready for production use
- ✅ Defer future enhancements (geographic heatmaps, anomaly detection) until needed

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

## Role-Based Access Control (RBAC)

### Overview

Access to logging features is controlled by a new specialized role: **LOGGING_ADMIN**. This role grants access to view system logs, analytics, and security monitoring data without providing general administrative privileges.

### Role Hierarchy

```
SUPER_ADMIN (order: 4)
    ↓ (full system access, can assign all roles)
    ├── ADMIN (order: 2)
    │   └── User management, support requests
    └── LOGGING_ADMIN (order: 3)
        └── System logs, analytics, security monitoring

USER (order: 1)
    └── Standard application features
```

**Key Points:**
- `SUPER_ADMIN` has access to everything (no restrictions)
- `ADMIN` and `LOGGING_ADMIN` are **independent specialized roles**
- A user can have both `ADMIN` and `LOGGING_ADMIN` simultaneously
- Only `SUPER_ADMIN` can assign/remove specialized roles

### RBAC Implementation Checklist

#### 1. Add LOGGING_ADMIN Role Constant

**File:** `packages/shared/models/src/user-privilege/user-privilege-shared.consts.ts`

```typescript
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  LOGGING_ADMIN: 'LOGGING_ADMIN',  // NEW
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
} as const

export const USER_ROLE_ARRAY = Object.values(USER_ROLE)
```

#### 2. Add Privilege Set Seed Data

**File:** `packages/api/libs/pg/seed/data/user-privilege-sets.data.ts`

```typescript
export const USER_PRIVILEGE_SETS_SEED: UserPrivilegeSetSeedData[] = [
  {
    description: 'Standard user with basic access permissions',
    name: 'USER',
    order: 1,
  },
  {
    description: 'Administrator with elevated permissions for user management',
    name: 'ADMIN',
    order: 2,
  },
  {
    description: 'Logging administrator with access to system logs and analytics',  // NEW
    name: 'LOGGING_ADMIN',  // NEW
    order: 3,  // NEW
  },  // NEW
  {
    description: 'Super administrator with full system access',
    name: 'SUPER_ADMIN',
    order: 4,  // Changed from 3
  },
]
```

**Action:** Run `make db-seed` after updating seed data.

#### 3. Create Logging Admin Middleware

**File:** `packages/api/libs/auth/middleware/ensure-role.middleware.ts`

```typescript
/**
 * Middleware to ensure user has LOGGING_ADMIN or SUPER_ADMIN role
 * Used to protect logging-related API endpoints
 */
export async function hasLoggingAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = _getUserId(req)

  if (!userId) {
    throw new Error('User is not authorized for this activity.')
  }

  // SUPER_ADMIN always has access
  const hasSuperAdmin = await userHasRole(userId, USER_ROLE.SUPER_ADMIN)
  if (hasSuperAdmin) {
    next()
    return
  }

  // Check for LOGGING_ADMIN role
  const hasRole = await userHasRole(userId, USER_ROLE.LOGGING_ADMIN)
  if (!hasRole) {
    throw new Error('User does not have logging admin permissions.')
  }

  next()
}
```

#### 4. Create Protected Logging Routes

**File:** `packages/api/api-app/src/logging/logging-api.routes.ts` (NEW)

```typescript
import { Router } from 'express'

import { hasLoggingAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { LoggingController } from './logging-api.controller'

const router = Router()

// All logging endpoints require LOGGING_ADMIN role (or SUPER_ADMIN)
router.get('/failed-auth', hasLoggingAdminRole, LoggingController.getFailedAuth)
router.get('/health', hasLoggingAdminRole, LoggingController.getHealth)
router.get('/hourly', hasLoggingAdminRole, LoggingController.getHourlySummary)
router.get('/list', hasLoggingAdminRole, LoggingController.getLogsList)
router.get('/summary', hasLoggingAdminRole, LoggingController.getSummary)
router.post('/export', hasLoggingAdminRole, LoggingController.exportLogs)

export { router as loggingRoutes }
```

**Add to main routes in:** `packages/api/api-app/src/routes/api.routes.ts`

```typescript
import { loggingRoutes } from '../logging/logging-api.routes'

// Add to router setup
router.use('/logs', loggingRoutes)  // All /api/logs/* routes
```

#### 5. Update Admin Menu

**File:** `packages/web/web-app/src/app/ui/menus/admin.menu.ts`

```typescript
import { USER_ROLE } from '@dx3/models-shared'
import { LOGGING_ROUTES } from '../../logging/logging-web.routes'

export const adminMenu = (): AppMenuType => {
  return {
    items: [
      // ... existing menu items ...
      {
        icon: IconNames.ASSESSMENT,  // Or IconNames.TIMELINE
        id: 'menu-item-admin-logging',
        restriction: USER_ROLE.LOGGING_ADMIN,  // Only for LOGGING_ADMIN role
        routeKey: LOGGING_ROUTES.DASHBOARD,
        title: strings.SYSTEM_LOGS,
        type: 'ROUTE',
      },
      // ... other menu items ...
    ],
    title: strings.ADMIN,
  }
}
```

#### 6. Update Menu Service for Multiple Roles

**File:** `packages/web/web-app/src/app/ui/menus/menu-config.service.ts`

Update the filtering logic to support users with multiple roles:

```typescript
/**
 * Filter menu items based on user's roles array
 * Supports users with multiple roles (e.g., ADMIN + LOGGING_ADMIN)
 */
private filterMenuByRoles(menu: AppMenuType, userRoles: string[], includeBeta: boolean): AppMenuType | null {
  const items: AppMenuItemType[] = []

  for (const item of menu.items) {
    // No restriction = show to everyone
    if (!item.restriction) {
      items.push(item)
      continue
    }

    // Beta flag check
    if (item.beta && !includeBeta) {
      continue
    }

    // Check if user has the required role
    if (userRoles.includes(item.restriction)) {
      items.push(item)
      continue
    }

    // SUPER_ADMIN sees everything
    if (userRoles.includes(USER_ROLE.SUPER_ADMIN)) {
      items.push(item)
      continue
    }
  }

  return items.length ? { ...menu, items } : null
}

public getMenus(userRoles: string[], includeBeta?: boolean): AppMenuType[] {
  const menus: (AppMenuType | null)[] = []

  for (const menu of this.CARDINAL_MENU_SET) {
    const filteredMenu = this.filterMenuByRoles(menu, userRoles, includeBeta ?? false)
    if (filteredMenu) {
      menus.push(filteredMenu)
    }
  }

  return menus.filter((m) => m !== null) as AppMenuType[]
}
```

**Update caller in:** `packages/web/web-app/src/app/config/bootstrap/login-bootstrap.ts`

```typescript
function setUpMenus(userProfile: UserProfileStateType, mobileBreak: boolean) {
  const menuService = new MenuConfigService()

  // Pass the full roles array instead of single role string
  const menus = menuService.getMenus(userProfile.role, userProfile.b)

  store.dispatch(uiActions.menusSet({ menus }))
}
```

#### 7. Create Logging Router

**File:** `packages/web/web-app/src/app/logging/logging-web.router.tsx` (NEW)

> **Note:** Uses `useSelector` hook instead of `store.getState()` to ensure proper React re-renders when role state changes.

```typescript
import { lazy, Suspense, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router'

import { USER_ROLE } from '@dx3/models-shared'

import type { RootState } from '../store/store.types'
import { ErrorBoundary } from '../ui/error-boundary/error-boundary.component'
import { UiLoadingComponent } from '../ui/loading/loading.component'
import { UnauthorizedComponent } from '../ui/unauthorized/unauthorized.component'
import { GlobalErrorComponent } from '@dx3/web-libs/ui'

const LoggingDashboard = lazy(() => import('./dashboard/logging-dashboard.component'))
const LoggingFailedAuth = lazy(() => import('./failed-auth/logging-failed-auth.component'))
const LoggingList = lazy(() => import('./list/logging-list.component'))

export const LoggingRouter = () => {
  const userRoles = useSelector((state: RootState) => state.userProfile.role)

  const hasLoggingAdminRole = useMemo(() => {
    // SUPER_ADMIN or LOGGING_ADMIN can access
    return userRoles.includes(USER_ROLE.SUPER_ADMIN) || userRoles.includes(USER_ROLE.LOGGING_ADMIN)
  }, [userRoles])

  if (!hasLoggingAdminRole) {
    return <UnauthorizedComponent message="You do not have permission to access system logs." />
  }

  return (
    <ErrorBoundary fallback={<GlobalErrorComponent buttonText="Go Back" />}>
      <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
        <Routes>
          <Route path="dashboard" element={<LoggingDashboard />} />
          <Route path="failed-auth" element={<LoggingFailedAuth />} />
          <Route path="list" element={<LoggingList />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
```

**Add to routes config:** `packages/web/web-app/src/app/routers/routers.config.tsx`

```typescript
import { LoggingRouter } from '../logging/logging-web.router'

const routes = [
  // ... existing routes
  {
    children: [
      // ... existing admin routes
      {
        element: <LoggingRouter />,
        path: 'logs/*',  // /admin/logs/*
      },
    ],
    element: <AdminRouter />,
    path: '/admin/*',
  },
]
```

#### 8. Add i18n Strings

**File:** `packages/web/web-app/assets/locales/en.json`

> **Note:** Merge these keys into the existing `en.json` file. Keys are shown alphabetically as required by codebase conventions.

```json
{
  "... existing keys ...": "...",
  "EXPORT_LOGS": "Export Logs",
  "FAILED_AUTH_ATTEMPTS": "Failed Auth Attempts",
  "FAILED_AUTH_LOOKUP": "Failed Auth Lookup",
  "LOG_DETAILS": "Log Details",
  "LOG_SUMMARY": "Log Summary",
  "LOGGING_ADMIN": "Logging Administrator",
  "LOGGING_ADMIN_DESCRIPTION": "Access to system logs, analytics, and security monitoring",
  "LOGGING_CONNECTED": "Logging database connected",
  "LOGGING_DASHBOARD": "Logging Dashboard",
  "LOGGING_DATABASE_UNAVAILABLE": "Logging database unavailable",
  "LOGGING_LAST_QUERY": "Last successful query",
  "SYSTEM_LOGS": "System Logs",
  "VIEW_LOGS": "View Logs",
  "... existing keys ...": "..."
}
```

#### 9. Create Route Constants

**File:** `packages/web/web-app/src/app/logging/logging-web.routes.ts` (NEW)

```typescript
export const LOGGING_ROUTES = {
  DASHBOARD: '/admin/logs/dashboard',
  FAILED_AUTH: '/admin/logs/failed-auth',
  LIST: '/admin/logs/list',
} as const

export const LOGGING_API_ENDPOINTS = {
  EXPORT: '/api/logs/export',
  FAILED_AUTH: '/api/logs/failed-auth',
  HEALTH: '/api/logs/health',
  HOURLY: '/api/logs/hourly',
  LIST: '/api/logs/list',
  SUMMARY: '/api/logs/summary',
} as const
```

### Role Assignment UI

The existing user admin UI automatically picks up the new `LOGGING_ADMIN` role:

**File:** `packages/web/web-app/src/app/user/admin/user-admin-web-edit.component.tsx`

The current implementation already:
- ✅ Reads privilege sets dynamically from database
- ✅ Only allows SUPER_ADMIN to toggle roles (`currentUser?.sa` check)
- ✅ Shows role checkboxes for all non-USER roles
- ✅ Calls `updateRolesRestrictions` API endpoint (protected by `hasSuperAdminRole` middleware)

**Optional Enhancement:** Add visual indicator for specialized roles:

```typescript
{roles.map((role) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={role.hasRole}
        disabled={!currentUser?.sa}
        onClick={() => void handleRoleClick(role.role)}
      />
    }
    label={
      role.role === USER_ROLE.LOGGING_ADMIN ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {role.role}
          <Chip label="Specialized" size="small" color="info" />
        </Box>
      ) : (
        role.role
      )
    }
  />
))}
```

### Security Validation Points

1. **Database Level**: `UserModel.roles` setter validates against `USER_ROLE_ARRAY`
2. **API Level**: `updateRolesAndRestrictions` protected by `hasSuperAdminRole` middleware
3. **Middleware Level**: `hasLoggingAdminRole` checks role before allowing access
4. **Frontend Level**: Role update UI checks `currentUser?.sa` before allowing changes
5. **Route Level**: All `/api/logs/*` endpoints use `hasLoggingAdminRole` middleware
6. **Menu Level**: Menu items filtered by `MenuConfigService` based on user roles
7. **Router Level**: `LoggingAdminRouter` checks roles before rendering routes

---

## Admin UI Specifications

### Overview

The logging admin UI is integrated into the existing web application at `/admin/logs/*`. Access is controlled by the `LOGGING_ADMIN` role (or `SUPER_ADMIN`).

### Components

#### 1. Summary Dashboard (`/admin/logs/dashboard`)

High-level overview of system activity and security events.

**Key Metrics (Last 24 Hours):**
- Total Requests
- Successful Logins
- Auth Failures
- Rate Limit Hits
- Unique Users
- Unique IP Addresses

**Data Source:** `LoggingService.getSummary(hoursAgo)`

**Features:**
- Time range selector (1h, 6h, 24h, 7d, 30d, Custom)
- Metric cards with trend indicators
- Auto-refresh toggle (30s, 1m, 5m, Off)
- Real-time alert banner (Socket.IO)

#### 2. Failed Auth Lookup (`/admin/logs/failed-auth`)

Security investigation tool for tracking authentication failures.

**Search By:**
- IP Address
- Fingerprint
- User ID
- Time window (15m, 1h, 6h, 24h, Custom)

**Data Source:** `LoggingService.getFailedAuthAttempts(identifier, minutesAgo)`

**Results:** Timestamp, Event Type, Identifier, Attempted Value, Message, Geo Location, User Agent

#### 3. Filterable Log Table (`/admin/logs/list`)

Comprehensive log browser with advanced filtering.

**Filters:** Event Type, Date Range, Success/Failure, User ID, IP Address, Fingerprint

**Columns:** Timestamp, Event Type, User ID, IP Address, Request Path, Success, Message, Actions

**Pagination:** 25/50/100/200 rows per page (server-side)

**Sorting:** Created At (DESC), Event Type, IP Address

#### 4. Export Functionality

**Formats:** CSV, JSON

**Limits:** 10,000 rows per export

**API:** `POST /api/logs/export`

### Downtime Handling (Graceful Degradation)

When TimescaleDB unavailable:
- Show banner: "⚠️ Logging database unavailable. Last query: [timestamp]"
- Disable query/export actions
- Keep navigation functional
- Show cached data if available

### Error Boundary

Wrap logging components with the existing `ErrorBoundary` component.

> **Note:** The app already has `ErrorBoundary` at `packages/web/web-app/src/app/ui/error-boundary/error-boundary.component.tsx` and `GlobalErrorComponent` at `packages/web/libs/ui/global/global-error.component.tsx`. No new components needed. The `ErrorBoundary` is already included in the `LoggingRouter` example above.

---

## Real-Time Notifications (Socket.IO)

### Architecture

```
Socket.IO Server
└── Namespace: /admin-logs          (Dedicated namespace for logging features)
    └── Room: logging-alerts        (Room for alert subscriptions within namespace)
        ├── Event: auth_failure_warning
        ├── Event: auth_failure_critical
        ├── Event: rate_limit_alert
        └── Event: security_alert
```

**Namespace vs Room:**
- **Namespace (`/admin-logs`)**: Separate communication channel; only authenticated LOGGING_ADMIN users can connect
- **Room (`logging-alerts`)**: Subscription group within the namespace; clients auto-join on connection

### Threshold-Based Alert Escalation

**Purpose:** Prevent alert noise during attacks while ensuring critical events are noticed.

| Level | Threshold | Event | Display |
|-------|-----------|-------|---------|
| Silent | 1-2 failures | None | No notification |
| Warning | 3-9 in 5min | `auth_failure_warning` | 🟡 Yellow banner |
| Critical | 10+ in 5min | `auth_failure_critical` | 🔴 Red banner + sound |

### Threshold Tracking Implementation

**Approach:** In-memory Map with sliding window

```typescript
type FailureTracker = Map<string, { count: number; firstSeen: number }>

// Key format: `${ipAddress}:${fingerprint}`
// Window: 5 minutes (300000ms)
// Reset on server restart (acceptable for simplicity)
```

**Limitation:** In multi-instance deployments, each instance tracks independently. This means:
- Threshold triggers may be delayed (e.g., 10 failures split across 2 instances = 5 each)
- Acceptable trade-off for simplicity; can migrate to Redis if accuracy becomes critical

### Events

| Event | Payload | When |
|-------|---------|------|
| `auth_failure_warning` | `{ count, fingerprint, ipAddress, timestamp }` | 3-9 failures in 5min window |
| `auth_failure_critical` | `{ count, fingerprint, ipAddress, timestamp }` | 10+ failures in 5min window |
| `rate_limit_alert` | `{ endpoint, ipAddress, timestamp }` | Rate limit triggered |
| `security_alert` | `{ alertType, details, timestamp }` | Custom security events |

---

## Data Sanitization Rules

### Failed Auth (Moderate Sanitization)

**Keep:** Full email/username, IP, fingerprint, device_id, login method, error codes

**Store:** Attempted credentials (sanitized), error messages

**Rationale:** Security investigations need context

### Successful Auth (Aggressive Sanitization)

**Keep:** user_id only, IP, fingerprint, device_id

**Remove:** Email, phone, username, request body

**Rationale:** Privacy-first, no debugging needed

### Universal Rules (All Logs)

**Always Remove:** passwords, tokens, API keys, payment info, SSN

**Function:** `sanitizeForLogging()` utility

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
│           └── logging/                          # NEW: Admin routes for viewing logs
│               ├── logging-api.controller.ts
│               ├── logging-api.controller.spec.ts
│               ├── logging-api.routes.ts
│               └── logging-api.routes.spec.ts
│
├── web/
│   └── web-app/
│       └── src/
│           ├── app/
│           │   ├── logging/                      # NEW: Logging UI (admin-only feature)
│           │   │   ├── dashboard/
│           │   │   │   └── logging-dashboard.component.tsx
│           │   │   ├── failed-auth/
│           │   │   │   └── logging-failed-auth.component.tsx
│           │   │   ├── list/
│           │   │   │   └── logging-list.component.tsx
│           │   │   ├── logging-web.api.ts
│           │   │   ├── logging-web.hooks.ts      # useLoggingAlerts, useLoggingHealth
│           │   │   ├── logging-web.reducer.ts    # Redux reducer for alerts state
│           │   │   ├── logging-web.router.tsx    # Logging routes with role check
│           │   │   ├── logging-web.routes.ts     # Route constants
│           │   │   ├── logging-web.selectors.ts  # Redux selectors
│           │   │   └── logging-web.types.ts
│           │   │
│           │   └── routers/
│           │       └── ... (add logging routes to existing admin router)
│           │
│           └── assets/
│               └── locales/
│                   └── en.json                   # Add i18n strings (merge with existing)

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

export type GetLogsListResponseType = {
  rows: LogRecordType[]
  total: number
}

export type LoggingHealthResponseType = {
  connected: boolean
  lastChecked: Date
  message: string
  version?: string
}

export type LoggingSummaryResponseType = {
  authFailures: number
  rateLimitHits: number
  successfulLogins: number
  totalRequests: number
  uniqueIps: number
  uniqueUsers: number
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

> **SQL Injection Protection:** All user-provided values use parameterized queries (`$1, $2, ...`). Values that cannot be parameterized (e.g., column names, intervals) are validated against whitelists or type-checked before use.

```typescript
import type { Request } from 'express'

import {
  LOG_EVENT_TYPE,
  type GetLogsListQueryType,
  type GetLogsListResponseType,
  type LogEventSubtype,
  type LogEventType,
  type LoggingHealthResponseType,
  type LoggingSummaryResponseType,
  type LogRecordType,
  type LogsHourlySummaryType,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { sanitizeForLogging } from '../logger/sanitize-log.util'
import { TimescaleDbConnection } from '../timescale'

// Whitelist for ORDER BY columns (prevents SQL injection)
const VALID_ORDER_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  eventType: 'event_type',
  ipAddress: 'ip_address',
} as const

// Whitelist for sort directions
const VALID_SORT_DIRS = ['ASC', 'DESC'] as const

/**
 * Validate and sanitize numeric interval values
 * Prevents SQL injection in INTERVAL clauses
 */
function sanitizeInterval(value: number, max: number = 8760): number {
  const num = Math.floor(Number(value))
  if (Number.isNaN(num) || num < 1) return 1
  if (num > max) return max
  return num
}

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

    // Sanitize interval to prevent SQL injection (max 24 hours = 1440 minutes)
    const safeMinutes = sanitizeInterval(minutesAgo, 1440)

    const conditions: string[] = [
      "event_type IN ('AUTH_LOGIN', 'AUTH_FAILURE')",
      'success = false',
      `created_at >= NOW() - INTERVAL '${safeMinutes} minutes'`,
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
   * Get paginated list of logs with filters
   */
  async getLogsList(query: GetLogsListQueryType): Promise<GetLogsListResponseType> {
    if (!this.isEnabled) return { rows: [], total: 0 }

    const {
      endDate,
      eventType,
      fingerprint,
      ipAddress,
      limit = 50,
      offset = 0,
      orderBy = 'createdAt',
      sortDir = 'DESC',
      startDate,
      success,
      userId,
    } = query

    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    // Build WHERE conditions
    if (startDate) {
      conditions.push(`created_at >= $${paramIndex++}`)
      params.push(startDate)
    }
    if (endDate) {
      conditions.push(`created_at <= $${paramIndex++}`)
      params.push(endDate)
    }
    if (eventType) {
      conditions.push(`event_type = $${paramIndex++}`)
      params.push(eventType)
    }
    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`)
      params.push(userId)
    }
    if (ipAddress) {
      conditions.push(`ip_address = $${paramIndex++}`)
      params.push(ipAddress)
    }
    if (fingerprint) {
      conditions.push(`fingerprint = $${paramIndex++}`)
      params.push(fingerprint)
    }
    if (success !== undefined) {
      conditions.push(`success = $${paramIndex++}`)
      params.push(success)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Validate ORDER BY column against whitelist (prevents SQL injection)
    const orderColumn = VALID_ORDER_COLUMNS[orderBy] || 'created_at'

    // Validate sort direction against whitelist
    const safeSortDir = VALID_SORT_DIRS.includes(sortDir as typeof VALID_SORT_DIRS[number])
      ? sortDir
      : 'DESC'

    // Get total count
    const countResult = await TimescaleDbConnection.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM logs ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count, 10)

    // Get paginated rows
    const dataParams = [...params, limit, offset]
    const result = await TimescaleDbConnection.query<LogRecordType>(`
      SELECT
        id,
        created_at as "createdAt",
        event_type as "eventType",
        event_subtype as "eventSubtype",
        user_id as "userId",
        fingerprint,
        device_id as "deviceId",
        ip_address as "ipAddress",
        user_agent as "userAgent",
        http_method as "httpMethod",
        request_path as "requestPath",
        response_status_code as "responseStatusCode",
        response_time_ms as "responseTimeMs",
        geo_country as "geoCountry",
        geo_city as "geoCity",
        success,
        message,
        error_code as "errorCode"
      FROM logs
      ${whereClause}
      ORDER BY ${orderColumn} ${safeSortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, dataParams)

    return { rows: result.rows, total }
  }

  /**
   * Get hourly summary from continuous aggregate
   */
  async getHourlySummary(hoursAgo: number = 24, limit: number = 100): Promise<LogsHourlySummaryType[]> {
    if (!this.isEnabled) return []

    // Sanitize interval to prevent SQL injection (max 720 hours = 30 days)
    const safeHours = sanitizeInterval(hoursAgo, 720)
    // Sanitize limit (max 1000 rows)
    const safeLimit = sanitizeInterval(limit, 1000)

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
      WHERE bucket >= NOW() - INTERVAL '${safeHours} hours'
      ORDER BY bucket DESC
      LIMIT $1
    `, [safeLimit])

    return result.rows
  }

  /**
   * Get summary for dashboard
   */
  async getSummary(hoursAgo: number = 24): Promise<LoggingSummaryResponseType> {
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

    // Sanitize interval to prevent SQL injection (max 720 hours = 30 days)
    const safeHours = sanitizeInterval(hoursAgo, 720)

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
      WHERE created_at >= NOW() - INTERVAL '${safeHours} hours'
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

  /**
   * Health check for TimescaleDB connection
   * Used for monitoring and graceful degradation in UI
   */
  async getHealth(): Promise<LoggingHealthResponseType> {
    const lastChecked = new Date()

    if (!this.isEnabled) {
      return {
        connected: false,
        lastChecked,
        message: 'TimescaleDB not configured',
      }
    }

    try {
      const result = await TimescaleDbConnection.query<{ extversion: string }>(
        "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'"
      )

      if (result.rows.length === 0) {
        return {
          connected: false,
          lastChecked,
          message: 'TimescaleDB extension not installed',
        }
      }

      return {
        connected: true,
        lastChecked,
        message: 'Connected',
        version: result.rows[0].extversion,
      }
    } catch (err) {
      return {
        connected: false,
        lastChecked,
        message: (err as Error).message,
      }
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

### 3. Rate Limiter Integration

**`packages/api/libs/rate-limiter/rate-limiter.middleware.ts`** (Updated)

> **Note:** The existing rate limiter uses Redis for decisions. We're adding logging only - the rate limit logic remains unchanged.

```typescript
import type { NextFunction, Request, Response } from 'express'

import { LoggingService } from '../logging/logging-api.service'

export const rateLimiterMiddleware = (options: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Existing Redis-based rate limit check
      const result = await checkRateLimit(req, options)

      if (result.isLimited) {
        // NEW: Log rate limit hit to TimescaleDB (fire-and-forget)
        const loggingService = new LoggingService()
        loggingService.recordRateLimitHit(req, `Rate limit exceeded: ${options.key}`)

        // Existing rate limit response
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        })
        return
      }

      next()
    } catch (err) {
      // Rate limit check failed - allow request but log warning
      console.warn('Rate limiter error:', err)
      next()
    }
  }
}
```

**Alternative: Centralized Rate Limit Handler**

If you have a centralized rate limit error handler:

```typescript
// packages/api/libs/rate-limiter/rate-limit-handler.util.ts

import type { Request, Response } from 'express'

import { LoggingService } from '../logging/logging-api.service'

export function handleRateLimitExceeded(
  req: Request,
  res: Response,
  options: { key: string; retryAfter: number }
): void {
  // Log to TimescaleDB (fire-and-forget, non-blocking)
  const loggingService = new LoggingService()
  loggingService.recordRateLimitHit(req, `Rate limit exceeded: ${options.key}`)

  // Send 429 response
  res.status(429).json({
    error: 'Too many requests',
    retryAfter: options.retryAfter,
  })
}
```

### 4. Auth Controller Integration

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
- [ ] Update rate limiter middleware to call `LoggingService.recordRateLimitHit()` on 429 responses
- [ ] Verify rate limit logging is fire-and-forget (doesn't block 429 response)

### Phase 4: Continuous Aggregates
- [ ] Create logs_hourly continuous aggregate
- [ ] Create logs_daily continuous aggregate
- [ ] Add refresh policies (1 hour, 1 day)
- [ ] Verify aggregates are being populated

### Phase 5: RBAC Implementation
- [ ] **Verify `UserProfileStateType.role` is `string[]`** (if not, plan migration)
- [ ] Add `LOGGING_ADMIN` to `USER_ROLE` constant in shared models
- [ ] Update privilege sets seed data with `LOGGING_ADMIN` entry
- [ ] Run database seeder: `make db-seed`
- [ ] Create `hasLoggingAdminRole` middleware in API
- [ ] Add i18n strings for logging UI (SYSTEM_LOGS, LOGGING_ADMIN, etc.) - merge with existing en.json
- [ ] Update `MenuConfigService.getMenus()` to support multiple roles
- [ ] Update `login-bootstrap.ts` to pass roles array to menu service
- [ ] Add logs menu item to admin menu with `restriction: USER_ROLE.LOGGING_ADMIN`
- [ ] Verify menu visibility for different roles (USER, ADMIN, LOGGING_ADMIN, SUPER_ADMIN)
- [ ] Verify only SUPER_ADMIN can toggle LOGGING_ADMIN role in user admin UI

### Phase 6: Logging API Routes
- [ ] Implement `getLogsList` method in LoggingService (with pagination, filtering, sorting)
- [ ] Implement `getHealth` method in LoggingService
- [ ] Create `LoggingController` with methods: getFailedAuth, getHealth, getHourlySummary, getLogsList, getSummary, exportLogs
- [ ] Create `logging-api.routes.ts` with `hasLoggingAdminRole` middleware protection
- [ ] Add logging routes to `api.routes.ts` (`/logs/*`)
- [ ] Implement context-dependent sanitization in LoggingService
- [ ] Add Socket.IO threshold tracking logic (in-memory map with 5-min sliding window)
- [ ] Test API endpoints with different roles (should reject non-LOGGING_ADMIN users)
- [ ] Test health endpoint returns correct status when TimescaleDB is up/down

### Phase 7: Admin UI Components
- [ ] Create `LOGGING_ROUTES` and `LOGGING_API_ENDPOINTS` constants (`logging-web.routes.ts`)
- [ ] Create `LoggingRouter` with role check (using `useSelector`, not `store.getState()`)
- [ ] Add logging router to admin routes config
- [ ] Create logging dashboard component (`logging-dashboard.component.tsx`)
  - [ ] Summary metrics cards with trend indicators
  - [ ] Time range selector (1h, 6h, 24h, 7d, 30d, Custom)
  - [ ] Auto-refresh toggle
  - [ ] Real-time alert banner display
  - [ ] Health status indicator (uses `/api/logs/health`)
- [ ] Create failed auth lookup component (`logging-failed-auth.component.tsx`)
  - [ ] Search by IP/fingerprint/user_id
  - [ ] Time window selector
  - [ ] Results table with export
- [ ] Create log list component (`logging-list.component.tsx`)
  - [ ] Filterable table (event type, date range, success/failure, user, IP, fingerprint)
  - [ ] Pagination (25/50/100/200 rows) - server-side
  - [ ] Sorting (created_at, event_type, ip_address)
  - [ ] Export to CSV/JSON
- [ ] Add RTK Query endpoints for logging API (including health endpoint)
- [ ] Create logging Redux reducer (`logging-web.reducer.ts`) for alerts state
- [ ] Create logging selectors (`logging-web.selectors.ts`)
- [ ] Implement `useLoggingAlerts` hook for Socket.IO connection
- [ ] Implement `useLoggingHealth` hook for health status polling
- [ ] Add graceful degradation UI for TimescaleDB downtime (banner with last query timestamp)
- [ ] Wrap routes with existing `ErrorBoundary` + `GlobalErrorComponent` as fallback
- [ ] Test route protection (unauthorized redirect)

### Phase 8: Socket.IO Real-Time Alerts
- [ ] Create `/admin-logs` namespace in Socket.IO server
- [ ] Add authentication middleware to namespace (verify LOGGING_ADMIN role)
- [ ] Implement auto-join to `logging-alerts` room for authenticated users
- [ ] Add in-memory threshold tracking with 5-minute sliding window
  - [ ] Track by key: `${ipAddress}:${fingerprint}`
  - [ ] Document limitation: counts not shared across API instances
- [ ] Emit `auth_failure_warning` at 3 failures in window
- [ ] Emit `auth_failure_critical` at 10+ failures in window
- [ ] Emit `rate_limit_alert` for rate limit events
- [ ] Add cleanup logic for stale entries (older than 5 minutes)
- [ ] Test Socket.IO connection from admin dashboard
- [ ] Test alert display (warning banner, critical banner with sound)
- [ ] Verify alerts don't fire for isolated failures (1-2 attempts)
- [ ] Test threshold reset on server restart (expected behavior)

### Phase 9: Testing & Validation
- [ ] Unit tests for LoggingService (sanitization, context extraction)
- [ ] Unit tests for SQL injection protection (interval sanitization, ORDER BY whitelist)
- [ ] Unit tests for hasLoggingAdminRole middleware
- [ ] Integration tests for log recording (auth success/failure, rate limits)
- [ ] E2E tests for admin UI components
- [ ] Test RBAC: USER cannot access logs
- [ ] Test RBAC: ADMIN cannot access logs (unless also has LOGGING_ADMIN)
- [ ] Test RBAC: LOGGING_ADMIN can access all logging features
- [ ] Test RBAC: SUPER_ADMIN can access logs and assign LOGGING_ADMIN role
- [ ] Test RBAC: ADMIN cannot assign LOGGING_ADMIN role
- [ ] Test Socket.IO threshold escalation logic
- [ ] Test graceful degradation (TimescaleDB down)
- [ ] Verify compression is working (check chunks after 7 days)
- [ ] Verify retention policy is configured (check for auto-deletion after 90 days)
- [ ] Load test: verify system handles logging under high traffic

### Phase 10: Documentation & Deployment
- [ ] Update API documentation with new `/api/logs/*` endpoints
- [ ] Document LOGGING_ADMIN role assignment process
- [ ] Add logging dashboard user guide for admins
- [ ] Update deployment checklist with TIMESCALE_URI environment variable
- [ ] Create monitoring alerts for TimescaleDB connection failures
- [ ] Document Option B → Option A migration procedure (if needed in future)

---

*Document Version: 4.6*
*Created: January 27, 2026*
*Updated: January 28, 2026 - Added comprehensive RBAC, Admin UI, Socket.IO, implementation decisions, health check endpoint, getLogsList method, clarified threshold tracking limitations, rate limiter integration details, use existing ErrorBoundary + GlobalErrorComponent, simplified file structure, and added SQL injection protection (parameterized queries, interval sanitization, ORDER BY whitelist)*
