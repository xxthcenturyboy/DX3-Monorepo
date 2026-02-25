import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  checkEmailAvailabilityBodySchema,
  createEmailBodySchema,
  emailParamsSchema,
  updateEmailBodySchema,
} from '@dx3/api-libs/email/email-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { EmailController } from './email-api.controller'

export class EmailRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.delete(
      '/:id',
      hasAdminRole,
      validateRequest({ params: emailParamsSchema }),
      EmailController.deleteEmail,
    )
    router.delete(
      '/user-profile/:id',
      validateRequest({ params: emailParamsSchema }),
      EmailController.deleteEmailUserProfile,
    )

    router.post('/', validateRequest({ body: createEmailBodySchema }), EmailController.createEmail)
    router.post(
      '/validate',
      validateRequest({ body: checkEmailAvailabilityBodySchema }),
      EmailController.checkAvailability,
    )

    router.put(
      '/:id',
      validateRequest({ body: updateEmailBodySchema, params: emailParamsSchema }),
      EmailController.updateEmail,
    )

    return router
  }
}

export type EmailRoutesType = typeof EmailRoutes.prototype
