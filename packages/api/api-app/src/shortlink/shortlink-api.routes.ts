import { Router } from 'express'

import { ShortlinkController } from './shortlink-api.controller'

export class ShortlinkRoutes {
  static configure() {
    const router = Router()

    router.get('/:id', ShortlinkController.getTarget)

    return router
  }
}

export type ShortlinkRoutesType = typeof ShortlinkRoutes.prototype
