import type { Request, Response } from 'express'

import { sendBadRequest, sendOK, sendServiceUnavailable } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { LoggingService } from '@dx3/api-libs/timescale'
import type { GetLogsQueryType } from '@dx3/models-shared'

export const AdminLogsController = {
  /**
   * Get logs with filtering and pagination
   */
  getLogs: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminLogs' })
    try {
      const loggingService = LoggingService.instance
      if (!loggingService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Centralized logging is not available. TimescaleDB may not be configured.',
        )
      }

      const query: GetLogsQueryType = {
        appId: req.query.appId as string | undefined,
        endDate: req.query.endDate as string | undefined,
        eventType: req.query.eventType as GetLogsQueryType['eventType'],
        limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? Number.parseInt(req.query.offset as string, 10) : undefined,
        orderBy: req.query.orderBy as string | undefined,
        sortDir: req.query.sortDir as 'ASC' | 'DESC' | undefined,
        startDate: req.query.startDate as string | undefined,
        success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
        userId: req.query.userId as string | undefined,
      }

      const result = await loggingService.getLogs(query)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminLogs' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get recent errors for monitoring
   */
  getRecentErrors: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminLogsRecentErrors' })
    try {
      const loggingService = LoggingService.instance
      if (!loggingService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Centralized logging is not available. TimescaleDB may not be configured.',
        )
      }

      const options = {
        appId: req.query.appId as string | undefined,
        limit: req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined,
        minutesBack: req.query.minutesBack ? Number.parseInt(req.query.minutesBack as string, 10) : undefined,
      }

      const result = await loggingService.getRecentErrors(options)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminLogsRecentErrors' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get aggregated statistics (hourly and daily)
   */
  getStats: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminLogsStats' })
    try {
      const loggingService = LoggingService.instance
      if (!loggingService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Centralized logging is not available. TimescaleDB may not be configured.',
        )
      }

      const options = {
        appId: req.query.appId as string | undefined,
        daysBack: req.query.daysBack ? Number.parseInt(req.query.daysBack as string, 10) : undefined,
      }

      const result = await loggingService.getStats(options)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminLogsStats' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Check if logging service is available
   */
  getStatus: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminLogsStatus' })
    try {
      const loggingService = LoggingService.instance
      const isAvailable = loggingService?.isAvailable() ?? false

      return sendOK(req, res, {
        isAvailable,
        message: isAvailable
          ? 'Centralized logging is available'
          : 'Centralized logging is not configured or unavailable',
      })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminLogsStatus' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },
}

export type AdminLogsControllerType = typeof AdminLogsController
