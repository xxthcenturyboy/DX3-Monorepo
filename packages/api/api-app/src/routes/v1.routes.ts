import { Router } from 'express'

import { endpointNotFound } from '@dx3/api-libs/http-response/http-responses'

import { AdminLogsRoutes } from '../admin-logs/admin-logs-api.routes'
import { AuthRoutes } from '../auth/auth-api.routes'
import { BlogRoutes } from '../blog/blog-api.routes'
import { DevicesRoutes } from '../devices/devices-api.routes'
import { EmailRoutes } from '../email/email-api.routes'
import { FeatureFlagRoutes } from '../feature-flags/feature-flag-api.routes'
import { MediaApiV1Routes } from '../media/media-api.routes'
import { MetricsRoutes } from '../metrics/metrics-api.routes'
import { NotificationRoutes } from '../notifications/notification-api.routes'
import { PhoneRoutes } from '../phone/phone-api.routes'
import { ShortlinkRoutes } from '../shortlink/shortlink-api.routes'
import { SupportRoutes } from '../support/support-api.routes'
import { UserRoutes } from '../user/user-api.routes'
import { UserPrivilegeRoutes } from '../user-privilege/user-privilege-api.routes'

export class RoutesV1 {
  static configure() {
    const router = Router()
    router.use('/admin-logs', AdminLogsRoutes.configure())
    router.use('/blog', BlogRoutes.configure())
    router.use('/auth', AuthRoutes.configure())
    router.use('/device', DevicesRoutes.configure())
    router.use('/email', EmailRoutes.configure())
    router.use('/feature-flag', FeatureFlagRoutes.configure())
    router.use('/media', MediaApiV1Routes.configure())
    router.use('/metrics', MetricsRoutes.configure())
    router.use('/notification', NotificationRoutes.configure())
    router.use('/phone', PhoneRoutes.configure())
    router.use('/privilege-set', UserPrivilegeRoutes.configure())
    router.use('/shortlink', ShortlinkRoutes.configure())
    router.use('/support', SupportRoutes.configure())
    router.use('/user', UserRoutes.configure())
    router.all('/*', endpointNotFound)

    return router
  }
}

export type RoutesV1Type = typeof RoutesV1.prototype
