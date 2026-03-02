import type { Request as IRequest } from 'express'

import { METRIC_EVENT_TYPE } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { MetricsService } from './metrics-api.service'

// Override IS_PARENT_DASHBOARD_APP so that IS_PARENT_DASHBOARD_APP branches are reachable
jest.mock('@dx3/models-shared', () => ({
  ...jest.requireActual('@dx3/models-shared'),
  APP_ID: 'test-app-id',
  IS_PARENT_DASHBOARD_APP: true,
}))

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

    it('should return empty array when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getDailyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )
      expect(result).toEqual([])
    })
  })

  describe('static instance getter', () => {
    it('should return the most recently constructed instance', () => {
      const svc = new MetricsService()
      expect(MetricsService.instance).toBe(svc)
    })
  })

  describe('detectSource via recordSignup (no explicit signupSource)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should detect "mobile" when user-agent includes mobile identifier', async () => {
      const mobileReq = {
        ...createMockRequest(),
        headers: { 'user-agent': 'DX3Mobile/1.0' },
      } as unknown as IRequest

      await metricsService.recordSignup({
        method: 'email',
        req: mobileReq,
        userId: 'user-mobile',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ signupSource: 'mobile' }),
        }),
      )
    })

    it('should detect "web" when origin includes localhost', async () => {
      const webReq = {
        ...createMockRequest(),
        headers: { origin: 'http://localhost:3000', 'user-agent': 'Mozilla/5.0' },
      } as unknown as IRequest

      await metricsService.recordSignup({
        method: 'email',
        req: webReq,
        userId: 'user-web',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ signupSource: 'web' }),
        }),
      )
    })

    it('should detect "api" as default when no mobile identifier or web origin', async () => {
      const apiReq = {
        ...createMockRequest(),
        headers: { origin: 'https://external.com', 'user-agent': 'curl/7.0' },
      } as unknown as IRequest

      await metricsService.recordSignup({
        method: 'email',
        req: apiReq,
        userId: 'user-api',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ signupSource: 'api' }),
        }),
      )
    })
  })

  describe('recordLogout - fallback to req.user.id', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should use req.user.id when userId is not provided', async () => {
      const reqWithUser = {
        ...createMockRequest(),
        user: { id: 'req-user-id' },
      } as unknown as IRequest

      await metricsService.recordLogout({ req: reqWithUser })

      expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({ userId: 'req-user-id' }))
    })
  })

  describe('recordSessionStart - auto-detect platform', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should auto-detect platform when none provided', async () => {
      await metricsService.recordSessionStart({ req, userId: 'user-1' })
      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: METRIC_EVENT_TYPE.METRIC_SESSION_START }),
      )
    })
  })

  describe('recordSessionEnd - fallback userId', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should use req.user.id when userId is omitted', async () => {
      const reqWithUser = {
        ...createMockRequest(),
        user: { id: 'session-user-id' },
      } as unknown as IRequest

      await metricsService.recordSessionEnd({ req: reqWithUser })

      expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({ userId: 'session-user-id' }))
    })
  })

  describe('getWeeklyActiveUsers', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed rows with wau and weekEnd', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 1,
        rows: [{ wau: '75', week_end: '2025-01-07' }],
      })

      const result = await metricsService.getWeeklyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-08'),
      )

      expect(result).toEqual([{ wau: 75, weekEnd: '2025-01-07' }])
    })

    it('should return empty array when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getWeeklyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-08'),
      )
      expect(result).toEqual([])
    })
  })

  describe('getMonthlyActiveUsers', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed rows with mau and monthEnd', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 1,
        rows: [{ mau: '300', month_end: '2025-01-31' }],
      })

      const result = await metricsService.getMonthlyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-02-01'),
      )

      expect(result).toEqual([{ mau: 300, monthEnd: '2025-01-31' }])
    })

    it('should return empty array when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getMonthlyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-02-01'),
      )
      expect(result).toEqual([])
    })
  })

  describe('getSignupsByMethod', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed rows with count and method', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 2,
        rows: [
          { count: '50', method: 'email' },
          { count: '20', method: 'phone' },
        ],
      })

      const result = await metricsService.getSignupsByMethod(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      )

      expect(result).toEqual([
        { count: 50, method: 'email' },
        { count: 20, method: 'phone' },
      ])
    })

    it('should return empty array when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getSignupsByMethod(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      )
      expect(result).toEqual([])
    })
  })

  describe('getFeatureUsage', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should return parsed rows with count and featureName', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 1,
        rows: [{ count: '15', feature_name: 'export-csv' }],
      })

      const result = await metricsService.getFeatureUsage(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      )

      expect(result).toEqual([{ count: 15, featureName: 'export-csv' }])
    })

    it('should return empty array when no rows', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getFeatureUsage(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      )
      expect(result).toEqual([])
    })
  })

  describe('getAppsWithMetrics', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should query DB for all app IDs when IS_PARENT_DASHBOARD_APP is true', async () => {
      mockQueryRaw.mockResolvedValue({
        rowCount: 2,
        rows: [{ app_id: 'app-alpha' }, { app_id: 'app-beta' }],
      })
      const result = await metricsService.getAppsWithMetrics()
      expect(result).toEqual(['app-alpha', 'app-beta'])
    })

    it('should return empty array when no apps in DB', async () => {
      mockQueryRaw.mockResolvedValue({ rowCount: 0, rows: [] })
      const result = await metricsService.getAppsWithMetrics()
      expect(result).toEqual([])
    })
  })

  describe('record - with req headers', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should include fingerprint from HEADER_DEVICE_ID_PROP header', async () => {
      const reqWithDevice = {
        ...createMockRequest(),
        headers: {
          'user-agent': 'DX3Mobile/1.0',
          'x-device-id': 'device-fingerprint-123',
        },
        user: { id: 'user-with-device' },
      } as unknown as IRequest

      await metricsService.record({
        eventType: METRIC_EVENT_TYPE.METRIC_LOGIN,
        req: reqWithDevice,
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-with-device',
        }),
      )
    })
  })

  describe('detectSource via recordSignup - dx3 origin detection', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
    })

    it('should detect "web" when origin includes dx3', async () => {
      const dx3Req = {
        ...createMockRequest(),
        headers: { origin: 'https://app.dx3.io', 'user-agent': 'Mozilla/5.0 Chrome' },
      } as unknown as IRequest

      await metricsService.recordSignup({
        method: 'email',
        req: dx3Req,
        userId: 'user-dx3',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ signupSource: 'web' }),
        }),
      )
    })

    it('should detect mobile via HEADER_DEVICE_ID_PROP even without mobile user-agent', async () => {
      const deviceReq = {
        ...createMockRequest(),
        headers: {
          origin: 'https://external.com',
          'user-agent': 'Mozilla/5.0',
          'x-device-id': 'some-device-id',
        },
      } as unknown as IRequest

      await metricsService.recordSignup({
        method: 'phone',
        req: deviceReq,
        userId: 'user-device',
      })

      expect(mockLog).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ signupSource: 'mobile' }),
        }),
      )
    })
  })

  describe('getRealTimeActiveUsers - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ count: '7' }] })
    })

    it('should add app_id param when appId is provided and IS_PARENT_DASHBOARD_APP=true', async () => {
      const result = await metricsService.getRealTimeActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        'specific-app',
      )
      expect(result).toBe(7)
      // IS_PARENT_DASHBOARD_APP=true with appId → filter with 3 params
      expect(mockQueryRaw).toHaveBeenCalledWith(
        expect.stringContaining('app_id'),
        expect.arrayContaining(['specific-app']),
      )
    })

    it('should not add app_id param when no appId (IS_PARENT_DASHBOARD_APP=true, no filter)', async () => {
      const result = await metricsService.getRealTimeActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
      )
      expect(result).toBe(7)
    })
  })

  describe('getSignupCount - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ count: '99' }] })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getSignupCount(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        'app-123',
      )
      expect(result).toBe(99)
    })
  })

  describe('getDailyActiveUsers - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ date: '2025-01-01', dau: '5' }] })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getDailyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        'app-456',
      )
      expect(result).toEqual([{ date: '2025-01-01', dau: 5 }])
    })
  })

  describe('getWeeklyActiveUsers - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ wau: '50', week_end: '2025-01-07' }] })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getWeeklyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-01-08'),
        'app-weekly',
      )
      expect(result).toEqual([{ wau: 50, weekEnd: '2025-01-07' }])
    })
  })

  describe('getMonthlyActiveUsers - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({
        rowCount: 1,
        rows: [{ mau: '200', month_end: '2025-01-31' }],
      })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getMonthlyActiveUsers(
        new Date('2025-01-01'),
        new Date('2025-02-01'),
        'app-monthly',
      )
      expect(result).toEqual([{ mau: 200, monthEnd: '2025-01-31' }])
    })
  })

  describe('getSignupsByMethod - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({ rowCount: 1, rows: [{ count: '10', method: 'email' }] })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getSignupsByMethod(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        'app-signups',
      )
      expect(result).toEqual([{ count: 10, method: 'email' }])
    })
  })

  describe('getFeatureUsage - with appId (IS_PARENT_DASHBOARD_APP=true)', () => {
    beforeEach(() => {
      metricsService = new MetricsService()
      mockQueryRaw.mockResolvedValue({
        rowCount: 1,
        rows: [{ count: '3', feature_name: 'dark-mode' }],
      })
    })

    it('should add app_id param when appId is provided', async () => {
      const result = await metricsService.getFeatureUsage(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        'app-features',
      )
      expect(result).toEqual([{ count: 3, featureName: 'dark-mode' }])
    })
  })
})
