import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import {
  hasAdminRole,
  hasSuperAdminRole,
} from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { EmailController } from './email-api.controller'

export class EmailRoutes {
  static configure() {
    const router = Router()

    router.post('/test/validate-email', EmailController.validateTestEmail)

    router.all('/*', [ensureLoggedIn])

    router.post('/validate', EmailController.checkAvailability)

    router.post('/', EmailController.createEmail)

    router.put('/:id', EmailController.updateEmail)

    router.delete('/user-profile/:id', EmailController.deleteEmailUserProfile)

    router.delete('/:id', hasAdminRole, EmailController.deleteEmail)

    router.delete('/test/:id', hasSuperAdminRole, EmailController.deleteEmailTest)

    return router
  }
}

export type EmailRoutesType = typeof EmailRoutes.prototype
