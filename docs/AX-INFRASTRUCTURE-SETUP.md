# ax-infrastructure Setup Guide

**Document Version:** 1.1
**Created:** February 2026
**Updated:** February 2026
**Status:** Phase 0 Complete - Infrastructure Implemented

---

## Overview

This document provides instructions for setting up the `ax-infrastructure` repository, which contains shared services for the dx3 application ecosystem.

## Repository Structure

Create a new repository named `ax-infrastructure` with the following structure:

```
ax-infrastructure/
├── docker-compose.yml
├── init-scripts/
│   ├── init-timescale.sql
│   └── init-shared-pg.sql
├── .env.example
├── Makefile
└── README.md
```

---

## Files to Create

### 1. `docker-compose.yml`

```yaml
name: ax-infrastructure

services:
  timescaledb:
    image: timescale/timescaledb:latest-pg16
    container_name: ax-timescaledb-shared
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
    container_name: ax-postgres-shared
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
    container_name: ax-redis-shared
    ports:
      - "6380:6379"
    volumes:
      - redis-shared-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

networks:
  default:
    name: ax-shared-network

volumes:
  timescale-data:
  postgres-shared-data:
  redis-shared-data:
```

### 2. `init-scripts/init-timescale.sql`

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
  PRIMARY KEY (app_id, created_at, id)
);

-- Convert to hypertable with space partitioning by app_id
-- Note: app_id must be in PRIMARY KEY for space partitioning to work
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

-- Retention policy (90 days)
SELECT add_retention_policy('logs', INTERVAL '90 days', if_not_exists => TRUE);
```

### 3. `init-scripts/init-shared-pg.sql`

```sql
-- Create databases for lightweight apps
CREATE DATABASE artefx;
CREATE DATABASE dan_underwood_com;
CREATE DATABASE michelleradnia_com;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE artefx TO axuser;
GRANT ALL PRIVILEGES ON DATABASE dan_underwood_com TO axuser;
GRANT ALL PRIVILEGES ON DATABASE michelleradnia_com TO axuser;
```

### 4. `Makefile`

```makefile
.PHONY: help up down logs restart reset

help:
	@echo "ax-infrastructure commands:"
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
	@echo "  Shared Redis:      localhost:6380"

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

### 5. `.env.example`

```bash
# ax-infrastructure Environment Variables
# Copy to .env and configure

# TimescaleDB
TIMESCALE_USER=axuser
TIMESCALE_PASSWORD=axpassword
TIMESCALE_DB=ax_logs

# Shared PostgreSQL
POSTGRES_USER=axuser
POSTGRES_PASSWORD=axpassword
```

### 6. `README.md`

```markdown
# ax-infrastructure

Shared infrastructure for the dx3 application ecosystem.

## Services Provided

- **TimescaleDB** (port 5434): Centralized logging and metrics
- **Shared PostgreSQL** (port 5435): Database for lightweight apps
- **Shared Redis** (port 6380): Cache for lightweight apps

## Quick Start

\`\`\`bash
# Start all services
make up

# View logs
make logs

# Stop services
make down
\`\`\`

## First-Time Setup

1. Clone this repository
2. Run `make up`
3. Verify services are healthy: `docker ps`

## Integration with Apps

Apps using this infrastructure should set these environment variables:

\`\`\`bash
TIMESCALE_ENABLED=true
TIMESCALE_URI=postgresql://axuser:axpassword@localhost:5434/ax_logs
POSTGRES_URI=postgresql://axuser:axpassword@localhost:5435/your_db_name
REDIS_URL=redis://localhost
REDIS_PORT=6380
\`\`\`

## Port Summary

| Service | Port |
|---------|------|
| TimescaleDB | 5434 |
| Shared PostgreSQL | 5435 |
| Shared Redis | 6380 |
```

---

## Integration with dx3-monorepo

### Environment Variables for Integration Mode

Create a `.env.integration` file in your dx3-monorepo root with:

```bash
# App Identity
APP_ID=dx3-default

# Shared Infrastructure
TIMESCALE_ENABLED=true
TIMESCALE_URI=postgresql://axuser:axpassword@localhost:5434/ax_logs

# For lightweight apps using shared PostgreSQL
POSTGRES_URI=postgresql://axuser:axpassword@localhost:5435/artefx

# Shared Redis
REDIS_URL=redis://localhost
REDIS_PORT=6380

# API Configuration (same as standalone)
API_PORT=4000
API_URL=http://localhost:4000
NODE_ENV=development
```

### Running in Integration Mode

1. Start ax-infrastructure: `cd ~/Developer/ArteFX/ax-infrastructure && make up`
2. Start dx3-monorepo in integration mode: `make dev-integration`
   - This starts only API + SendGrid + LocalStack
   - Skips local Redis/PostgreSQL (uses ax-infrastructure instead)
3. Run API in watch/start mode as usual:
   - Terminal 1: `make api-watch`
   - Terminal 2: `make api-start`

**Note:** Using `docker compose up -d` (standalone mode) will start local Redis/PostgreSQL on the same ports as ax-infrastructure, causing conflicts. Always use `make dev-integration` when ax-infrastructure is running.

---

## Verification Steps

After setting up, verify everything is working:

```bash
# Check TimescaleDB connection
psql postgresql://axuser:axpassword@localhost:5434/ax_logs -c "SELECT * FROM logs LIMIT 1;"

# Check shared PostgreSQL
psql postgresql://axuser:axpassword@localhost:5435/artefx -c "SELECT 1;"

# Check Redis
redis-cli -p 6380 ping
```

---

## Next Steps

After creating the ax-infrastructure repository:

1. ✅ Task 0.1: Menu System Refactor (completed)
2. ✅ Task 0.2: Role Hierarchy Alignment (completed)
3. ✅ Task 0.3: APP_ID Configuration Constants (completed)
4. ✅ Task 0.4: Create ax-infrastructure repository (completed)
5. ✅ Task 0.5: Update dx3-monorepo template (completed)

**Phase 0 Complete!** Proceed to Phase 1 (Logging Infrastructure).
