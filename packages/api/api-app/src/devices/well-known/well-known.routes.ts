import { Router } from 'express'

import { WellKnownController } from './well-known.controller'

export class WellKnownRoutes {
  static configure() {
    const router = Router()

    router.get('/assetlinks.json', WellKnownController.getAndroidData)
    router.get('/apple-app-site-association', WellKnownController.getAppleData)

    return router
  }
}

export type WellKnownRoutesType = typeof WellKnownRoutes.prototype
