import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  checkUsernameAvailabilityQuerySchema,
  createUserBodySchema,
  getUserParamsSchema,
  getUsersListQuerySchema,
  updatePasswordBodySchema,
  updateUserBodySchema,
  updateUsernameBodySchema,
} from '@dx3/api-libs/user/user-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { UserController } from './user-api.controller'

export class UserRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.get(
      '/check/availability',
      DxRateLimiters.authLookup(),
      validateRequest({ query: checkUsernameAvailabilityQuerySchema }),
      UserController.checkUsernameAvailability,
    )
    router.get(
      '/list',
      hasAdminRole,
      validateRequest({ query: getUsersListQuerySchema }),
      UserController.getUsersList,
    )
    router.get('/profile', UserController.getUserProfile)
    router.get(
      '/user/:id',
      hasAdminRole,
      validateRequest({ params: getUserParamsSchema }),
      UserController.getUser,
    )

    router.post(
      '/',
      hasAdminRole,
      validateRequest({ body: createUserBodySchema }),
      UserController.createUser,
    )
    router.post('/send-otp-code', UserController.sendOtpCode)

    router.put(
      '/:id',
      validateRequest({
        body: updateUserBodySchema.omit({ id: true }).partial(),
        params: getUserParamsSchema,
      }),
      UserController.updateUser,
    )
    router.put(
      '/roles-restrictions/:id',
      hasAdminRole,
      validateRequest({
        body: updateUserBodySchema.pick({ restrictions: true, roles: true }),
        params: getUserParamsSchema,
      }),
      UserController.updateRolesRestrictions,
    )
    router.put(
      '/update/password',
      validateRequest({ body: updatePasswordBodySchema }),
      UserController.updatePassword,
    )
    router.put(
      '/update/username/:id',
      validateRequest({ body: updateUsernameBodySchema, params: getUserParamsSchema }),
      UserController.updateUserName,
    )

    // router.delete('/:id', hasAdminRole, UserController.deleteUser)

    return router
  }
}

export type UserRoutesType = typeof UserRoutes.prototype
