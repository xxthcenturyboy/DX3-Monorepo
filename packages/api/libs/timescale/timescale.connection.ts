import { Pool, type PoolClient } from 'pg'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { getTimescaleUriForEnvironment, isTimescaleEnabled } from './timescale.environment'

export type TimescaleConnectionConfigType = {
  connectionTimeoutMillis?: number
  idleTimeoutMillis?: number
  max?: number
}

/**
 * TimescaleDB connection pool manager.
 * Provides a singleton connection pool for the centralized logging database.
 *
 * Features:
 * - Lazy initialization (connects only when first used)
 * - Graceful degradation (returns null if not configured)
 * - Connection pooling for efficient resource usage
 */
export class TimescaleConnection {
  static #instance: TimescaleConnectionType | null = null
  static #pool: Pool | null = null
  static #isConnected = false

  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
    TimescaleConnection.#instance = this
  }

  public static get instance(): TimescaleConnectionType | null {
    return TimescaleConnection.#instance
  }

  public static get isConnected(): boolean {
    return TimescaleConnection.#isConnected
  }

  /**
   * Initialize the TimescaleDB connection pool.
   * Safe to call multiple times - will only initialize once.
   *
   * @param config Optional pool configuration
   * @returns true if pool was initialized, false if TimescaleDB is not enabled
   */
  public async initialize(config?: TimescaleConnectionConfigType): Promise<boolean> {
    // Already initialized
    if (TimescaleConnection.#pool && TimescaleConnection.#isConnected) {
      return true
    }

    // Check if TimescaleDB is enabled
    if (!isTimescaleEnabled()) {
      this.logger.logInfo('TimescaleDB logging is disabled (TIMESCALE_ENABLED !== "true")')
      return false
    }

    const connectionString = getTimescaleUriForEnvironment()
    if (!connectionString) {
      this.logger.logWarn('TimescaleDB URI not configured - centralized logging disabled')
      return false
    }

    try {
      TimescaleConnection.#pool = new Pool({
        connectionString,
        connectionTimeoutMillis: config?.connectionTimeoutMillis ?? 5000,
        idleTimeoutMillis: config?.idleTimeoutMillis ?? 30000,
        max: config?.max ?? 10,
      })

      // Test the connection
      const client = await TimescaleConnection.#pool.connect()
      await client.query('SELECT 1')
      client.release()

      TimescaleConnection.#isConnected = true
      this.logger.logInfo('TimescaleDB connection pool initialized successfully')
      return true
    } catch (error) {
      this.logger.logError('Failed to initialize TimescaleDB connection', {
        error: (error as Error).message,
      })
      TimescaleConnection.#pool = null
      TimescaleConnection.#isConnected = false
      return false
    }
  }

  /**
   * Get a client from the connection pool.
   * Returns null if pool is not initialized or connection failed.
   */
  public async getClient(): Promise<PoolClient | null> {
    if (!TimescaleConnection.#pool) {
      return null
    }

    try {
      return await TimescaleConnection.#pool.connect()
    } catch (error) {
      this.logger.logError('Failed to get TimescaleDB client', {
        error: (error as Error).message,
      })
      return null
    }
  }

  /**
   * Get the raw pool for direct queries.
   * Returns null if pool is not initialized.
   */
  public getPool(): Pool | null {
    return TimescaleConnection.#pool
  }

  /**
   * Gracefully close the connection pool.
   */
  public async close(): Promise<void> {
    if (TimescaleConnection.#pool) {
      await TimescaleConnection.#pool.end()
      TimescaleConnection.#pool = null
      TimescaleConnection.#isConnected = false
      this.logger.logInfo('TimescaleDB connection pool closed')
    }
  }
}

export type TimescaleConnectionType = typeof TimescaleConnection.prototype
