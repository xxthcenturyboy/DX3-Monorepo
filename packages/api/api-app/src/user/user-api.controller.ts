import type { Request, Response } from 'express'

import { TokenService } from '@dx3/api-libs/auth/tokens/token.service'
import { HeaderService } from '@dx3/api-libs/headers/header.service'
import { sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { UserService } from '@dx3/api-libs/user/user-api.service'
import type {
  CreateUserPayloadType,
  GetUserQueryType,
  GetUsersListQueryType,
  UpdatePasswordPayloadType,
  UpdateUsernamePayloadType,
  UpdateUserPayloadType,
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not create user', req, type: 'Failed createUser' })
      sendBadRequest(req, res, `Could not create user.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not delete user.', req, type: 'Failed deleteUser' })
      sendBadRequest(req, res, `Could not delete user.`)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed deleteUser' })
      sendBadRequest(req, res, err.message)
    }
  },

  getUser: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getUser' })
    try {
      const { id } = req.params as GetUserQueryType
      const service = new UserService()
      const result = await service.getUser(id)
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not get user.', req, type: 'Failed getUser' })
      sendBadRequest(req, res, `Could not get user.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'No profile for this user.', req, type: 'Failed getUserProfile' })
      sendBadRequest(req, res, `No profile for this user.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not get user list.', req, type: 'Failed getUsersList' })
      sendBadRequest(req, res, `Could not get user list.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Code could not be sent.', req, type: 'Failed sendOTPCode' })
      sendBadRequest(req, res, `Code could not be sent.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not update password.', req, type: 'Failed updatePassword' })
      sendBadRequest(req, res, `Could not update password.`)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updatePassword' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateRolesRestrictions: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateRoleRestrictions' })
    try {
      const { id } = req.params as { id: string }
      const service = new UserService()
      const result = await service.updateRolesAndRestrictions(id, req.body as UpdateUserPayloadType)
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not update user.', req, type: 'Failed updateRolesRestrictions' })
      sendBadRequest(req, res, `Could not update user.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not update user.', req, type: 'Failed updateUser' })
      sendBadRequest(req, res, `Could not update user.`)
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
      if (result) {
        return sendOK(req, res, result)
      }

      logRequest({ message: 'Could not update username', req, type: 'Failed updateUserName' })
      sendBadRequest(req, res, `Could not update username.`)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateUserName' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type UserControllerType = typeof UserController
