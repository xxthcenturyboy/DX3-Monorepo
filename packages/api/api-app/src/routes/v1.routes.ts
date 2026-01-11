import { Router } from 'express'

import { endpointNotFound } from '@dx3/api-libs/http-response/http-responses'

import { AuthRoutes } from '../auth/auth-api.routes'
import { DevicesRoutes } from '../devices/devices-api.routes'
import { EmailRoutes } from '../email/email-api.routes'
import { MediaApiV1Routes } from '../media/media-api.routes'
import { NotificationRoutes } from '../notifications/notification-api.routes'
import { PhoneRoutes } from '../phone/phone-api.routes'
import { ShortlinkRoutes } from '../shortlink/shortlink-api.routes'
import { UserRoutes } from '../user/user-api.routes'
import { UserPrivilegeRoutes } from '../user-privilege/user-privilege-api.routes'

export class RoutesV1 {
  static configure() {
    const router = Router()
    router.use('/auth', AuthRoutes.configure())
    router.use('/device', DevicesRoutes.configure())
    router.use('/email', EmailRoutes.configure())
    router.use('/media', MediaApiV1Routes.configure())
    router.use('/notification', NotificationRoutes.configure())
    router.use('/phone', PhoneRoutes.configure())
    router.use('/privilege-set', UserPrivilegeRoutes.configure())
    router.use('/shortlink', ShortlinkRoutes.configure())
    router.use('/user', UserRoutes.configure())
    router.all('/*', endpointNotFound)

    return router
  }
}

export type RoutesV1Type = typeof RoutesV1.prototype
