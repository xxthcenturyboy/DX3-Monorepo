import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { DxRateLimiters } from '../rate-limiters/rate-limiters.dx'
import { UserController } from './user-api.controller'

export class UserRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.get(
      '/check/availability',
      DxRateLimiters.authLookup(),
      UserController.checkUsernameAvailability,
    )
    router.get('/list', hasAdminRole, UserController.getUsersList)
    router.get('/profile', UserController.getUserProfile)
    router.get('/user/:id', hasAdminRole, UserController.getUser)

    router.post('/', hasAdminRole, UserController.createUser)
    router.post('/send-otp-code', UserController.sendOtpCode)

    router.put('/:id', UserController.updateUser)
    router.put('/roles-restrictions/:id', hasAdminRole, UserController.updateRolesRestrictions)
    router.put('/update/password', UserController.updatePassword)
    router.put('/update/username/:id', UserController.updateUserName)

    // router.delete('/:id', hasAdminRole, UserController.deleteUser)

    return router
  }
}

export type UserRoutesType = typeof UserRoutes.prototype
