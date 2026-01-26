import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { SupportController } from './support-api.controller'

export class SupportRoutes {
  static configure() {
    const router = Router()

    // All routes require authentication
    router.all('/*', [ensureLoggedIn])

    // User endpoints (authenticated users)
    router.post(
      '/',
      DxRateLimiters.veryStrict(),
      SupportController.createRequest,
    )

    // Admin endpoints
    router.get('/list', hasAdminRole, SupportController.getList)
    router.get('/unviewed-count', hasAdminRole, SupportController.getUnviewedCount)
    router.get('/user/:userId', hasAdminRole, SupportController.getByUserId)
    router.get('/:id', hasAdminRole, SupportController.getById)

    router.put('/mark-all-viewed', hasAdminRole, SupportController.markAllAsViewed)
    router.put('/bulk-status', hasAdminRole, SupportController.bulkUpdateStatus)
    router.put('/:id/status', hasAdminRole, SupportController.updateStatus)
    router.put('/:id/viewed', hasAdminRole, SupportController.markAsViewed)

    return router
  }
}

export type SupportRoutesType = typeof SupportRoutes.prototype
