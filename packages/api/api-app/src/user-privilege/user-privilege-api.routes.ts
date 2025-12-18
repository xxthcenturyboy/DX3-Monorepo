import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasSuperAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { PrivilegeSetController } from './user-privilege-api.controller'

export class UserPrivilegeRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.get('/', PrivilegeSetController.getAllPrivilegeSets)

    router.put('/:id', [hasSuperAdminRole], PrivilegeSetController.updatePrivilegeSet)

    return router
  }
}

export type UserPrivilegeRoutesType = typeof UserPrivilegeRoutes.prototype
