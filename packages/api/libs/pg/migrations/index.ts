/**
 * Migration Module Index
 *
 * Exports migration runner and type definitions for programmatic usage
 *
 * @fileoverview Migration module exports
 * @module @dx3/api/pg/migrations
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Resolve the absolute path to migration scripts directory
 * Handles both development (source) and production (compiled) environments
 *
 * Priority:
 * 1. ROOT_DIR env var (container): /app/packages/api/libs/pg/migrations/scripts
 * 2. Traverse up from __dirname to find the scripts folder
 */
function resolveMigrationsPath(): string {
  // Container environment: use ROOT_DIR
  if (process.env.ROOT_DIR) {
    const containerPath = path.join(process.env.ROOT_DIR, 'packages/api/libs/pg/migrations/scripts')
    if (fs.existsSync(containerPath)) {
      return containerPath
    }
  }

  // Development: __dirname is in the source migrations folder
  const sourcePath = path.join(__dirname, 'scripts')
  if (fs.existsSync(sourcePath)) {
    return sourcePath
  }

  // Fallback: traverse up to find packages/api/libs/pg/migrations/scripts
  let currentDir = __dirname
  for (let i = 0; i < 10; i++) {
    const candidatePath = path.join(currentDir, 'packages/api/libs/pg/migrations/scripts')
    if (fs.existsSync(candidatePath)) {
      return candidatePath
    }
    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) break
    currentDir = parentDir
  }

  // Last resort: return __dirname/scripts and let the runner handle the error
  return path.join(__dirname, 'scripts')
}

/**
 * Absolute path to the migrations scripts directory
 * Use this when calling MigrationRunner methods to ensure correct path resolution
 */
export const MIGRATIONS_PATH = resolveMigrationsPath()

export { MigrationRunner } from './migration.runner'
export type {
  MigrationDirection,
  MigrationFileInfo,
  MigrationFunction,
  MigrationModule,
  MigrationResult,
  MigrationRunnerConfig,
  MigrationStatus,
} from './migration.types'
