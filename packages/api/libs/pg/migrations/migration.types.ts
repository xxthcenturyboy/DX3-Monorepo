/**
 * Migration Type Definitions
 *
 * Provides strict type safety for PostgreSQL migrations
 * Compatible with Sequelize CLI migration format
 *
 * @fileoverview Migration type definitions for PostgreSQL
 * @module @dx3/api/pg/migrations/types
 */

import type { QueryInterface, Sequelize } from 'sequelize'

/**
 * Migration direction enumeration
 */
export type MigrationDirection = 'down' | 'up'

/**
 * Migration function signature
 * @param queryInterface - Sequelize QueryInterface for database operations
 * @param Sequelize - Sequelize constructor for data types
 * @returns Promise resolving when migration completes
 */
export type MigrationFunction = (
  queryInterface: QueryInterface,
  Sequelize: typeof Sequelize,
) => Promise<void>

/**
 * Migration module structure
 * Defines the standard format for migration files
 */
export type MigrationModule = {
  /**
   * Rollback migration - reverts changes made by up()
   */
  down: MigrationFunction
  /**
   * Forward migration - applies database changes
   */
  up: MigrationFunction
}

/**
 * Migration execution result
 */
export type MigrationResult = {
  direction: MigrationDirection
  duration: number
  error?: Error
  migrationName: string
  status: 'failed' | 'skipped' | 'success'
}

/**
 * Migration status from SequelizeMeta table
 */
export type MigrationStatus = {
  appliedAt: Date
  name: string
}

/**
 * Migration runner configuration
 */
export type MigrationRunnerConfig = {
  direction: MigrationDirection
  dryRun?: boolean
  migrationsPath: string
  targetMigration?: string
}

/**
 * Migration file metadata
 */
export type MigrationFileInfo = {
  filename: string
  filepath: string
  timestamp: string
}
