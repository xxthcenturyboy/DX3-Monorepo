#!/usr/bin/env node
/**
 * Migration CLI Script
 *
 * Command-line interface for running PostgreSQL migrations
 * Provides up, down, status, and create commands
 *
 * Usage:
 *   pnpm db:migrate           - Run all pending migrations
 *   pnpm db:migrate:down      - Rollback last migration
 *   pnpm db:migrate:status    - Show migration status
 *   pnpm db:migrate:create    - Create new migration file
 *
 * @fileoverview Migration CLI for PostgreSQL database
 * @module @dx3/api/pg/migrations/cli
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { Sequelize } from 'sequelize'

import { isRunningInContainer } from '../../config/config-api.service'
import { getPostgresUriForEnvironment } from '../postgres.environment'
import { MIGRATIONS_PATH } from './index'
import { MigrationRunner } from './migration.runner'

// Load environment variables
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

/**
 * Parse command line arguments
 */
function parseArgs(): { command: string; name?: string; dryRun: boolean } {
  const args = process.argv.slice(2)
  const command = args[0] || 'up'
  const dryRun = args.includes('--dry-run') || args.includes('-d')

  // Get migration name for create command
  const nameIndex = args.findIndex((arg) => arg === '--name' || arg === '-n')
  const name = nameIndex !== -1 ? args[nameIndex + 1] : undefined

  return { command, dryRun, name }
}

/**
 * Parse PostgreSQL connection URL
 */
function parsePostgresUrl(url: string): {
  database: string
  host: string
  password: string
  port: number
  username: string
} | null {
  if (!url) {
    return null
  }

  try {
    const parsed = new URL(url)
    return {
      database: parsed.pathname.slice(1),
      host: parsed.hostname,
      password: decodeURIComponent(parsed.password || ''),
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
    }
  } catch (error) {
    console.error('Failed to parse POSTGRES_URI:', (error as Error).message)
    return null
  }
}

/**
 * Create a new Sequelize instance for migrations
 */
function createSequelizeInstance(): typeof Sequelize.prototype {
  const inContainer = isRunningInContainer()
  console.log(`[Migration] Detected ${inContainer ? 'container' : 'host'} environment`)

  // Get the Postgres URI, swapping hostname to localhost when on host
  const postgresUri = getPostgresUriForEnvironment()
  const config = parsePostgresUrl(postgresUri)

  if (!config) {
    throw new Error('Invalid POSTGRES_URI environment variable')
  }

  console.log(`[Migration] Connecting to: ${config.host}:${config.port}/${config.database}`)

  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'local' ||
    !process.env.NODE_ENV

  return new Sequelize({
    database: config.database,
    dialect: 'postgres',
    dialectOptions: {
      ssl: isDev ? false : { rejectUnauthorized: true, require: true },
    },
    host: config.host,
    logging: false,
    password: config.password,
    port: config.port,
    username: config.username,
  })
}

/**
 * Generate migration filename with timestamp
 */
function generateMigrationFilename(name: string): string {
  const now = new Date()
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  // Sanitize name: lowercase, replace spaces with hyphens
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${timestamp}-${sanitizedName}.js`
}

/**
 * Create a new migration file in the scripts subdirectory
 */
function createMigrationFile(name: string): void {
  const filename = generateMigrationFilename(name)
  const scriptsPath = MIGRATIONS_PATH
  const filepath = path.join(scriptsPath, filename)

  // Ensure scripts directory exists
  if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true })
  }

  const template = `'use strict'

/**
 * Migration: ${name}
 *
 * @description Add description of what this migration does
 * @created ${new Date().toISOString()}
 */

module.exports = {
  /**
   * Rollback migration
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    // Implement rollback logic here
    // Example: await queryInterface.removeColumn('table_name', 'column_name')
    throw new Error('down() not implemented for ${filename}')
  },

  /**
   * Apply migration
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    // Implement migration logic here
    // Example: await queryInterface.addColumn('table_name', 'column_name', { type: Sequelize.DataTypes.STRING })
  },
}
`

  fs.writeFileSync(filepath, template, 'utf-8')
  console.log(`[Migration] Created: ${filename}`)
  console.log(`[Migration] Path: ${filepath}`)
}

/**
 * Main CLI execution
 */
async function main(): Promise<void> {
  const { command, dryRun, name } = parseArgs()
  const migrationsPath = MIGRATIONS_PATH

  console.log('[Migration] DX3 PostgreSQL Migration CLI')
  console.log('[Migration] ================================')
  console.log(`[Migration] Scripts path: ${migrationsPath}`)

  // Handle create command separately (no DB connection needed)
  if (command === 'create') {
    if (!name) {
      console.error('[Migration] Error: Migration name required')
      console.error('[Migration] Usage: pnpm db:migrate:create --name "migration-name"')
      process.exit(1)
    }
    createMigrationFile(name)
    process.exit(0)
  }

  // Initialize Sequelize connection
  let sequelize: typeof Sequelize.prototype | null = null

  try {
    console.log('[Migration] Connecting to database...')
    sequelize = createSequelizeInstance()
    await sequelize.authenticate()
    console.log('[Migration] Database connection established')

    const runner = new MigrationRunner(sequelize)

    switch (command) {
      case 'up': {
        await runner.runPendingMigrations({
          direction: 'up',
          dryRun,
          migrationsPath,
        })
        break
      }

      case 'down': {
        await runner.runPendingMigrations({
          direction: 'down',
          dryRun,
          migrationsPath,
        })
        break
      }

      case 'status': {
        const status = await runner.getMigrationStatus(migrationsPath)

        console.log('\n[Migration] Applied migrations:')
        if (status.applied.length === 0) {
          console.log('  (none)')
        } else {
          for (const migration of status.applied) {
            console.log(`  ✓ ${migration.name} (${new Date(migration.appliedAt).toLocaleString()})`)
          }
        }

        console.log('\n[Migration] Pending migrations:')
        if (status.pending.length === 0) {
          console.log('  (none)')
        } else {
          for (const migration of status.pending) {
            console.log(`  ○ ${migration.filename}`)
          }
        }
        break
      }

      case 'redo': {
        console.log('[Migration] Redoing last migration (down then up)...')
        await runner.runPendingMigrations({
          direction: 'down',
          dryRun,
          migrationsPath,
        })
        await runner.runPendingMigrations({
          direction: 'up',
          dryRun,
          migrationsPath,
        })
        break
      }

      default:
        console.error(`[Migration] Unknown command: ${command}`)
        console.log('[Migration] Available commands: up, down, status, create, redo')
        process.exit(1)
    }
  } catch (error) {
    console.error('[Migration] Error:', (error as Error).message)
    process.exit(1)
  } finally {
    if (sequelize) {
      await sequelize.close()
      console.log('[Migration] Database connection closed')
    }
  }
}

// Execute CLI
main()
