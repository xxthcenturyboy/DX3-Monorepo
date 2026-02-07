import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasMetricsAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { MetricsController } from './metrics-api.controller'

export class MetricsRoutes {
  static configure() {
    const router = Router()

    // All routes require authentication + METRICS_ADMIN role
    router.all('/*', [ensureLoggedIn, hasMetricsAdminRole])

    // Status endpoint
    router.get('/status', MetricsController.getStatus)

    // Growth metrics (combined DAU/WAU/MAU)
    router.get('/growth', MetricsController.getGrowth)

    // Individual active user metrics
    router.get('/dau', MetricsController.getDailyActiveUsers)
    router.get('/wau', MetricsController.getWeeklyActiveUsers)
    router.get('/mau', MetricsController.getMonthlyActiveUsers)

    // Signup metrics
    router.get('/signups', MetricsController.getSignups)

    // Feature usage metrics
    router.get('/features', MetricsController.getFeatureUsage)

    return router
  }
}

export type MetricsRoutesType = typeof MetricsRoutes.prototype
