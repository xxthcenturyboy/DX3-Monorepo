import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  bulkUpdateSupportStatusBodySchema,
  createSupportRequestBodySchema,
  getSupportRequestsListQuerySchema,
  supportRequestParamsSchema,
  updateSupportRequestStatusBodySchema,
  userSupportRequestsParamsSchema,
} from '@dx3/api-libs/support/support-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

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
      validateRequest({ body: createSupportRequestBodySchema }),
      SupportController.createRequest,
    )

    // Admin endpoints
    router.get(
      '/list',
      hasAdminRole,
      validateRequest({ query: getSupportRequestsListQuerySchema }),
      SupportController.getList,
    )
    router.get('/unviewed-count', hasAdminRole, SupportController.getUnviewedCount)
    router.get(
      '/user/:userId',
      hasAdminRole,
      validateRequest({ params: userSupportRequestsParamsSchema }),
      SupportController.getByUserId,
    )
    router.get(
      '/:id',
      hasAdminRole,
      validateRequest({ params: supportRequestParamsSchema }),
      SupportController.getById,
    )

    router.put('/mark-all-viewed', hasAdminRole, SupportController.markAllAsViewed)
    router.put(
      '/bulk-status',
      hasAdminRole,
      validateRequest({ body: bulkUpdateSupportStatusBodySchema }),
      SupportController.bulkUpdateStatus,
    )
    router.put(
      '/:id/status',
      hasAdminRole,
      validateRequest({
        body: updateSupportRequestStatusBodySchema,
        params: supportRequestParamsSchema,
      }),
      SupportController.updateStatus,
    )
    router.put(
      '/:id/viewed',
      hasAdminRole,
      validateRequest({ params: supportRequestParamsSchema }),
      SupportController.markAsViewed,
    )

    return router
  }
}

export type SupportRoutesType = typeof SupportRoutes.prototype
