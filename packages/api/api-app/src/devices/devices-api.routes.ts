import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'

import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { DevicesController } from './devices-api.controller'

export class DevicesRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.put(
      '/biometric/public-key',
      DxRateLimiters.veryStrict(),
      DevicesController.updatePublicKey,
    )

    router.put('/fcm-token', DxRateLimiters.strict(), DevicesController.updateFcmToken)

    router.delete('/disconnect/:id', DevicesController.disconnectDevice)

    return router
  }
}

export type DevicesRoutesType = typeof DevicesRoutes.prototype
