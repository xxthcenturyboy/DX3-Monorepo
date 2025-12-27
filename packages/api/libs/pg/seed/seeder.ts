#!/usr/bin/env ts-node
/**
 * Database Seeder Orchestrator
 * Handles database seeding with migrations as the source of truth for schema.
 *
 * Flow:
 *   --reset:  Drop all tables → Run ALL migrations → Run seeders
 *   default:  Run pending migrations → Run seeders
 *
 * Usage:
 *   pnpm --filter @dx3/api db:seed           # Run pending migrations + seeders
 *   pnpm --filter @dx3/api db:seed --reset   # Drop all, run all migrations, then seed
 *   pnpm --filter @dx3/api db:seed --verbose # Enable verbose logging
 */

import 'reflect-metadata'

import { type ModelCtor, Sequelize } from 'sequelize-typescript'

import { APP_PREFIX } from '@dx3/models-shared'

import { DeviceModel } from '../../devices/device-api.postgres-model'
import { EmailModel } from '../../email/email-api.postgres-model'
import { ApiLoggingClass } from '../../logger'
import { MediaModel } from '../../media/media-api.postgres-model'
import { NotificationModel } from '../../notifications/notification-api.postgres-model'
import { PhoneModel } from '../../phone/phone-api.postgres-model'
import { RedisService } from '../../redis'
import { ShortLinkModel } from '../../shortlink/shortlink-api.postgres-model'
import { UserModel } from '../../user/user-api.postgres-model'
import { UserPrivilegeSetModel } from '../../user-privilege/user-privilege-api.postgres-model'
import { MIGRATIONS_PATH, MigrationRunner } from '../migrations'
import { parsePostgresConnectionUrl } from '../parse-postgres-connection-url'
import type { SeederContext, SeederOptions, SeederResult, SeedSummary } from './seed.types'
import { seeders } from './seeders'

// ANSI color codes for terminal output
const colors = {
  blue: '\x1b[34m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
}

/**
 * Initialize required services (Logger and Redis) for the seeder
 * These singletons are required by cache services used in seeders
 */
async function initializeServices(options: SeederOptions): Promise<void> {
  // 1. Initialize the logger first (RedisService depends on it)
  new ApiLoggingClass({ appName: 'dx3-seeder' })
  if (options.verbose) {
    console.log(`${colors.green}✓ Logger initialized${colors.reset}`)
  }

  // 2. Initialize Redis connection
  const redisUrl = process.env.REDIS_URL
  const redisPort = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379

  if (!redisUrl) {
    console.log(
      `${colors.yellow}⚠ REDIS_URL not set - cache updates will be skipped${colors.reset}`,
    )
    return
  }

  try {
    new RedisService({
      isDev: true, // Seeder always runs in local/development context
      redis: {
        port: redisPort,
        prefix: APP_PREFIX,
        url: redisUrl,
      },
    })

    if (options.verbose) {
      console.log(`${colors.green}✓ Redis connected at ${redisUrl}:${redisPort}${colors.reset}`)
    }
  } catch (error) {
    console.log(
      `${colors.yellow}⚠ Failed to connect to Redis: ${(error as Error).message}${colors.reset}`,
    )
    console.log(`${colors.yellow}  Cache updates will be skipped${colors.reset}`)
  }
}

/**
 * Get all Sequelize models for the application
 */
function getModels(): ModelCtor[] {
  return [
    DeviceModel,
    EmailModel,
    MediaModel,
    NotificationModel,
    PhoneModel,
    ShortLinkModel,
    UserModel,
    UserPrivilegeSetModel,
  ]
}

/**
 * Parse command line arguments
 */
