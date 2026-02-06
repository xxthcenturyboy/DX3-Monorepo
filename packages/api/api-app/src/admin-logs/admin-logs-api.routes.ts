import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasLoggingAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { AdminLogsController } from './admin-logs-api.controller'

export class AdminLogsRoutes {
  static configure() {
    const router = Router()

    // All routes require authentication + LOGGING_ADMIN role
    router.all('/*', [ensureLoggedIn, hasLoggingAdminRole])

    // Status endpoint
    router.get('/status', AdminLogsController.getStatus)

    // Stats endpoints
    router.get('/stats', AdminLogsController.getStats)
    router.get('/errors', AdminLogsController.getRecentErrors)

    // Main logs endpoint with filtering
    router.get('/', AdminLogsController.getLogs)

    return router
  }
}

export type AdminLogsRoutesType = typeof AdminLogsRoutes.prototype
