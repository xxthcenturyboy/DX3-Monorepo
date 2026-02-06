import { LOG_EVENT_TYPE } from '@dx3/models-shared'

import { LoggingService } from './timescale.logging.service'
import { TimescaleConnection } from './timescale.connection'

// Mock dependencies
jest.mock('./timescale.connection', () => ({
  TimescaleConnection: {
    instance: null,
    isConnected: false,
  },
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

describe('LoggingService', () => {
  let loggingService: LoggingService
  let mockPool: {
    query: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockPool = {
      query: jest.fn(),
    }

    // Reset mocks
    ;(TimescaleConnection as unknown as { instance: unknown }).instance = {
      getPool: () => mockPool,
    }
    ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = true

    loggingService = new LoggingService()
  })

  describe('isAvailable', () => {
    it('should return true when TimescaleDB is connected', () => {
      expect(loggingService.isAvailable()).toBe(true)
    })

    it('should return false when TimescaleDB is not connected', () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false
      expect(loggingService.isAvailable()).toBe(false)
    })
  })

  describe('log', () => {
    it('should return null when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false

      const result = await loggingService.log({
        eventType: LOG_EVENT_TYPE.API_REQUEST,
      })

      expect(result).toBeNull()
      expect(mockPool.query).not.toHaveBeenCalled()
    })

    it('should insert log and return entry', async () => {
      const mockLogEntry = {
        id: 'test-id',
        appId: 'dx3-default',
        createdAt: '2026-02-05T00:00:00Z',
        eventType: LOG_EVENT_TYPE.API_REQUEST,
        success: true,
      }

      mockPool.query.mockResolvedValue({ rows: [mockLogEntry] })

      const result = await loggingService.log({
        eventType: LOG_EVENT_TYPE.API_REQUEST,
        message: 'Test request',
        requestMethod: 'GET',
        requestPath: '/api/test',
      })

      expect(result).toEqual(mockLogEntry)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO logs'),
        expect.arrayContaining([
          expect.any(String), // appId
          null, // durationMs
          null, // eventSubtype
          LOG_EVENT_TYPE.API_REQUEST,
        ]),
      )
    })

    it('should gracefully handle errors', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'))

      const result = await loggingService.log({
        eventType: LOG_EVENT_TYPE.API_ERROR,
      })

      expect(result).toBeNull()
    })
  })

  describe('getLogs', () => {
    it('should return empty result when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false

      const result = await loggingService.getLogs({})

      expect(result).toEqual({ count: 0, rows: [] })
    })

    it('should query logs with default parameters', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // Count query
        .mockResolvedValueOnce({ rows: [{ id: '1' }, { id: '2' }] }) // Rows query

      const result = await loggingService.getLogs({})

      expect(result.count).toBe(10)
      expect(result.rows).toHaveLength(2)
    })

    it('should apply filters', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [] })

      await loggingService.getLogs({
        appId: 'test-app',
        eventType: LOG_EVENT_TYPE.AUTH_SUCCESS,
        success: true,
      })

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        ['test-app', LOG_EVENT_TYPE.AUTH_SUCCESS, true],
      )
    })

    it('should validate orderBy to prevent SQL injection', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })

      await loggingService.getLogs({
        orderBy: 'DROP TABLE logs; --',
      })

      // Should default to created_at, not use the malicious input
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        [],
      )
    })

    it('should enforce max limit', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })

      await loggingService.getLogs({
        limit: 10000, // Over MAX_LOG_LIMIT (1000)
      })

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT 1000'), [])
    })
  })

  describe('getStats', () => {
    it('should return empty result when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false

      const result = await loggingService.getStats()

      expect(result).toEqual({ daily: [], hourly: [] })
    })

    it('should query hourly and daily aggregates', async () => {
      const mockHourly = [{ bucket: '2026-02-05T10:00:00Z', totalCount: 100 }]
      const mockDaily = [{ bucket: '2026-02-05T00:00:00Z', totalCount: 1000 }]

      mockPool.query
        .mockResolvedValueOnce({ rows: mockHourly })
        .mockResolvedValueOnce({ rows: mockDaily })

      const result = await loggingService.getStats()

      expect(result.hourly).toEqual(mockHourly)
      expect(result.daily).toEqual(mockDaily)
    })

    it('should filter by appId when provided', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })

      await loggingService.getStats({ appId: 'test-app' })

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE app_id = $1'),
        ['test-app'],
      )
    })
  })

  describe('getRecentErrors', () => {
    it('should return empty array when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false

      const result = await loggingService.getRecentErrors()

      expect(result).toEqual([])
    })

    it('should query recent error logs', async () => {
      const mockErrors = [
        { id: '1', success: false, eventType: LOG_EVENT_TYPE.API_ERROR },
      ]
      mockPool.query.mockResolvedValue({ rows: mockErrors })

      const result = await loggingService.getRecentErrors()

      expect(result).toEqual(mockErrors)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('success = false'),
        [],
      )
    })
  })
})
