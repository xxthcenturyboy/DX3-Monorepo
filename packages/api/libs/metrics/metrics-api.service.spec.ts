import type { Request as IRequest } from 'express'

import { METRIC_EVENT_TYPE } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { MetricsService } from './metrics-api.service'

const mockLog = jest.fn()
const mockQueryRaw = jest.fn()
const mockIsAvailable = jest.fn()

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('../timescale/timescale.logging.service', () => ({
  LoggingService: {
    get instance() {
      return {
        isAvailable: mockIsAvailable,
        log: mockLog,
        queryRaw: mockQueryRaw,
      }
    },
  },
}))

function createMockRequest(): IRequest {
  return {
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    path: '/test',
    user: undefined,
  } as unknown as IRequest
}

describe('MetricsService', () => {
  let metricsService: MetricsService
  let req: IRequest

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    req = createMockRequest()
    mockIsAvailable.mockReturnValue(true)
    mockLog.mockResolvedValue(null)
    mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(MetricsService).toBeDefined()
  })

  it('should create instance when constructed', () => {
    metricsService = new MetricsService()
    expect(metricsService).toBeDefined()
  })

  describe('isAvailable', () => {
    it('should return true when LoggingService is available', () => {
      mockIsAvailable.mockReturnValue(true)
      metricsService = new MetricsService()
      expect(metricsService.isAvailable()).toBe(true)
    })

    it('should return false when LoggingService is not available', () => {
      mockIsAvailable.mockReturnValue(false)
      metricsService = new MetricsService()
      expect(metricsService.isAvailable()).toBe(false)
    })

  })

  describe('record', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call loggingService.log when available', async () => {
      await metricsService.record({
        eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
        userId: 'user-1',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
          success: true,
          userId: 'user-1',
        }),
      )
    })

    it('should not call log when LoggingService is null', async () => {
      mockIsAvailable.mockReturnValue(false)
      const svc = new MetricsService()
      ;(svc as unknown as { loggingService: null }).loggingService = null

      await svc.record({
        eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
        userId: 'user-1',
      })

      expect(mockLog).not.toHaveBeenCalled()
    })
  })

  describe('recordSignup', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_SIGNUP and correct metadata', async () => {
      await metricsService.recordSignup({
        method: 'email',
        referrerUserId: 'ref-1',
        req,
        signupSource: 'web',
        userId: 'user-1',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
          ipAddress: '127.0.0.1',
          metadata: expect.objectContaining({
            hasReferrer: true,
            method: 'email',
            referrerUserId: 'ref-1',
            signupSource: 'web',
          }),
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
          userId: 'user-1',
        }),
      )
    })
  })

  describe('recordLogin', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_LOGIN and method metadata', async () => {
      await metricsService.recordLogin({
        method: 'phone',
        req,
        userId: 'user-1',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_LOGIN,
          ipAddress: '127.0.0.1',
          metadata: { method: 'phone' },
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
          userId: 'user-1',
        }),
      )
    })
  })

  describe('recordLogout', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_LOGOUT', async () => {
      await metricsService.recordLogout({ req, userId: 'user-1' })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_LOGOUT,
          ipAddress: '127.0.0.1',
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
          userId: 'user-1',
        }),
      )
    })
  })

  describe('recordFeatureUsage', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_FEATURE_USED and featureName', async () => {
      await metricsService.recordFeatureUsage({
        context: { page: 'dashboard' },
        featureName: 'export-csv',
        req,
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventSubtype: 'export-csv',
          eventType: METRIC_EVENT_TYPE.METRIC_FEATURE_USED,
          ipAddress: '127.0.0.1',
          metadata: { context: { page: 'dashboard' }, featureName: 'export-csv' },
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
        }),
      )
    })
  })

  describe('recordSessionStart', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_SESSION_START', async () => {
      await metricsService.recordSessionStart({
        platform: 'mobile',
        req,
        userId: 'user-1',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_SESSION_START,
          ipAddress: '127.0.0.1',
          metadata: { platform: 'mobile' },
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
          userId: 'user-1',
        }),
      )
    })
  })

  describe('recordSessionEnd', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should call record with METRIC_SESSION_END and metadata', async () => {
      await metricsService.recordSessionEnd({
        pagesViewed: 5,
        platform: 'web',
        reason: 'timeout',
        req,
        sessionDurationMs: 30000,
        userId: 'user-1',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: METRIC_EVENT_TYPE.METRIC_SESSION_END,
          ipAddress: '127.0.0.1',
          metadata: {
            pagesViewed: 5,
            platform: 'web',
            reason: 'timeout',
            sessionDurationMs: 30000,
          },
          requestMethod: 'GET',
          requestPath: '/test',
          success: true,
          userId: 'user-1',
        }),
      )
    })
  })

  describe('queryRaw', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should delegate to loggingService.queryRaw', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 2, rows: [{ id: 1 }, { id: 2 }] })

      const result = await metricsService.queryRaw<{ id: number }>('SELECT 1', [])

      expect(mockQueryRaw).toHaveBeenCalledWith('SELECT 1', [])
      expect(result).toEqual({ rowCount: 2, rows: [{ id: 1 }, { id: 2 }] })
    })

    it('should return empty result when LoggingService is null', async () => {
      mockIsAvailable.mockReturnValue(false)
      const svc = new MetricsService()
      ;(svc as unknown as { loggingService: null }).loggingService = null

      const result = await svc.queryRaw('SELECT 1', [])

      expect(result).toEqual({ rowCount: 0, rows: [] })
    })
  })

  describe('getRealTimeActiveUsers', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed count from query result', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ count: '42' }] })

      const result = await metricsService.getRealTimeActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )

      expect(result).toBe(42)
    })

    it('should return 0 when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })

      const result = await metricsService.getRealTimeActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )

      expect(result).toBe(0)
    })
  })

  describe('getSignupCount', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed count from query result', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ count: '100' }] })

      const result = await metricsService.getSignupCount(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )

      expect(result).toBe(100)
    })
  })

  describe('getDailyActiveUsers', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed rows with date and dau', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 2,
        rows: [
          { date: '2025-01-01', dau: '10' },
          { date: '2025-01-02', dau: '15' },
        ],
      })

      const result = await metricsService.getDailyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )

      expect(result).toEqual([
        { date: '2025-01-01', dau: 10 },
        { date: '2025-01-02', dau: 15 },
      ])
    })
  })
})
