import dayjs from 'dayjs'
import type { Request, Response } from 'express'

import {
  sendBadRequest,
  sendOK,
  sendServiceUnavailable,
} from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'

// Valid date ranges for metrics queries
const VALID_RANGES = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '90d': 90,
} as const

type ValidRange = keyof typeof VALID_RANGES

function parseDateRange(range: string | undefined): { endDate: Date; startDate: Date } {
  const days = VALID_RANGES[range as ValidRange] ?? 30
  const endDate = dayjs().endOf('day').toDate()
  const startDate = dayjs().subtract(days, 'day').startOf('day').toDate()
  return { endDate, startDate }
}

export const MetricsController = {
  /**
   * Get daily active users (DAU) trend
   */
  getDailyActiveUsers: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsDAU' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const { endDate, startDate } = parseDateRange(req.query.range as string)
      const appId = req.query.appId as string | undefined

      const result = await metricsService.getDailyActiveUsers(startDate, endDate, appId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsDAU' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get feature usage statistics
   */
  getFeatureUsage: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsFeatureUsage' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const { endDate, startDate } = parseDateRange(req.query.range as string)
      const appId = req.query.appId as string | undefined

      const result = await metricsService.getFeatureUsage(startDate, endDate, appId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsFeatureUsage' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get growth metrics (DAU/WAU/MAU and signups)
   * Returns aggregate single values for the dashboard stat cards
   * Uses real-time queries against the logs table for immediate visibility
   */
  getGrowth: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsGrowth' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const appId = req.query.appId as string | undefined

      // Get date ranges for different metrics
      const now = dayjs()
      const todayStart = now.startOf('day').toDate()
      const todayEnd = now.endOf('day').toDate()
      const weekStart = now.subtract(7, 'day').startOf('day').toDate()
      const monthStart = now.subtract(30, 'day').startOf('day').toDate()

      // Fetch all metrics in parallel using real-time queries for immediate visibility
      const [
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        signups7d,
        signups30d,
        totalSignups,
      ] = await Promise.all([
        metricsService.getRealTimeActiveUsers(todayStart, todayEnd, appId),
        metricsService.getRealTimeActiveUsers(weekStart, todayEnd, appId),
        metricsService.getRealTimeActiveUsers(monthStart, todayEnd, appId),
        metricsService.getSignupCount(weekStart, todayEnd, appId),
        metricsService.getSignupCount(monthStart, todayEnd, appId),
        metricsService.getSignupCount(new Date(0), todayEnd, appId), // All time
      ])

      return sendOK(req, res, {
        dailyActiveUsers,
        monthlyActiveUsers,
        signupsLast7Days: signups7d,
        signupsLast30Days: signups30d,
        totalSignups,
        weeklyActiveUsers,
      })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsGrowth' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get monthly active users (MAU) trend
   */
  getMonthlyActiveUsers: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsMAU' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const { endDate, startDate } = parseDateRange(req.query.range as string)
      const appId = req.query.appId as string | undefined

      const result = await metricsService.getMonthlyActiveUsers(startDate, endDate, appId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsMAU' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get signups count for a date range
   */
  getSignups: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsSignups' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const { endDate, startDate } = parseDateRange(req.query.range as string)
      const appId = req.query.appId as string | undefined

      const [count, byMethod] = await Promise.all([
        metricsService.getSignupCount(startDate, endDate, appId),
        metricsService.getSignupsByMethod(startDate, endDate, appId),
      ])

      return sendOK(req, res, { byMethod, count, endDate, startDate })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsSignups' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Check if metrics service is available
   */
  getStatus: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsStatus' })
    try {
      const metricsService = MetricsService.instance
      const isAvailable = metricsService?.isAvailable() ?? false

      return sendOK(req, res, {
        isAvailable,
        message: isAvailable
          ? 'Metrics service is available'
          : 'Metrics service is not configured or unavailable',
      })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsStatus' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  /**
   * Get weekly active users (WAU) trend
   */
  getWeeklyActiveUsers: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getMetricsWAU' })
    try {
      const metricsService = MetricsService.instance
      if (!metricsService?.isAvailable()) {
        return sendServiceUnavailable(
          req,
          res,
          'Metrics service is not available. TimescaleDB may not be configured.',
        )
      }

      const { endDate, startDate } = parseDateRange(req.query.range as string)
      const appId = req.query.appId as string | undefined

      const result = await metricsService.getWeeklyActiveUsers(startDate, endDate, appId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMetricsWAU' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },
}

export type MetricsControllerType = typeof MetricsController
