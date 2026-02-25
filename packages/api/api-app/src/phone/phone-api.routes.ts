import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  checkPhoneAvailabilityBodySchema,
  createPhoneBodySchema,
  phoneParamsSchema,
  updatePhoneBodySchema,
} from '@dx3/api-libs/phone/phone-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { PhoneController } from './phone-api.controller'

export class PhoneRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.delete(
      '/:id',
      hasAdminRole,
      validateRequest({ params: phoneParamsSchema }),
      PhoneController.deletePhone,
    )
    router.delete(
      '/user-profile/:id',
      validateRequest({ params: phoneParamsSchema }),
      PhoneController.deletePhoneUserProfile,
    )

    router.post('/', validateRequest({ body: createPhoneBodySchema }), PhoneController.createPhone)
    router.post(
      '/validate',
      validateRequest({ body: checkPhoneAvailabilityBodySchema }),
      PhoneController.checkAvailability,
    )

    router.put(
      '/:id',
      validateRequest({ body: updatePhoneBodySchema, params: phoneParamsSchema }),
      PhoneController.updatePhone,
    )

    return router
  }
}

export type PhoneRoutesType = typeof PhoneRoutes.prototype
