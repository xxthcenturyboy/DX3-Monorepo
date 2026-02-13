import { Router } from 'express'

import {
  ensureLoggedIn,
  ensureLoggedInMedia,
} from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { UploadMiddleware } from '@dx3/api-libs/media/media-api-file-upload.middleware'

import { MediaApiController } from './media-api.controller'

export class MediaApiBaseRoutes {
  static configure() {
    const router = Router()

    router.get('/pub/:id/:size', MediaApiController.getPublicMedia)
    router.get('/:id/:size', [ensureLoggedInMedia], MediaApiController.getMedia)

    return router
  }
}
export class MediaApiV1Routes {
  static configure() {
    const router = Router()

    router.post(
      '/upload-profile-image',
      [ensureLoggedIn, UploadMiddleware.singleFile],
      MediaApiController.uploadContent,
    )

    router.post(
      '/upload-content',
      [ensureLoggedIn, UploadMiddleware.multipleFiles],
      MediaApiController.uploadContent,
    )

    return router
  }
}
