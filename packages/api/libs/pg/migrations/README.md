# PostgreSQL Migration Framework

Professional database migration system for DX3 API using Sequelize.

## Overview

This migration framework provides:

- **Transaction-safe migrations** - All changes wrapped in `BEGIN/COMMIT`
- **Automatic tracking** - `SequelizeMeta` table tracks applied migrations
- **TypeScript CLI** - Full TypeScript support with type definitions
- **Dry-run mode** - Test migrations without applying changes
- **Programmatic API** - `MigrationRunner` class for custom integrations

---

## Quick Start

```bash
# Check migration status
pnpm --filter @dx3/api db:migrate:status

# Run all pending migrations
pnpm --filter @dx3/api db:migrate

# Rollback last migration
pnpm --filter @dx3/api db:migrate:down

# Create a new migration
pnpm --filter @dx3/api db:migrate:create --name "add-user-avatar"
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm db:migrate` | Run all pending migrations |
| `pnpm db:migrate:down` | Rollback the last applied migration |
| `pnpm db:migrate:status` | Display applied and pending migrations |
| `pnpm db:migrate:create --name "name"` | Generate a new migration file |
| `pnpm db:migrate:redo` | Rollback and re-apply the last migration |

### Command Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name` | `-n` | Migration name (required for `create`) |
| `--dry-run` | `-d` | Preview changes without applying |

---

## Configuration

### Environment Variables

The migrator reads database configuration from environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_URI` | PostgreSQL connection URL | Auto-detected (see below) |
| `NODE_ENV` | Environment mode | `development` |
| `ROOT_DIR` | Container detection marker | (set by Docker) |

### Auto-Detection

The CLI automatically detects its execution environment:

| Environment | Default `POSTGRES_URI` |
|-------------|------------------------|
| **Host machine** | `postgres://pguser:password@localhost:5433/dx3` |
| **Docker container** | `postgres://pguser:password@postgres:5432/dx3` |

Detection is based on:
- `ROOT_DIR=/app` environment variable (set in `docker-compose.yml`)
- Presence of `/.dockerenv` file

### Connection URL Format

```
postgres://username:password@host:port/database
```

Example:
```
POSTGRES_URI=postgres://pguser:password@localhost:5433/dx3
```

---

## Running from Docker Containers

The migration CLI automatically detects when running inside a Docker container and adjusts the database connection accordingly.

### Local Development (from host)

```bash
# From your host machine (uses localhost:5433)
cd packages/api
pnpm db:migrate:status
pnpm db:migrate
```

### From Inside Container

```bash
# Attach to running container
docker exec -it api-dx3 bash

# Inside container (uses postgres:5432 automatically)
cd /app/packages/api
pnpm db:migrate:status
pnpm db:migrate
```

Or run directly without attaching:

```bash
docker exec -it api-dx3 pnpm --filter @dx3/api db:migrate:status
docker exec -it api-dx3 pnpm --filter @dx3/api db:migrate
```

### Production / CI/CD Deployment

For non-local environments, migrations should run from a container with network access to the database:

```yaml
# Example: GitHub Actions workflow step
- name: Run Database Migrations
  run: |
    docker run --rm \
      --network=app-network \
      -e POSTGRES_URI=${{ secrets.DATABASE_URL }} \
      -e NODE_ENV=production \
      your-api-image:latest \
      pnpm db:migrate
```

Or using Kubernetes Job:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: your-api-image:latest
          command: ["pnpm", "db:migrate"]
          env:
            - name: POSTGRES_URI
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: uri
            - name: NODE_ENV
              value: production
      restartPolicy: Never
```

### Why Run Migrations from Container?

1. **Network Access**: Containers on the same Docker network can reach the database by hostname
2. **Consistent Environment**: Same Node.js version and dependencies as production
3. **Secrets Management**: Production credentials stay within the container orchestration
4. **Atomic Deployments**: Run migrations as part of deployment pipeline before starting the app

---

## Creating Migrations

### 1. Generate Migration File

```bash
pnpm db:migrate:create --name "add-user-preferences"
```

This creates a timestamped file:
```
20251227143000-add-user-preferences.js
```

### 2. Migration File Structure

```javascript
'use strict'

