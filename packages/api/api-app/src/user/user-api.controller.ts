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
      const service = new UserService()
      const result = await service.updateRolesAndRestrictions(id, req.body as UpdateUserPayloadType)
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
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateUserName' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type UserControllerType = typeof UserController
