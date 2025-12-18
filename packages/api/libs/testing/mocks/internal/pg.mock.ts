/**
 * Mock for PostgresDbConnection from @dx3/api-libs/pg
 * Provides a stub database connection for unit tests
 */
import type { Sequelize } from 'sequelize-typescript'

export class PostgresDbConnection {
  static sequelize: typeof Sequelize.prototype

  public static get dbHandle(): typeof Sequelize.prototype | null {
    return PostgresDbConnection.sequelize || null
  }

  public async initialize() {
    return new Promise<void>((resolve) => {
      resolve()
    })
  }

  public async close() {
    return new Promise<void>((resolve) => {
      resolve()
    })
  }
}

/**
 * Setup function for PostgresDbConnection mocking
 * Call this in test setup to initialize the mock
 */
export const mockPostgresDbConnection = () => {
  // No-op - the class mock is sufficient
}
