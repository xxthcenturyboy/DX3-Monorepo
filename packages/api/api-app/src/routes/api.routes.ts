import { type Express, Router } from 'express'

import { endpointNotFound } from '@dx3/api-libs/http-response/http-responses'
import { LivezRoutes } from '@dx3/api-libs/livez/lives-api.routes'

import { WellKnownRoutes } from '../devices/well-known/well-known.routes'
import { HealthzRoutes } from '../healthz/healthz-api.routes'
import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { RoutesV1 } from './v1.routes'

export class ApiRoutes {
  app: Express
  router: Router

  constructor(app: Express) {
    this.app = app
    this.router = Router()
  }

  public loadRoutes() {
    this.router.use('/healthz', HealthzRoutes.configure())
    this.router.use('/livez', DxRateLimiters.strict(), LivezRoutes.configure())
    this.router.use('/.well-known', DxRateLimiters.veryStrict(), WellKnownRoutes.configure())
    this.router.use('/v1', RoutesV1.configure())

    this.router.all('/*', endpointNotFound)

    if (this.app) {
      this.app.use('/api', DxRateLimiters.standard(), this.router)
    }
  }
}
