import * as fs from 'node:fs'
import * as path from 'node:path'

import { ApiLoggingClass } from '../../logger'
import { MigrationRunner } from './migration.runner'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>
const mockReaddirSync = fs.readdirSync as unknown as jest.Mock<string[]>

function createMockSequelize(overrides?: Partial<{
  queryResults: unknown[][]
}>) {
  const queryResults = overrides?.queryResults ?? [[[{ exists: true }]], [[]]]
  const mockQuery = jest.fn()
  queryResults.forEach((result) => {
    mockQuery.mockResolvedValueOnce(result)
  })
  mockQuery.mockResolvedValue([[{ exists: true }]])
  const mockTransaction = jest.fn().mockImplementation((cb: (t: unknown) => Promise<void>) => {
    return cb({})
  })

  return {
    getQueryInterface: jest.fn().mockReturnValue({
      sequelize: {
        query: mockQuery,
      },
    }),
    transaction: mockTransaction,
    constructor: {},
    _mockQuery: mockQuery,
  }
}

describe('MigrationRunner', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(MigrationRunner).toBeDefined()
  })

  describe('discoverMigrations', () => {
    it('should return empty array when path does not exist', () => {
      mockExistsSync.mockReturnValue(false)
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/nonexistent/path')

      expect(result).toEqual([])
      expect(mockReaddirSync).not.toHaveBeenCalled()
    })

    it('should return empty array when directory is empty', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([])
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/migrations')

      expect(result).toEqual([])
    })

    it('should filter out files that do not match migration pattern', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([
        'README.md',
        'invalid-name.js',
        '20251227130000-test-migration-column.js',
      ])
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/migrations')

      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe('20251227130000-test-migration-column.js')
      expect(result[0].timestamp).toBe('20251227130000')
    })

    it('should return migrations sorted by timestamp', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([
        '20260207120001-add-blog-junction-timestamps.js',
        '20260207120000-create-blog-tables.js',
        '20260125120100-add-support-request-user-timezone.js',
      ])
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/migrations')

      expect(result).toHaveLength(3)
      expect(result[0].timestamp).toBe('20260125120100')
      expect(result[1].timestamp).toBe('20260207120000')
      expect(result[2].timestamp).toBe('20260207120001')
    })

    it('should include filepath with correct path join', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue(['20251227130000-test-migration-column.js'])
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/migrations')

      expect(result[0].filepath).toBe(path.join('/migrations', '20251227130000-test-migration-column.js'))
    })

    it('should support .ts migration files', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue(['20251227130000-test-migration.ts'])
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = runner.discoverMigrations('/migrations')

      expect(result).toHaveLength(1)
      expect(result[0].filename).toBe('20251227130000-test-migration.ts')
    })
  })

  describe('executeMigration', () => {
    it('should return skipped status when dryRun is true', async () => {
      const sequelize = createMockSequelize()
      const runner = new MigrationRunner(sequelize as never)

      const result = await runner.executeMigration(
        {
          filename: '20251227130000-test.js',
          filepath: '/migrations/20251227130000-test.js',
          timestamp: '20251227130000',
        },
        'up',
        true,
      )

      expect(result.status).toBe('skipped')
      expect(result.direction).toBe('up')
      expect(result.migrationName).toBe('20251227130000-test.js')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getMigrationStatus', () => {
    it('should return applied and pending migrations', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([
        '20260125120000-add-user-timezone.js',
        '20260125120100-add-support-request-user-timezone.js',
      ])
      const sequelize = createMockSequelize({
        queryResults: [
          [[{ exists: true }]],
          [[{ name: '20260125120000-add-user-timezone.js', appliedAt: new Date() }]],
        ],
      })
      const runner = new MigrationRunner(sequelize as never)

      const status = await runner.getMigrationStatus('/migrations')

      expect(status.applied).toHaveLength(1)
      expect(status.applied[0].name).toBe('20260125120000-add-user-timezone.js')
      expect(status.pending).toHaveLength(1)
      expect(status.pending[0].filename).toBe('20260125120100-add-support-request-user-timezone.js')
    })
  })

  describe('runPendingMigrations', () => {
    it('should return empty array when no pending migrations', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue(['20260125120000-add-user-timezone.js'])
      const sequelize = createMockSequelize({
        queryResults: [
          [[{ exists: true }]],
          [[{ name: '20260125120000-add-user-timezone.js', appliedAt: new Date() }]],
        ],
      })
      const runner = new MigrationRunner(sequelize as never)

      const results = await runner.runPendingMigrations({
        direction: 'up',
        dryRun: true,
        migrationsPath: '/migrations',
      })

      expect(results).toEqual([])
    })

    it('should run pending migrations in dry run mode', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([
        '20260125120000-add-user-timezone.js',
        '20260125120100-add-support-request-user-timezone.js',
      ])
      const sequelize = createMockSequelize({
        queryResults: [
          [[{ exists: true }]],
          [[]],
        ],
      })
      const runner = new MigrationRunner(sequelize as never)

      const results = await runner.runPendingMigrations({
        direction: 'up',
        dryRun: true,
        migrationsPath: '/migrations',
      })

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.status === 'skipped')).toBe(true)
      expect(results[0].migrationName).toBe('20260125120000-add-user-timezone.js')
      expect(results[1].migrationName).toBe('20260125120100-add-support-request-user-timezone.js')
    })
  })
})
