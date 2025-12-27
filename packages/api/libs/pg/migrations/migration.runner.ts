/**
 * Migration Runner Service
 *
 * Professional PostgreSQL migration execution service
 * Provides programmatic control over Sequelize migrations
 *
 * Features:
 * - Transaction-safe migration execution
 * - Detailed logging and error reporting
 * - Support for up/down migrations
 * - Dry-run mode for testing
 * - Migration status tracking via SequelizeMeta table
 *
 * @fileoverview Migration runner for PostgreSQL database
 * @module @dx3/api/pg/migrations/runner
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import type { QueryInterface, Sequelize } from 'sequelize'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../logger'
import type {
  MigrationDirection,
  MigrationFileInfo,
  MigrationModule,
  MigrationResult,
  MigrationRunnerConfig,
  MigrationStatus,
} from './migration.types'

/**
 * SequelizeMeta table name for tracking applied migrations
 */
const SEQUELIZE_META_TABLE = 'SequelizeMeta'

/**
 * Migration file pattern regex
 * Matches: YYYYMMDDHHMMSS-description.js or .ts
 */
const MIGRATION_FILE_PATTERN = /^(\d{14})-[\w-]+\.(js|ts)$/

/**
 * Migration log prefix for consistent formatting
 */
const LOG_PREFIX = '[Migration]'

/**
 * MigrationRunner class
 * Handles migration discovery, execution, and status tracking
 */
export class MigrationRunner {
  private logger: ApiLoggingClassType | null
  private queryInterface: QueryInterface
  private sequelize: typeof Sequelize.prototype

  constructor(sequelize: typeof Sequelize.prototype) {
    this.sequelize = sequelize
    this.queryInterface = sequelize.getQueryInterface()
    // Use ApiLoggingClass if initialized, otherwise null (will fallback to console)
    this.logger = ApiLoggingClass.instance || null
  }

  /**
   * Log info message - uses ApiLoggingClass if available, console otherwise
   */
  private logInfo(message: string, context?: object): void {
    const formattedMessage = `${LOG_PREFIX} ${message}`
    if (this.logger) {
      this.logger.logInfo(formattedMessage, context)
    } else {
      console.log(formattedMessage, context ? JSON.stringify(context) : '')
    }
  }

  /**
   * Log info message - uses ApiLoggingClass if available, console otherwise
   */
  private logData(message: string, context?: object): void {
    const formattedMessage = `${LOG_PREFIX} ${message}`
    if (this.logger) {
      this.logger.logData(formattedMessage, context)
    } else {
      console.log(formattedMessage, context ? JSON.stringify(context) : '')
    }
  }

  /**
   * Log error message - uses ApiLoggingClass if available, console otherwise
   */
  private logError(message: string, context?: object): void {
    const formattedMessage = `${LOG_PREFIX} ${message}`
    if (this.logger) {
      this.logger.logError(formattedMessage, context)
    } else {
      console.error(formattedMessage, context ? JSON.stringify(context) : '')
    }
  }

  /**
   * Log warning message - uses ApiLoggingClass if available, console otherwise
   */
  private logWarn(message: string, context?: object): void {
    const formattedMessage = `${LOG_PREFIX} ${message}`
    if (this.logger) {
      this.logger.logWarn(formattedMessage, context)
    } else {
      console.warn(formattedMessage, context ? JSON.stringify(context) : '')
    }
  }

