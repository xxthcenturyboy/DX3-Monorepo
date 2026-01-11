import { type Express, type NextFunction, type Request, type Response, Router } from 'express'

import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { endpointNotFound, sendBadRequest } from '@dx3/api-libs/http-response/http-responses'
import { LivezRoutes } from '@dx3/api-libs/livez/lives-api.routes'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { createApiErrorMessage } from '@dx3/api-libs/utils'
import { ERROR_CODES } from '@dx3/models-shared'

import { WellKnownRoutes } from '../devices/well-known/well-known.routes'
import { HealthzRoutes } from '../healthz/healthz-api.routes'
import { MediaApiBaseRoutes } from '../media/media-api.routes'
import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { RoutesV1 } from './v1.routes'
export class ApiRoutes {
  app: Express
  baseRouter: Router
  v1Router: Router

  constructor(app: Express) {
    this.app = app
    this.baseRouter = Router()
    this.v1Router = Router()
  }

  public loadRoutes() {
    this.baseRouter.use('/healthz', HealthzRoutes.configure())
    this.baseRouter.use('/livez', DxRateLimiters.strict(), LivezRoutes.configure())
    this.baseRouter.use('/media', MediaApiBaseRoutes.configure())
    this.baseRouter.use('/.well-known', DxRateLimiters.veryStrict(), WellKnownRoutes.configure())
    this.baseRouter.all('/*', endpointNotFound)
    this.v1Router.use('/', RoutesV1.configure())

    const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
      try {
        const version = HeaderService.getVersionFromRequest(req)

        if (version === 1) {
          this.v1Router(req, res, next)
        } else {
          this.baseRouter(req, res, next)
        }
      } catch (err) {
        const msg = (err as Error).message
        ApiLoggingClass.instance.logError(`Failed to route based on version: ${msg}`)
        sendBadRequest(req, res, createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, msg))
      }
    }

    if (this.app) {
      this.app.use('/api', [DxRateLimiters.standard(), versionMiddleware])
    }
  }
}
