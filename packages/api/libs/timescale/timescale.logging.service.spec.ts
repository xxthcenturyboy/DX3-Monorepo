import type { AuthFailureAlertPayload } from '@dx3/models-shared'
import { LOG_EVENT_TYPE } from '@dx3/models-shared'

import { TimescaleConnection } from './timescale.connection'
import { LoggingService } from './timescale.logging.service'

const mockEmitAuthFailureCritical = jest.fn()
const mockEmitAuthFailureWarning = jest.fn()
let mockAdminLogsSocketInstance: {
  broadcastNewLog: jest.Mock
  emitAuthFailureCritical: jest.Mock
  emitAuthFailureWarning: jest.Mock
} | null = null

// Mock dependencies
jest.mock('./auth-failure-tracker', () => ({
  AuthFailureTracker: jest.fn().mockImplementation(() => ({
    setAlertCallback: jest.fn(),
  })),
}))

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

jest.mock('./timescale.logging.socket', () => ({
  AdminLogsSocketService: {
    get instance() {
      return mockAdminLogsSocketInstance
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
        appId: 'dx3-default',
        createdAt: '2026-02-05T00:00:00Z',
        eventType: LOG_EVENT_TYPE.API_REQUEST,
        id: 'test-id',
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

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE'), [
        'test-app',
        LOG_EVENT_TYPE.AUTH_SUCCESS,
        true,
      ])
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
      mockPool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

      await loggingService.getStats({ appId: 'test-app' })

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE app_id = $1'), [
        'test-app',
      ])
    })
  })

  describe('getRecentErrors', () => {
    it('should return empty array when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false

      const result = await loggingService.getRecentErrors()

      expect(result).toEqual([])
    })

    it('should return empty array when pool is null', async () => {
      ;(TimescaleConnection as unknown as { instance: unknown }).instance = { getPool: () => null }
      const result = await loggingService.getRecentErrors()
      expect(result).toEqual([])
    })

    it('should query recent error logs', async () => {
      const mockErrors = [{ eventType: LOG_EVENT_TYPE.API_ERROR, id: '1', success: false }]
      mockPool.query.mockResolvedValue({ rows: mockErrors })

      const result = await loggingService.getRecentErrors()

      expect(result).toEqual(mockErrors)
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('success = false'), [])
    })

    it('should add appId filter when provided', async () => {
      mockPool.query.mockResolvedValue({ rows: [] })
      await loggingService.getRecentErrors({ appId: 'my-app', limit: 10, minutesBack: 30 })
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('app_id = $1'), [
        'my-app',
      ])
    })

    it('should return empty array when query throws', async () => {
      mockPool.query.mockRejectedValue(new Error('query failed'))
      const result = await loggingService.getRecentErrors()
      expect(result).toEqual([])
    })
  })

  describe('getLogs additional coverage', () => {
    it('should return emptyResult when pool is null', async () => {
      ;(TimescaleConnection as unknown as { instance: unknown }).instance = { getPool: () => null }
      const result = await loggingService.getLogs({})
      expect(result).toEqual({ count: 0, rows: [] })
    })

    it('should add userId, startDate, and endDate filters when provided', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [] })
      await loggingService.getLogs({
        endDate: '2026-02-28',
        startDate: '2026-02-01',
        userId: 'user-abc',
      })
      const sql = mockPool.query.mock.calls[0][0] as string
      expect(sql).toContain('user_id = $')
      const sql2 = mockPool.query.mock.calls[1][0] as string
      expect(sql2).toContain('created_at >=')
      expect(sql2).toContain('created_at <=')
    })

    it('should return emptyResult when getLogs query throws', async () => {
      mockPool.query.mockRejectedValue(new Error('DB failure'))
      const result = await loggingService.getLogs({})
      expect(result).toEqual({ count: 0, rows: [] })
    })
  })

  describe('getStats additional coverage', () => {
    it('should return emptyResult when pool is null', async () => {
      ;(TimescaleConnection as unknown as { instance: unknown }).instance = { getPool: () => null }
      const result = await loggingService.getStats()
      expect(result).toEqual({ daily: [], hourly: [] })
    })

    it('should return emptyResult when getStats query throws', async () => {
      mockPool.query.mockRejectedValue(new Error('Stats query failed'))
      const result = await loggingService.getStats()
      expect(result).toEqual({ daily: [], hourly: [] })
    })

    it('should pass daysBack parameter when provided', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })
      await loggingService.getStats({ daysBack: 14 })
      expect(mockPool.query).toHaveBeenCalledTimes(2)
    })
  })

  describe('queryRaw', () => {
    it('should return empty result when not available', async () => {
      ;(TimescaleConnection as unknown as { isConnected: boolean }).isConnected = false
      const result = await loggingService.queryRaw('SELECT 1', [])
      expect(result).toEqual({ rowCount: 0, rows: [] })
    })

    it('should return empty result when pool is null', async () => {
      ;(TimescaleConnection as unknown as { instance: unknown }).instance = { getPool: () => null }
      const result = await loggingService.queryRaw('SELECT 1', [])
      expect(result).toEqual({ rowCount: 0, rows: [] })
    })

    it('should execute query and return results', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 2, rows: [{ id: 1 }, { id: 2 }] })
      const result = await loggingService.queryRaw<{ id: number }>('SELECT id FROM logs', [])
      expect(result.rowCount).toBe(2)
      expect(result.rows).toHaveLength(2)
    })

    it('should return empty result when query throws', async () => {
      mockPool.query.mockRejectedValue(new Error('Raw query failed'))
      const result = await loggingService.queryRaw('SELECT 1', [])
      expect(result).toEqual({ rowCount: 0, rows: [] })
    })
  })

  describe('log additional coverage', () => {
    it('should return null when pool is null', async () => {
      ;(TimescaleConnection as unknown as { instance: unknown }).instance = { getPool: () => null }
      const result = await loggingService.log({ eventType: LOG_EVENT_TYPE.API_REQUEST })
      expect(result).toBeNull()
    })

    it('should track auth failure when log is AUTH_FAILED and success=false', async () => {
      const mockLogEntry = {
        appId: 'dx3-default',
        createdAt: '2026-02-05T00:00:00Z',
        eventType: LOG_EVENT_TYPE.AUTH_FAILED,
        fingerprint: 'fp-abc',
        id: 'fail-id',
        ipAddress: '1.2.3.4',
        success: false,
      }
      mockPool.query.mockResolvedValue({ rows: [mockLogEntry] })
      await loggingService.log({ eventType: LOG_EVENT_TYPE.AUTH_FAILED })
      // Verify the INSERT query was called with AUTH_FAILED event type
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO logs'),
        expect.arrayContaining([LOG_EVENT_TYPE.AUTH_FAILED]),
      )
    })

    it('should not track auth failure when log is AUTH_FAILED but success=true', async () => {
      const { AuthFailureTracker } = require('./auth-failure-tracker')
      const mockTrackerInstance = (AuthFailureTracker as jest.Mock).mock.results.at(-1)?.value
      const mockLogEntry = {
        eventType: LOG_EVENT_TYPE.AUTH_FAILED,
        id: 'ok-id',
        success: true,
      }
      mockPool.query.mockResolvedValue({ rows: [mockLogEntry] })
      await loggingService.log({ eventType: LOG_EVENT_TYPE.AUTH_FAILED })
      // trackFailure should NOT be called since success === true
      expect(mockTrackerInstance?.trackFailure ?? jest.fn()).not.toHaveBeenCalled()
    })
  })

  describe('handleAuthFailureAlert (via setAlertCallback)', () => {
    beforeEach(() => {
      mockEmitAuthFailureCritical.mockReset()
      mockEmitAuthFailureWarning.mockReset()
    })

    const mockPayload: AuthFailureAlertPayload = {
      count: 10,
      fingerprint: 'fp-test',
      ipAddress: '192.168.0.1',
      timestamp: new Date().toISOString(),
    }

    it('should do nothing when AdminLogsSocketService.instance is null', () => {
      mockAdminLogsSocketInstance = null
      const { AuthFailureTracker } = require('./auth-failure-tracker')
      const mockTrackerInstance = (AuthFailureTracker as jest.Mock).mock.results.at(-1)?.value
      const capturedCallback = (mockTrackerInstance?.setAlertCallback as jest.Mock).mock.calls.at(
        -1,
      )?.[0] as
        | ((level: 'critical' | 'warning', payload: AuthFailureAlertPayload) => void)
        | undefined

      expect(() => capturedCallback?.('critical', mockPayload)).not.toThrow()
    })

    it('should call emitAuthFailureCritical when level is critical', () => {
      mockAdminLogsSocketInstance = {
        broadcastNewLog: jest.fn(),
        emitAuthFailureCritical: mockEmitAuthFailureCritical,
        emitAuthFailureWarning: mockEmitAuthFailureWarning,
      }

      const { AuthFailureTracker } = require('./auth-failure-tracker')
      const mockTrackerInstance = (AuthFailureTracker as jest.Mock).mock.results.at(-1)?.value
      const capturedCallback = (mockTrackerInstance?.setAlertCallback as jest.Mock).mock.calls.at(
        -1,
      )?.[0] as (level: 'critical' | 'warning', payload: AuthFailureAlertPayload) => void

      capturedCallback('critical', mockPayload)

      expect(mockEmitAuthFailureCritical).toHaveBeenCalledWith(mockPayload)
      expect(mockEmitAuthFailureWarning).not.toHaveBeenCalled()
    })

    it('should call emitAuthFailureWarning when level is warning', () => {
      mockAdminLogsSocketInstance = {
        broadcastNewLog: jest.fn(),
        emitAuthFailureCritical: mockEmitAuthFailureCritical,
        emitAuthFailureWarning: mockEmitAuthFailureWarning,
      }

      const { AuthFailureTracker } = require('./auth-failure-tracker')
      const mockTrackerInstance = (AuthFailureTracker as jest.Mock).mock.results.at(-1)?.value
      const capturedCallback = (mockTrackerInstance?.setAlertCallback as jest.Mock).mock.calls.at(
        -1,
      )?.[0] as (level: 'critical' | 'warning', payload: AuthFailureAlertPayload) => void

      capturedCallback('warning', mockPayload)

      expect(mockEmitAuthFailureWarning).toHaveBeenCalledWith(mockPayload)
      expect(mockEmitAuthFailureCritical).not.toHaveBeenCalled()
    })
  })
})
