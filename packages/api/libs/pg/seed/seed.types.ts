/**
 * Database Seeder Type Definitions
 * Provides type safety for the seeding infrastructure
 */

export interface SeederOptions {
  /** If true, will drop and recreate the database before seeding */
  reset: boolean
  /** If true, will force sync models (drop tables and recreate) */
  forceSync: boolean
  /** Enable verbose logging */
  verbose: boolean
}

export interface SeederResult {
  /** Name of the seeder that ran */
  name: string
  /** Number of records created */
  count: number
  /** Whether the seeder completed successfully */
  success: boolean
  /** Error message if the seeder failed */
  error?: string
  /** Time taken to run the seeder in milliseconds */
  duration: number
}

export interface SeederContext {
  /** Options passed to the seeder */
  options: SeederOptions
  /** Results from previously run seeders */
  previousResults: SeederResult[]
}

export interface Seeder {
  /** Name of the seeder */
  name: string
  /** Order in which to run (lower numbers run first) */
  order: number
  /** Function to run the seeder */
  run: (context: SeederContext) => Promise<number>
}

export interface SeedSummary {
  /** Total time taken to run all seeders */
  totalDuration: number
  /** Number of seeders that ran successfully */
  successCount: number
  /** Number of seeders that failed */
  failureCount: number
  /** Total records created across all seeders */
  totalRecords: number
  /** Individual seeder results */
  results: SeederResult[]
}
