import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { EmailController } from './email-api.controller'

export class EmailRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.delete('/:id', hasAdminRole, EmailController.deleteEmail)
    router.delete('/user-profile/:id', EmailController.deleteEmailUserProfile)

    router.post('/', EmailController.createEmail)
    router.post('/validate', EmailController.checkAvailability)

    router.put('/:id', EmailController.updateEmail)

    return router
  }
}

export type EmailRoutesType = typeof EmailRoutes.prototype
