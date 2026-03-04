import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import {
  sendBadRequest,
  sendOK,
  sendServiceUnavailable,
} from '@dx3/api-libs/http-response/http-responses'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'

import { MetricsController } from './metrics-api.controller'

jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
  sendServiceUnavailable: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

const mockMetricsService = {
  getDailyActiveUsers: jest.fn(),
  getFeatureUsage: jest.fn(),
  getMonthlyActiveUsers: jest.fn(),
  getRealTimeActiveUsers: jest.fn(),
  getSignupCount: jest.fn(),
  getSignupsByMethod: jest.fn(),
  getWeeklyActiveUsers: jest.fn(),
  isAvailable: jest.fn(),
}

jest.mock('@dx3/api-libs/metrics/metrics-api.service', () => ({
  MetricsService: {
    instance: null,
  },
}))

describe('MetricsController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.query = {}
    // Restore instance with available service by default
    ;(MetricsService as unknown as { instance: typeof mockMetricsService }).instance =
      mockMetricsService
    mockMetricsService.isAvailable.mockReturnValue(true)
  })

  it('should exist when imported', () => {
    expect(MetricsController).toBeDefined()
  })

  // ─── getStatus ─────────────────────────────────────────────────────────────

  describe('getStatus', () => {
    it('should return available status when metrics service is available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(true)
      // act
      await MetricsController.getStatus(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, {
        isAvailable: true,
        message: 'Metrics service is available',
      })
    })

    it('should return unavailable status when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getStatus(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, {
        isAvailable: false,
        message: 'Metrics service is not configured or unavailable',
      })
    })

    it('should return isAvailable false when instance is null', async () => {
      // arrange
      ;(MetricsService as unknown as { instance: null }).instance = null
      // act
      await MetricsController.getStatus(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, {
        isAvailable: false,
        message: 'Metrics service is not configured or unavailable',
      })
    })
  })

  // ─── getDailyActiveUsers ───────────────────────────────────────────────────

  describe('getDailyActiveUsers', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = [{ count: 5, date: '2026-01-01' }]
      mockMetricsService.getDailyActiveUsers.mockResolvedValueOnce(mockResult)
      req.query = { range: '7d' }
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockMetricsService.getDailyActiveUsers.mockRejectedValueOnce(new Error('Query failed'))
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })

    it('should pass appId query param to service', async () => {
      // arrange
      mockMetricsService.getDailyActiveUsers.mockResolvedValueOnce([])
      req.query = { appId: 'my-app', range: '30d' }
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      expect(mockMetricsService.getDailyActiveUsers).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        'my-app',
      )
    })
  })

  // ─── getWeeklyActiveUsers ──────────────────────────────────────────────────

  describe('getWeeklyActiveUsers', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getWeeklyActiveUsers(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = [{ count: 42, week: '2026-W01' }]
      mockMetricsService.getWeeklyActiveUsers.mockResolvedValueOnce(mockResult)
      // act
      await MetricsController.getWeeklyActiveUsers(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockMetricsService.getWeeklyActiveUsers.mockRejectedValueOnce(new Error('Query failed'))
      // act
      await MetricsController.getWeeklyActiveUsers(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getMonthlyActiveUsers ─────────────────────────────────────────────────

  describe('getMonthlyActiveUsers', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getMonthlyActiveUsers(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = [{ count: 100, month: '2026-01' }]
      mockMetricsService.getMonthlyActiveUsers.mockResolvedValueOnce(mockResult)
      // act
      await MetricsController.getMonthlyActiveUsers(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })
  })

  // ─── getSignups ────────────────────────────────────────────────────────────

  describe('getSignups', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getSignups(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with combined count and byMethod result on success', async () => {
      // arrange
      mockMetricsService.getSignupCount.mockResolvedValueOnce(15)
      mockMetricsService.getSignupsByMethod.mockResolvedValueOnce({ email: 10, phone: 5 })
      req.query = { range: '14d' }
      // act
      await MetricsController.getSignups(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          byMethod: { email: 10, phone: 5 },
          count: 15,
        }),
      )
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockMetricsService.getSignupCount.mockRejectedValueOnce(new Error('Query failed'))
      // act
      await MetricsController.getSignups(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getFeatureUsage ───────────────────────────────────────────────────────

  describe('getFeatureUsage', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getFeatureUsage(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with result on success', async () => {
      // arrange
      const mockResult = [{ count: 5, feature: 'media_upload' }]
      mockMetricsService.getFeatureUsage.mockResolvedValueOnce(mockResult)
      req.query = { range: '90d' }
      // act
      await MetricsController.getFeatureUsage(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, mockResult)
    })
  })

  // ─── getGrowth ─────────────────────────────────────────────────────────────

  describe('getGrowth', () => {
    it('should return service unavailable when metrics service is not available', async () => {
      // arrange
      mockMetricsService.isAvailable.mockReturnValue(false)
      // act
      await MetricsController.getGrowth(req, res)
      // assert
      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should call sendOK with all six growth fields on success', async () => {
      // arrange
      mockMetricsService.getRealTimeActiveUsers
        .mockResolvedValueOnce(10) // DAU
        .mockResolvedValueOnce(50) // WAU
        .mockResolvedValueOnce(200) // MAU
      mockMetricsService.getSignupCount
        .mockResolvedValueOnce(3) // signups7d
        .mockResolvedValueOnce(12) // signups30d
        .mockResolvedValueOnce(500) // totalSignups
      // act
      await MetricsController.getGrowth(req, res)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, {
        dailyActiveUsers: 10,
        monthlyActiveUsers: 200,
        signupsLast7Days: 3,
        signupsLast30Days: 12,
        totalSignups: 500,
        weeklyActiveUsers: 50,
      })
    })

    it('should call sendBadRequest when any parallel fetch throws', async () => {
      // arrange
      mockMetricsService.getRealTimeActiveUsers.mockRejectedValueOnce(new Error('Timescale error'))
      // act
      await MetricsController.getGrowth(req, res)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── parseDateRange via getDailyActiveUsers ────────────────────────────────

  describe('parseDateRange (via getDailyActiveUsers query param)', () => {
    const ranges = ['7d', '14d', '30d', '90d'] as const

    it.each(ranges)('should use a valid date range for %s', async (range) => {
      // arrange
      mockMetricsService.getDailyActiveUsers.mockResolvedValueOnce([])
      req.query = { range }
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      expect(mockMetricsService.getDailyActiveUsers).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        undefined,
      )
    })

    it('should default to 30-day window when range is undefined', async () => {
      // arrange
      mockMetricsService.getDailyActiveUsers.mockResolvedValueOnce([])
      req.query = {}
      // act
      await MetricsController.getDailyActiveUsers(req, res)
      // assert
      const [startDate, endDate] = (mockMetricsService.getDailyActiveUsers as jest.Mock).mock
        .calls[0]
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(diffDays).toBeGreaterThanOrEqual(29)
      expect(diffDays).toBeLessThanOrEqual(31)
    })
  })
})
