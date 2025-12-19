#!/usr/bin/env ts-node
/**
 * Database Seeder Orchestrator
 * Handles database seeding with optional reset functionality
 *
 * Usage:
 *   ts-node -r dotenv/config ./seed/index.ts           # Run seeders only
 *   ts-node -r dotenv/config ./seed/index.ts --reset   # Drop tables and reseed
 *   ts-node -r dotenv/config ./seed/index.ts --verbose # Enable verbose logging
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
    console.log(`${colors.yellow}⚠ REDIS_URL not set - cache updates will be skipped${colors.reset}`)
    return
  }

  try {
    new RedisService({
      isLocal: true, // Seeder always runs in local/development context
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
 * Initialize database connection
 */
async function initializeDatabase(options: SeederOptions): Promise<Sequelize> {
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

  // Create custom enum types if they don't exist
  await createEnumTypes(sequelize, options)

  // Add models to sequelize instance
  sequelize.addModels(getModels())

  // Sync models with database
  if (options.reset || options.forceSync) {
    console.log(
      `${colors.yellow}⚠ Force syncing database (dropping and recreating tables)...${colors.reset}`,
    )
    await sequelize.sync({ force: true })
  } else {
    await sequelize.sync({ alter: false })
  }

  return sequelize
}

/**
 * Create PostgreSQL enum types
 */
async function createEnumTypes(sequelize: Sequelize, options: SeederOptions): Promise<void> {
  const enumQueries = [
    // NOTE: Using lowercase for PostgreSQL convention (unquoted identifiers are lowercased)
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
  console.log(
    `  Force Sync: ${options.forceSync ? colors.yellow + 'Yes' : colors.green + 'No'}${colors.reset}`,
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
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseArgs()
  let sequelize: Sequelize | null = null

  try {
    // Initialize services (Logger and Redis) for cache operations
    console.log(`${colors.blue}Initializing services...${colors.reset}`)
    await initializeServices(options)

    console.log(`${colors.blue}Initializing database connection...${colors.reset}`)
    sequelize = await initializeDatabase(options)
    console.log(`${colors.green}✓ Database connected successfully${colors.reset}\n`)

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
