import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasSuperAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { FeatureFlagController } from './feature-flag-api.controller'

export class FeatureFlagRoutes {
  static configure() {
    const router = Router()

    // All routes require authentication
    router.all('/*', [ensureLoggedIn])

    // Public endpoint - returns evaluated flags for current user
    router.get('/', FeatureFlagController.getAllFlags)

    // Admin endpoints - requires SUPER_ADMIN role
    router.get('/admin', hasSuperAdminRole, FeatureFlagController.getAdminFlags)
    router.post('/admin', hasSuperAdminRole, FeatureFlagController.createFlag)
    router.put('/admin', hasSuperAdminRole, FeatureFlagController.updateFlag)

    return router
  }
}

export type FeatureFlagRoutesType = typeof FeatureFlagRoutes.prototype
