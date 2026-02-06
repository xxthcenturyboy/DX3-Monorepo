import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { sendBadRequest, sendOK, sendServiceUnavailable } from '@dx3/api-libs/http-response/http-responses'
import { LoggingService } from '@dx3/api-libs/timescale'

import { AdminLogsController } from './admin-logs-api.controller'

jest.mock('@dx3/api-libs/http-response/http-responses')
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

// Mock LoggingService
const mockLoggingService = {
  getLogs: jest.fn(),
  getRecentErrors: jest.fn(),
  getStats: jest.fn(),
  isAvailable: jest.fn(),
}

jest.mock('@dx3/api-libs/timescale', () => ({
  LoggingService: {
    instance: null,
  },
}))

describe('AdminLogsController', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    req.query = {}
    ;(LoggingService as unknown as { instance: typeof mockLoggingService }).instance = mockLoggingService
  })

  describe('getLogs', () => {
    it('should exist', () => {
      expect(AdminLogsController.getLogs).toBeDefined()
    })

    it('should return service unavailable when logging is not available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(false)

      await AdminLogsController.getLogs(req, res)

      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should return logs when available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)
      mockLoggingService.getLogs.mockResolvedValue({ count: 0, rows: [] })

      await AdminLogsController.getLogs(req, res)

      expect(sendOK).toHaveBeenCalledWith(req, res, { count: 0, rows: [] })
    })

    it('should pass query parameters to service', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)
      mockLoggingService.getLogs.mockResolvedValue({ count: 0, rows: [] })
      req.query = {
        appId: 'test-app',
        eventType: 'API_REQUEST',
        limit: '50',
        offset: '10',
      }

      await AdminLogsController.getLogs(req, res)

      expect(mockLoggingService.getLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'test-app',
          eventType: 'API_REQUEST',
          limit: 50,
          offset: 10,
        }),
      )
    })

    it('should handle errors', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)
      mockLoggingService.getLogs.mockRejectedValue(new Error('Test error'))

      await AdminLogsController.getLogs(req, res)

      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('should exist', () => {
      expect(AdminLogsController.getStats).toBeDefined()
    })

    it('should return service unavailable when logging is not available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(false)

      await AdminLogsController.getStats(req, res)

      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should return stats when available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)
      mockLoggingService.getStats.mockResolvedValue({ daily: [], hourly: [] })

      await AdminLogsController.getStats(req, res)

      expect(sendOK).toHaveBeenCalledWith(req, res, { daily: [], hourly: [] })
    })
  })

  describe('getRecentErrors', () => {
    it('should exist', () => {
      expect(AdminLogsController.getRecentErrors).toBeDefined()
    })

    it('should return service unavailable when logging is not available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(false)

      await AdminLogsController.getRecentErrors(req, res)

      expect(sendServiceUnavailable).toHaveBeenCalled()
    })

    it('should return errors when available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)
      mockLoggingService.getRecentErrors.mockResolvedValue([])

      await AdminLogsController.getRecentErrors(req, res)

      expect(sendOK).toHaveBeenCalledWith(req, res, [])
    })
  })

  describe('getStatus', () => {
    it('should exist', () => {
      expect(AdminLogsController.getStatus).toBeDefined()
    })

    it('should return available status when logging is available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(true)

      await AdminLogsController.getStatus(req, res)

      expect(sendOK).toHaveBeenCalledWith(req, res, {
        isAvailable: true,
        message: 'Centralized logging is available',
      })
    })

    it('should return unavailable status when logging is not available', async () => {
      mockLoggingService.isAvailable.mockReturnValue(false)

      await AdminLogsController.getStatus(req, res)

      expect(sendOK).toHaveBeenCalledWith(req, res, {
        isAvailable: false,
        message: 'Centralized logging is not configured or unavailable',
      })
    })
  })
})
