import { Router } from 'express'

import { HealthzController } from './healthz-api.controller'

export class HealthzRoutes {
  static configure() {
    const router = Router()

    router.get('/h', HealthzController.getHealth)

    return router
  }
}

export type HealthzRoutesType = typeof HealthzRoutes.prototype
