import { TimescaleConnection } from './timescale.connection'

// Mock dependencies
jest.mock('pg', () => {
  const mockClient = {
    query: jest.fn().mockResolvedValue({ rows: [{ 1: 1 }] }),
    release: jest.fn(),
  }
  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rows: [] }),
  }
  return {
    Pool: jest.fn(() => mockPool),
  }
})

jest.mock('./timescale.environment', () => ({
  getTimescaleUriForEnvironment: jest.fn(),
  isTimescaleEnabled: jest.fn(),
}))

jest.mock('../logger', () => ({
  ApiLoggingClass: {
    instance: {
      logError: jest.fn(),
      logInfo: jest.fn(),
      logWarn: jest.fn(),
    },
  },
}))

import { Pool } from 'pg'

import { getTimescaleUriForEnvironment, isTimescaleEnabled } from './timescale.environment'

const mockIsTimescaleEnabled = isTimescaleEnabled as jest.MockedFunction<typeof isTimescaleEnabled>
const mockGetTimescaleUriForEnvironment = getTimescaleUriForEnvironment as jest.MockedFunction<
  typeof getTimescaleUriForEnvironment
>
const MockPool = Pool as jest.MockedClass<typeof Pool>

describe('TimescaleConnection', () => {
  let connection: TimescaleConnection

  beforeEach(async () => {
    jest.clearAllMocks()
    // Create a fresh connection instance
    connection = new TimescaleConnection()
    // Close any existing pool to allow re-initialization
    await connection.close()
  })

  describe('initialize', () => {
    it('should return false when TimescaleDB is not enabled', async () => {
      mockIsTimescaleEnabled.mockReturnValue(false)

      const result = await connection.initialize()

      expect(result).toBe(false)
      expect(MockPool).not.toHaveBeenCalled()
    })

    it('should return false when URI is not configured', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue(null)

      const result = await connection.initialize()

      expect(result).toBe(false)
      expect(MockPool).not.toHaveBeenCalled()
    })

    it('should initialize pool when enabled and configured', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      const result = await connection.initialize()

      expect(result).toBe(true)
      expect(MockPool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: 'postgresql://user:pass@localhost:5434/db',
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: 10,
        }),
      )
    })

    it('should use custom config when provided', async () => {
      // Clear any previous initialization state
      MockPool.mockClear()

      // Close existing pool to allow re-initialization
      await connection.close()

      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      await connection.initialize({
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 60000,
        max: 20,
      })

      expect(MockPool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 60000,
          max: 20,
        }),
      )
    })
  })

  describe('isConnected', () => {
    it('should return true after successful initialization', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      await connection.initialize()

      expect(TimescaleConnection.isConnected).toBe(true)
    })
  })

  describe('getPool', () => {
    it('should return pool after initialization', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      await connection.initialize()

      const pool = connection.getPool()
      expect(pool).toBeDefined()
    })

    it('should return null when pool is not initialized', () => {
      const pool = connection.getPool()
      expect(pool).toBeNull()
    })
  })

  describe('instance getter', () => {
    it('should return the current instance after construction', () => {
      const instance = TimescaleConnection.instance
      expect(instance).toBe(connection)
    })
  })

  describe('initialize re-entry', () => {
    it('should return true immediately when already initialized', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      await connection.initialize()
      const result = await connection.initialize()

      expect(result).toBe(true)
    })

    it('should return false and log error when pool.connect() throws', async () => {
      const { ApiLoggingClass } = require('../logger')
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      const mockBrokenPool = {
        connect: jest.fn().mockRejectedValue(new Error('Connection refused')),
        end: jest.fn().mockResolvedValue(undefined),
      }
      MockPool.mockImplementationOnce(() => mockBrokenPool as never)

      const result = await connection.initialize()

      expect(result).toBe(false)
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize'),
        expect.any(Object),
      )
    })
  })

  describe('getClient', () => {
    it('should return null when pool is not initialized', async () => {
      const client = await connection.getClient()
      expect(client).toBeNull()
    })

    it('should return a client when pool is initialized', async () => {
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')
      await connection.initialize()

      const client = await connection.getClient()
      expect(client).toBeDefined()
    })

    it('should return null and log error when pool.connect() throws in getClient', async () => {
      const { ApiLoggingClass } = require('../logger')
      mockIsTimescaleEnabled.mockReturnValue(true)
      mockGetTimescaleUriForEnvironment.mockReturnValue('postgresql://user:pass@localhost:5434/db')

      // First initialize with a working pool
      await connection.initialize()

      // Now make the pool's connect throw
      const pool = connection.getPool()
      expect(pool).not.toBeNull()
      if (!pool) throw new Error('Pool should be initialized at this point')
      jest.spyOn(pool, 'connect').mockRejectedValueOnce(new Error('Client error'))

      const client = await connection.getClient()
      expect(client).toBeNull()
      expect(ApiLoggingClass.instance.logError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to get TimescaleDB client'),
        expect.any(Object),
      )
    })
  })
})
