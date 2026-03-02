import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { PostgresDbConnection } from '@dx3/api-libs/pg'
import { MigrationRunner } from '@dx3/api-libs/pg/migrations'

import { DxPostgresDb } from './dx-postgres.db'

jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

// Provide the mock PostgresDbConnection class with a static dbHandle property.
// The factory uses jest.fn() inline (no external variable) to avoid hoisting errors.
jest.mock('@dx3/api-libs/pg', () => {
  const MockPostgresDbConnection = jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
  }))
  // Static property accessed as PostgresDbConnection.dbHandle in the source.
  // Cast required because jest.fn() has no knowledge of the real class shape.
  ;(MockPostgresDbConnection as unknown as Record<string, unknown>).dbHandle = { models: {} }
  return { PostgresDbConnection: MockPostgresDbConnection }
})

jest.mock('@dx3/api-libs/pg/migrations', () => ({
  MIGRATIONS_PATH: '/mock/migrations',
  MigrationRunner: jest.fn().mockImplementation(() => ({
    getMigrationStatus: jest.fn().mockResolvedValue({ pending: [] }),
    runPendingMigrations: jest.fn().mockResolvedValue(undefined),
  })),
}))

// Mock models helpers to prevent loading real Sequelize models during unit tests
jest.mock('./dx-postgres.models', () => ({
  getPostgresModels: jest.fn().mockReturnValue([]),
  logLoadedPostgresModels: jest.fn(),
}))

describe('DxPostgresDb', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange / act / assert
    expect(DxPostgresDb).toBeDefined()
  })

  it('should have a public static method of getPostgresConnection', () => {
    // arrange / act / assert
    expect(DxPostgresDb.getPostgresConnection).toBeDefined()
  })

  describe('getPostgresConnection', () => {
    it('should initialize postgres, check migration status, and return the sequelize handle when no migrations are pending', async () => {
      // act
      const result = await DxPostgresDb.getPostgresConnection()
      // assert
      expect(PostgresDbConnection).toHaveBeenCalledTimes(1)
      expect(MigrationRunner).toHaveBeenCalledTimes(1)
      const runnerInstance = jest.mocked(MigrationRunner).mock.results.at(-1)?.value as {
        getMigrationStatus: jest.Mock
        runPendingMigrations: jest.Mock
      }
      expect(runnerInstance.getMigrationStatus).toHaveBeenCalledTimes(1)
      expect(runnerInstance.runPendingMigrations).not.toHaveBeenCalled()
      // returns PostgresDbConnection.dbHandle (our mock object)
      expect(result).toBeDefined()
    })

    it('should run pending migrations when getMigrationStatus reports outstanding entries', async () => {
      // arrange — override the MigrationRunner factory for this call only.
      // Cast to unknown first to bypass the strict MigrationRunner return type check.
      jest.mocked(MigrationRunner).mockImplementationOnce(
        () =>
          ({
            getMigrationStatus: jest.fn().mockResolvedValue({ pending: ['001-create-users.js'] }),
            runPendingMigrations: jest.fn().mockResolvedValue(undefined),
          }) as unknown as MigrationRunner,
      )
      // act
      await DxPostgresDb.getPostgresConnection()
      // assert — the last constructed MigrationRunner instance ran migrations
      const runnerInstance = jest.mocked(MigrationRunner).mock.results.at(-1)?.value as {
        runPendingMigrations: jest.Mock
      }
      expect(runnerInstance.runPendingMigrations).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 'up' }),
      )
    })

    it('should return null and log the error when the database connection throws', async () => {
      // arrange — override the PostgresDbConnection constructor to throw on initialize.
      // Cast to unknown first to bypass the strict PostgresDbConnection return type check.
      jest.mocked(PostgresDbConnection).mockImplementationOnce(
        () =>
          ({
            initialize: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
          }) as unknown as PostgresDbConnection,
      )
      // act
      const result = await DxPostgresDb.getPostgresConnection()
      // assert
      expect(result).toBeNull()
    })
  })
})
