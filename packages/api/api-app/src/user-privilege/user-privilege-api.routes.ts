import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasSuperAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import {
  privilegeSetParamsSchema,
  updatePrivilegeSetBodySchema,
} from '@dx3/api-libs/user-privilege/user-privilege-api.validation'
import { validateRequest } from '@dx3/api-libs/validation/validate-request.middleware'

import { PrivilegeSetController } from './user-privilege-api.controller'

export class UserPrivilegeRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.get('/', PrivilegeSetController.getAllPrivilegeSets)

    router.put(
      '/:id',
      [hasSuperAdminRole],
      validateRequest({
        body: updatePrivilegeSetBodySchema,
        params: privilegeSetParamsSchema,
      }),
      PrivilegeSetController.updatePrivilegeSet,
    )

    return router
  }
}

export type UserPrivilegeRoutesType = typeof UserPrivilegeRoutes.prototype