function parseArgs(): SeederOptions {
  const args = process.argv.slice(2)
  return {
    forceSync: args.includes('--force-sync') || args.includes('-f'),
    reset: args.includes('--reset') || args.includes('-r'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  }
}

/**
 * Create a basic Sequelize connection (without models synced)
 */
async function createSequelizeConnection(options: SeederOptions): Promise<Sequelize> {
  const postgresUri = process.env.POSTGRES_URI

  if (!postgresUri) {
    throw new Error('POSTGRES_URI environment variable is not set')
  }

  const config = parsePostgresConnectionUrl(postgresUri)

  if (!config) {
    throw new Error('Failed to parse POSTGRES_URI')
  }

  const sequelize = new Sequelize({
    database: config.segments?.[0],
    define: {
      underscored: true,
    },
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
    host: config.hostname,
    logging: options.verbose ? console.log : false,
    password: config.password,
    port: config.port,
    username: config.user,
  })

  // Install required PostgreSQL extensions
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";')
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

  // Add models to sequelize instance (needed for seeders to work)
  sequelize.addModels(getModels())

  return sequelize
}

/**
 * Drop all tables in the database (for reset functionality).
 * This includes the SequelizeMeta table so migrations can be re-run.
 */
async function dropAllTables(sequelize: Sequelize, options: SeederOptions): Promise<void> {
  console.log(`${colors.yellow}⚠ Dropping all tables...${colors.reset}`)

  // Drop all tables using CASCADE to handle foreign key constraints
  // We use raw SQL to ensure we drop everything including SequelizeMeta
  await sequelize.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      -- Disable triggers to avoid FK constraint issues during drop
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `)

  // Also drop custom enum types so they can be recreated by migrations
  const enumTypes = [
    'user_role',
    'account_restriction',
    'enum_devices_facial_auth_state',
    'enum_notifications_level',
  ]

  for (const enumType of enumTypes) {
    try {
      await sequelize.query(`DROP TYPE IF EXISTS ${enumType} CASCADE;`)
    } catch (error) {
      if (options.verbose) {
        console.log(
          `${colors.yellow}  Could not drop type ${enumType}: ${(error as Error).message}${colors.reset}`,
        )
      }
    }
  }

  console.log(`${colors.green}✓ All tables dropped${colors.reset}`)
}

/**
 * Create PostgreSQL enum types (needed before migrations can run)
 */
async function createEnumTypes(sequelize: Sequelize, options: SeederOptions): Promise<void> {
  const enumQueries = [
    `DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE account_restriction AS ENUM ('ADMIN_LOCKOUT', 'LOGIN_ATTEMPTS', 'OTP_LOCKOUT');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE enum_devices_facial_auth_state AS ENUM ('CHALLENGE', 'NOT_APPLICABLE', 'SUCCESS');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE enum_notifications_level AS ENUM ('DANGER', 'INFO', 'PRIMARY', 'SUCCESS', 'WARNING');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
  ]

  for (const query of enumQueries) {
    try {
      await sequelize.query(query)
    } catch (error) {
      if (options.verbose) {
        console.log(`${colors.yellow}Warning: ${(error as Error).message}${colors.reset}`)
      }
    }
  }
}

/**
 * Run database migrations.
 * @param sequelize - Sequelize instance
 * @param options - Seeder options
 * @param isReset - If true, we expect all migrations to run (fresh database)
 */
async function runMigrations(
  sequelize: Sequelize,
  options: SeederOptions,
  isReset: boolean,
): Promise<void> {
  const action = isReset ? 'Running all migrations' : 'Running pending migrations'
  console.log(`${colors.blue}${action}...${colors.reset}`)

  const runner = new MigrationRunner(sequelize)
  const results = await runner.runPendingMigrations({
    direction: 'up',
    dryRun: false,
    migrationsPath: MIGRATIONS_PATH,
  })

  const successful = results.filter((r) => r.status === 'success')
  const failed = results.filter((r) => r.status === 'failed')

  if (failed.length > 0) {
    console.log(`${colors.red}✗ ${failed.length} migration(s) failed${colors.reset}`)
    for (const f of failed) {
      console.log(`  - ${f.migrationName}: ${f.error?.message}`)
    }
    throw new Error('Migration failed - cannot proceed with seeding')
  }

  if (successful.length > 0) {
    console.log(`${colors.green}✓ Applied ${successful.length} migration(s)${colors.reset}`)
    if (options.verbose) {
      for (const s of successful) {
        console.log(`  - ${s.migrationName}`)
      }
    }
  } else {
    console.log(`${colors.green}✓ No pending migrations${colors.reset}`)
  }
}

/**
 * Run all seeders
 */