  /**
   * Ensure SequelizeMeta table exists for tracking migrations
   */
  async ensureMetaTable(): Promise<void> {
    const tableExists = await this.queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${SEQUELIZE_META_TABLE}'
      );
    `)

    const exists = (tableExists[0] as Array<{ exists: boolean }>)[0]?.exists

    if (!exists) {
      await this.queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS "${SEQUELIZE_META_TABLE}" (
          "name" VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
          "applied_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      this.logInfo(`Created ${SEQUELIZE_META_TABLE} tracking table`)
    }
  }

  /**
   * Get list of already applied migrations
   */
  async getAppliedMigrations(): Promise<MigrationStatus[]> {
    await this.ensureMetaTable()

    const result = await this.queryInterface.sequelize.query(`
      SELECT name, applied_at as "appliedAt"
      FROM "${SEQUELIZE_META_TABLE}"
      ORDER BY name ASC;
    `)

    return (result[0] as MigrationStatus[]) || []
  }

  /**
   * Discover migration files from the migrations directory
   */
  discoverMigrations(migrationsPath: string): MigrationFileInfo[] {
    const absolutePath = path.resolve(migrationsPath)

    if (!fs.existsSync(absolutePath)) {
      this.logError(`Migrations path does not exist: ${absolutePath}`)
      return []
    }

    const files = fs.readdirSync(absolutePath)

    return files
      .filter((file) => MIGRATION_FILE_PATTERN.test(file))
      .map((filename) => {
        const match = filename.match(MIGRATION_FILE_PATTERN)
        return {
          filename,
          filepath: path.join(absolutePath, filename),
          timestamp: match?.[1] || '',
        }
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  /**
   * Record a migration as applied
   */
  async recordMigration(migrationName: string): Promise<void> {
    await this.queryInterface.sequelize.query(`
      INSERT INTO "${SEQUELIZE_META_TABLE}" (name, applied_at)
      VALUES ('${migrationName}', NOW())
      ON CONFLICT (name) DO NOTHING;
    `)
  }

  /**
   * Remove a migration record (for rollback)
   */
  async removeMigrationRecord(migrationName: string): Promise<void> {
    await this.queryInterface.sequelize.query(`
      DELETE FROM "${SEQUELIZE_META_TABLE}"
      WHERE name = '${migrationName}';
    `)
  }

  /**
   * Execute a single migration
   */
  async executeMigration(
    migrationInfo: MigrationFileInfo,
    direction: MigrationDirection,
    dryRun = false,
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const { filename, filepath } = migrationInfo

    try {
      this.logData(`${direction.toUpperCase()}: ${filename}${dryRun ? ' (DRY RUN)' : ''}`)

      if (dryRun) {
        return {
          direction,
          duration: Date.now() - startTime,
          migrationName: filename,
          status: 'skipped',
        }
      }

      // Load migration module
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration: MigrationModule = require(filepath)

      if (!migration[direction] || typeof migration[direction] !== 'function') {
        throw new Error(`Migration ${filename} does not export a valid ${direction}() function`)
      }

      // Execute migration within a transaction
      await this.sequelize.transaction(async (transaction) => {
        await migration[direction](
          this.queryInterface,
          this.sequelize.constructor as typeof Sequelize,
        )
      })

      // Update migration tracking
      if (direction === 'up') {
        await this.recordMigration(filename)
      } else {
        await this.removeMigrationRecord(filename)
      }

      const duration = Date.now() - startTime
      this.logData(`✓ ${filename} completed in ${duration}ms`)

      return {
        direction,
        duration,
        migrationName: filename,
        status: 'success',
      }
    } catch (error) {
      const duration = Date.now() - startTime
      this.logError(`✗ ${filename} failed: ${(error as Error).message}`, { error })

      return {
        direction,
        duration,
        error: error as Error,
        migrationName: filename,
        status: 'failed',
      }
    }
  }

  /**
   * Run pending migrations (up)
   */
  async runPendingMigrations(config: MigrationRunnerConfig): Promise<MigrationResult[]> {
    const { direction, dryRun = false, migrationsPath, targetMigration } = config
    const results: MigrationResult[] = []

    this.logData(`Starting ${direction} migrations${dryRun ? ' (DRY RUN)' : ''}...`)

    const allMigrations = this.discoverMigrations(migrationsPath)
    const appliedMigrations = await this.getAppliedMigrations()
    const appliedNames = new Set(appliedMigrations.map((m) => m.name))

    if (direction === 'up') {
      // Run pending migrations in order
      const pendingMigrations = allMigrations.filter((m) => !appliedNames.has(m.filename))

      if (pendingMigrations.length === 0) {
        this.logWarn('No pending migrations to run')
        return results
      }

      this.logData(`Found ${pendingMigrations.length} pending migration(s)`)

      for (const migration of pendingMigrations) {
        if (targetMigration && migration.filename !== targetMigration) {
          continue
        }

        const result = await this.executeMigration(migration, 'up', dryRun)
        results.push(result)

        if (result.status === 'failed') {
          this.logError('Stopping due to failed migration')
          break
        }

        if (targetMigration && migration.filename === targetMigration) {
          break
        }
      }
    } else {
      // Rollback migrations in reverse order
      const appliedInOrder = allMigrations.filter((m) => appliedNames.has(m.filename)).reverse()

      if (appliedInOrder.length === 0) {
        this.logData('No migrations to rollback')
        return results
      }

      const migrationsToRollback = targetMigration
        ? appliedInOrder.filter((m) => m.filename === targetMigration)
        : [appliedInOrder[0]] // Only rollback the last migration by default

      this.logData(`Rolling back ${migrationsToRollback.length} migration(s)`)

      for (const migration of migrationsToRollback) {
        const result = await this.executeMigration(migration, 'down', dryRun)
        results.push(result)

        if (result.status === 'failed') {
          this.logError('Stopping due to failed rollback')
          break
        }
      }
    }

    // Summary
    const successful = results.filter((r) => r.status === 'success').length
    const failed = results.filter((r) => r.status === 'failed').length
    const skipped = results.filter((r) => r.status === 'skipped').length

    this.logData(`Complete: ${successful} success, ${failed} failed, ${skipped} skipped`)

    return results
  }

  /**
   * Get migration status report
   */
  async getMigrationStatus(migrationsPath: string): Promise<{
    applied: MigrationStatus[]
    pending: MigrationFileInfo[]
  }> {
    const allMigrations = this.discoverMigrations(migrationsPath)
    const applied = await this.getAppliedMigrations()
    const appliedNames = new Set(applied.map((m) => m.name))

    const pending = allMigrations.filter((m) => !appliedNames.has(m.filename))

    return { applied, pending }
  }
}

export default MigrationRunner
