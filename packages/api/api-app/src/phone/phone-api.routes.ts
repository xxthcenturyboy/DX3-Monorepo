import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { PhoneController } from './phone-api.controller'

export class PhoneRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.delete('/:id', hasAdminRole, PhoneController.deletePhone)
    router.delete('/user-profile/:id', PhoneController.deletePhoneUserProfile)

    router.post('/', PhoneController.createPhone)
    router.post('/validate', PhoneController.checkAvailability)

    router.put('/:id', PhoneController.updatePhone)

    return router
  }
}

export type PhoneRoutesType = typeof PhoneRoutes.prototype