module.exports = {
  /**
   * Apply migration
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      BEGIN;
        -- Your SQL here
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
      COMMIT;
    `)
  },

  /**
   * Rollback migration
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      BEGIN;
        ALTER TABLE users DROP COLUMN IF EXISTS preferences;
      COMMIT;
    `)
  },
}
```

### 3. Migration Naming Convention

Format: `YYYYMMDDHHMMSS-description.js`

Examples:
- `20251227120000-add-user-avatar.js`
- `20251227130000-create-notifications-table.js`
- `20251227140000-add-index-on-emails.js`

---

## Migration Examples

### Add Column

```javascript
up: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      ALTER TABLE users
        ADD COLUMN avatar_url VARCHAR(512) NULL;
    COMMIT;
  `)
}

down: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      ALTER TABLE users
        DROP COLUMN IF EXISTS avatar_url;
    COMMIT;
  `)
}
```

### Create Table

```javascript
up: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_read_at ON notifications(read_at);
    COMMIT;
  `)
}

down: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      DROP TABLE IF EXISTS notifications;
    COMMIT;
  `)
}
```

### Add Index

```javascript
up: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emails_verified
        ON emails(verified_at)
        WHERE verified_at IS NOT NULL;
    COMMIT;
  `)
}

down: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      DROP INDEX IF EXISTS idx_emails_verified;
    COMMIT;
  `)
}
```

### Modify Column Type

```javascript
up: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      ALTER TABLE users
        ALTER COLUMN bio TYPE TEXT;
    COMMIT;
  `)
}

down: async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      ALTER TABLE users
        ALTER COLUMN bio TYPE VARCHAR(500);
    COMMIT;
  `)
}
```

---

## Programmatic Usage

You can use the `MigrationRunner` class directly in your code:

```typescript
import { MigrationRunner } from '@dx3/api/libs/pg/migrations'
import { PostgresDbConnection } from '@dx3/api/libs/pg'

// Get Sequelize instance
const sequelize = PostgresDbConnection.dbHandle

// Create runner
const runner = new MigrationRunner(sequelize)

// Check status
const status = await runner.getMigrationStatus('./migrations')
console.log('Pending:', status.pending.length)

// Run migrations
await runner.runPendingMigrations({
  direction: 'up',
  dryRun: false,
  migrationsPath: './migrations',
})
```

---

## Best Practices

### 1. Always Implement `down()`

Rollback migrations should reverse all changes made by `up()`:

```javascript
// BAD - Throws error, can't rollback
down: async () => {
  throw new Error('down() not implemented')
}

// GOOD - Properly reverses changes
down: async (queryInterface) => {
  await queryInterface.sequelize.query(`
    BEGIN;
      ALTER TABLE users DROP COLUMN IF EXISTS new_column;
    COMMIT;
  `)
}
```

### 2. Use Transactions

Wrap all operations in `BEGIN/COMMIT`:

```javascript
await queryInterface.sequelize.query(`
  BEGIN;
    -- All operations here are atomic
    ALTER TABLE users ADD COLUMN col1 VARCHAR(100);
    ALTER TABLE users ADD COLUMN col2 VARCHAR(100);
  COMMIT;
`)
```

### 3. Use `IF EXISTS` / `IF NOT EXISTS`

Make migrations idempotent:

```javascript
// Safe to run multiple times
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(512);
DROP INDEX IF EXISTS idx_old_index;
CREATE INDEX IF NOT EXISTS idx_new_index ON users(email);
```

### 4. Test Migrations Locally First

```bash
# Dry run to see what would happen
pnpm db:migrate --dry-run

# Apply migration
pnpm db:migrate

# Verify with status
pnpm db:migrate:status

# Test rollback
pnpm db:migrate:down
```

### 5. One Change Per Migration

Keep migrations focused:

```
# BAD
20251227120000-update-everything.js

# GOOD
20251227120000-add-user-avatar.js
20251227120100-add-user-preferences.js
20251227120200-create-notifications-table.js
```

---

## Troubleshooting

### Migration Failed

If a migration fails mid-execution:

1. Check the error message in console output
2. Fix the issue in the migration file
3. Manually rollback any partial changes if needed
4. Run migration again

### Cannot Connect to Database

Verify your `POSTGRES_URI` environment variable:

```bash
# Check current value
echo $POSTGRES_URI

# Set for current session
export POSTGRES_URI="postgres://pguser:password@localhost:5433/dx3"
```

### Migration Already Applied

If you need to re-run a migration:

```bash
# Rollback first
pnpm db:migrate:down

# Then apply again
pnpm db:migrate
```

Or manually remove from tracking table:

```sql
DELETE FROM "SequelizeMeta" WHERE name = '20251227120000-migration-name.js';
```

---

## File Structure

```
migrations/
├── README.md                              # This documentation
├── database.config.js                     # Sequelize CLI configuration
├── index.ts                               # Module exports + MIGRATIONS_PATH
├── migrate.cli.ts                         # CLI entry point
├── migration.runner.ts                    # Core migration engine
├── migration.types.ts                     # TypeScript type definitions
└── scripts/                               # Migration script files
    └── 20251227130000-test-migration-column.js
```

**Note:** Migration script files are stored in the `scripts/` subdirectory to separate
the framework code from the actual migration files. New migrations created with
`pnpm db:migrate:create` will automatically be placed in `scripts/`.

---

## Related Documentation

- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
