import type { Request, Response } from 'express'

import { TokenService } from '@dx3/api-libs/auth/tokens/token.service'
import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { UserService } from '@dx3/api-libs/user/user-api.service'
import {
  type CreateUserPayloadType,
  type GetUserQueryType,
  type GetUsersListQueryType,
  METRIC_FEATURE_NAME,
  type UpdatePasswordPayloadType,
  type UpdateUsernamePayloadType,
  type UpdateUserPayloadType,
  USER_ROLE,
} from '@dx3/models-shared'

export const UserController = {
  checkUsernameAvailability: async (req: Request, res: Response) => {
    logRequest({ req, type: 'checkUsernameAvailability' })
    try {
      const { username } = req.query as { username: string }
      const service = new UserService()
      const result = await service.isUsernameAvailable(username)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({
        message: (err as Error)?.message,
        req,
        type: 'Failed checkUsernameAvailability',
      })
      sendBadRequest(req, res, err.message)
    }
  },

  createUser: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createUser' })
    try {
      const service = new UserService()
      const result = await service.createUser(req.body as CreateUserPayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createUser' })
      sendBadRequest(req, res, err.message)
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    logRequest({ req, type: 'deleteUser' })
    try {
      const { id } = req.params as { id: string }
      const service = new UserService()
      const result = await service.deleteUser(id)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deleteUser' })
      sendBadRequest(req, res, err.message)
    }
  },

  getUser: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getUser' })
    try {
      const { id } = req.params as GetUserQueryType
      const authToken = HeaderService.getTokenFromRequest(req)
      const loggedInUserId = TokenService.getUserIdFromToken(authToken)
      const service = new UserService()
      const result = await service.getUser(id, loggedInUserId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getUser' })
      sendBadRequest(req, res, err.message)
    }
  },

  getUserProfile: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getUserProfile' })
    try {
      const authToken = HeaderService.getTokenFromRequest(req)
      const userId = TokenService.getUserIdFromToken(authToken)
      const service = new UserService()
      const result = await service.getProfile(userId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getUserProfile' })
      sendBadRequest(req, res, err.message)
    }
  },

  getUsersList: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getUserList' })
    try {
      const service = new UserService()
      const result = await service.getUserList(req.query as GetUsersListQueryType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getUsersList' })
      sendBadRequest(req, res, err.message)
    }
  },

  sendOtpCode: async (req: Request, res: Response) => {
    logRequest({ req, type: 'sendOTPCode' })
    try {
      const authToken = HeaderService.getTokenFromRequest(req)
      const userId = TokenService.getUserIdFromToken(authToken)
      const service = new UserService()
      const result = await service.sendOtpCode(userId)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed setOTPCode' })
      sendBadRequest(req, res, err.message)
    }
  },

  updatePassword: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updatePassword' })
    try {
      const service = new UserService()
      const result = await service.updatePassword(req.body as UpdatePasswordPayloadType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updatePassword' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateRolesRestrictions: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateRoleRestrictions' })
    try {
      const { id } = req.params as { id: string }
      const payload = req.body as UpdateUserPayloadType
      const currentUser = req.user
      const service = new UserService()

      // Validate that non-SUPER_ADMIN users cannot modify ADMIN or SUPER_ADMIN roles
      if (!currentUser?.isSuperAdmin && payload.roles) {
        const privilegedRoles: string[] = [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]

        // Get the target user's current roles to detect changes
        const targetUser = await service.getUser(id, currentUser?.id || '')
        const currentRoles: string[] = targetUser?.roles || []

        // Check if ADMIN or SUPER_ADMIN roles are being added or removed
        const isAddingPrivilegedRole = payload.roles.some(
          (role: string) => privilegedRoles.includes(role) && !currentRoles.includes(role),
        )
        const isRemovingPrivilegedRole = currentRoles.some(
          (role: string) => privilegedRoles.includes(role) && !payload.roles.includes(role),
        )

        if (isAddingPrivilegedRole || isRemovingPrivilegedRole) {
          return sendBadRequest(
            req,
            res,
            'Only SUPER_ADMIN users can modify ADMIN or SUPER_ADMIN roles',
          )
        }
      }

      const result = await service.updateRolesAndRestrictions(id, payload)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateRolesRestrictions' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateUser: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateUser' })
    try {
      const { id } = req.params as { id: string }
      const service = new UserService()
      const result = await service.updateUser(id, req.body as UpdateUserPayloadType)

      // Record profile update feature usage
      void MetricsService.instance?.recordFeatureUsage({
        context: { updatedFields: Object.keys(req.body || {}) },
        featureName: METRIC_FEATURE_NAME.PROFILE_UPDATE,
        req,
      })

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateUser' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateUserName: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateUsername' })
    try {
      const { id } = req.params as { id: string }
      const service = new UserService()
      const result = await service.updateUserName(id, req.body as UpdateUsernamePayloadType)

      // Record profile update feature usage
      void MetricsService.instance?.recordFeatureUsage({
        context: { updatedFields: ['username'] },
        featureName: METRIC_FEATURE_NAME.PROFILE_UPDATE,
        req,
      })

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateUserName' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type UserControllerType = typeof UserController
