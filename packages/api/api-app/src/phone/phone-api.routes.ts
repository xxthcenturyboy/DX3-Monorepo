import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import {
  hasAdminRole,
  hasSuperAdminRole,
} from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { PhoneController } from './phone-api.controller'

export class PhoneRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.post('/validate', PhoneController.checkAvailability)
    router.post('/', PhoneController.createPhone)

    router.put('/:id', PhoneController.updatePhone)

    router.delete('/user-profile/:id', PhoneController.deletePhoneUserProfile)
    router.delete('/:id', hasAdminRole, PhoneController.deletePhone)
    router.delete('/test/:id', hasSuperAdminRole, PhoneController.deletePhoneTest)

    return router
  }
}

export type PhoneRoutesType = typeof PhoneRoutes.prototype