async function runSeeders(options: SeederOptions): Promise<SeedSummary> {
  const startTime = Date.now()
  const results: SeederResult[] = []
  const context: SeederContext = {
    options,
    previousResults: [],
  }

  console.log(
    `\n${colors.cyan}${colors.bright}╔════════════════════════════════════════╗${colors.reset}`,
  )
  console.log(
    `${colors.cyan}${colors.bright}║     DX3 Database Seeder                ║${colors.reset}`,
  )
  console.log(
    `${colors.cyan}${colors.bright}╚════════════════════════════════════════╝${colors.reset}\n`,
  )

  console.log(`${colors.blue}Options:${colors.reset}`)
  console.log(
    `  Reset:      ${options.reset ? colors.yellow + 'Yes' : colors.green + 'No'}${colors.reset}`,
  )
  console.log(`  Verbose:    ${options.verbose ? colors.green + 'Yes' : 'No'}${colors.reset}\n`)

  for (const seeder of seeders) {
    const seederStartTime = Date.now()
    console.log(`${colors.blue}▶ Running ${seeder.name}...${colors.reset}`)

    try {
      const count = await seeder.run(context)
      const duration = Date.now() - seederStartTime

      const result: SeederResult = {
        count,
        duration,
        name: seeder.name,
        success: true,
      }

      results.push(result)
      context.previousResults.push(result)

      console.log(
        `${colors.green}  ✓ Completed: ${count} record(s) in ${duration}ms${colors.reset}\n`,
      )
    } catch (error) {
      const duration = Date.now() - seederStartTime
      const errorMessage = (error as Error).message

      const result: SeederResult = {
        count: 0,
        duration,
        error: errorMessage,
        name: seeder.name,
        success: false,
      }

      results.push(result)
      context.previousResults.push(result)

      console.log(`${colors.red}  ✗ Failed: ${errorMessage}${colors.reset}\n`)
    }
  }

  const totalDuration = Date.now() - startTime
  const successCount = results.filter((r) => r.success).length
  const failureCount = results.filter((r) => !r.success).length
  const totalRecords = results.reduce((sum, r) => sum + r.count, 0)

  return {
    failureCount,
    results,
    successCount,
    totalDuration,
    totalRecords,
  }
}

/**
 * Print summary of seeding results
 */
function printSummary(summary: SeedSummary): void {
  console.log(
    `${colors.cyan}${colors.bright}════════════════════════════════════════${colors.reset}`,
  )
  console.log(
    `${colors.cyan}${colors.bright}              SUMMARY                    ${colors.reset}`,
  )
  console.log(
    `${colors.cyan}${colors.bright}════════════════════════════════════════${colors.reset}\n`,
  )

  console.log(`${colors.blue}Results:${colors.reset}`)
  console.log(`  Total Duration:  ${summary.totalDuration}ms`)
  console.log(`  Seeders Run:     ${summary.successCount + summary.failureCount}`)
  console.log(`  ${colors.green}Successful:      ${summary.successCount}${colors.reset}`)
  if (summary.failureCount > 0) {
    console.log(`  ${colors.red}Failed:          ${summary.failureCount}${colors.reset}`)
  }
  console.log(`  Total Records:   ${summary.totalRecords}\n`)

  if (summary.failureCount > 0) {
    console.log(`${colors.red}Failed Seeders:${colors.reset}`)
    for (const result of summary.results.filter((r) => !r.success)) {
      console.log(`  - ${result.name}: ${result.error}`)
    }
    console.log()
  }

  if (summary.failureCount === 0) {
    console.log(
      `${colors.green}${colors.bright}✓ All seeders completed successfully!${colors.reset}\n`,
    )
  } else {
    console.log(`${colors.yellow}⚠ Some seeders failed. Check errors above.${colors.reset}\n`)
  }
}

/**
 * Sync models to create/update tables.
 * For reset: force sync (drop and recreate)
 * For normal: alter sync (update existing tables)
 */
async function syncModels(sequelize: Sequelize, options: SeederOptions): Promise<void> {
  if (options.reset) {
    console.log(`${colors.blue}Creating tables from models...${colors.reset}`)
    await sequelize.sync({ force: false }) // Tables already dropped, just create
  } else {
    console.log(`${colors.blue}Syncing models with database...${colors.reset}`)
    await sequelize.sync({ alter: false }) // Don't alter, let migrations handle changes
  }
  console.log(`${colors.green}✓ Models synced${colors.reset}`)
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseArgs()
  let sequelize: Sequelize | null = null

  try {
    // Initialize services (Logger and Redis) for cache operations
    console.log(`${colors.blue}Initializing services...${colors.reset}`)
    await initializeServices(options)

    console.log(`${colors.blue}Connecting to database...${colors.reset}`)
    sequelize = await createSequelizeConnection(options)
    console.log(`${colors.green}✓ Database connected successfully${colors.reset}`)

    // Handle reset: drop all tables first
    if (options.reset) {
      await dropAllTables(sequelize, options)
    }

    // Create enum types (needed before models can create tables that use them)
    await createEnumTypes(sequelize, options)

    // Sync models to create base tables (migrations alter existing tables)
    await syncModels(sequelize, options)

    // Run migrations for any schema changes beyond the model definitions
    await runMigrations(sequelize, options, options.reset)

    // Run seeders
    const summary = await runSeeders(options)
    printSummary(summary)

    process.exit(summary.failureCount > 0 ? 1 : 0)
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Error:${colors.reset} ${(error as Error).message}`)
    if (options.verbose) {
      console.error(error)
    }
    process.exit(1)
  } finally {
    if (sequelize) {
      await sequelize.close()
    }
  }
}

// Run if executed directly
main()
