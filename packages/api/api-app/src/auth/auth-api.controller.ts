import type { Request, Response } from 'express'

import { AuthService } from '@dx3/api-libs/auth/auth-api.service'
import { AuthLoginService } from '@dx3/api-libs/auth/auth-login.service'
import { AuthSignupService } from '@dx3/api-libs/auth/auth-signup.service'
import { TokenService } from '@dx3/api-libs/auth/tokens/token.service'
import { CookeiService } from '@dx3/api-libs/cookies/cookie.service'
import { DevicesService } from '@dx3/api-libs/devices/devices-api.service'
import {
  sendBadRequest,
  sendOK,
  sendUnauthorized,
} from '@dx3/api-libs/http-response/http-responses'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { UserModel } from '@dx3/api-libs/user/user-api.postgres-model'
import {
  type AccountCreationPayloadType,
  AUTH_TOKEN_NAMES,
  DEFAULT_TIMEZONE,
  type LoginPayloadType,
  type UserLookupQueryType,
  type UserProfileStateType,
} from '@dx3/models-shared'

export const AuthController = {
  authLookup: async (req: Request, res: Response) => {
    logRequest({ req, type: 'authLookup' })
    try {
      const service = new AuthService()
      const result = await service.doesEmailPhoneExist(req.query as UserLookupQueryType)
      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed authLookup' })
      sendBadRequest(req, res, err.message)
    }
  },

  checkPasswordStrength: async (req: Request, res: Response) => {
    try {
      const service = new AuthService()
      const { password } = req.body as { password: string }
      const result = await service.checkPasswordStrength(password)
      sendOK(req, res, result)
    } catch (err) {
      sendBadRequest(req, res, err.message)
    }
  },

  createAccount: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createAccount' })
    try {
      const service = new AuthSignupService()
      const timezone = req.geo?.location?.time_zone || DEFAULT_TIMEZONE
      const profile = (await service.signup(
        req.body as AccountCreationPayloadType,
        timezone,
      )) as UserProfileStateType

      const tokens = TokenService.generateTokens(profile.id)
      if (tokens.refreshToken) {
        CookeiService.setCookies(
          res,
          profile.hasSecuredAccount,
          tokens.refreshToken,
          tokens.refreshTokenExp,
        )
      }

      sendOK(req, res, {
        accessToken: tokens.accessToken,
        profile,
      })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createAccount' })
      sendBadRequest(req, res, err.message)
    }
  },

  login: async (req: Request, res: Response) => {
    logRequest({ req, type: 'login' })
    try {
      const service = new AuthLoginService()
      const profile = (await service.login(req.body as LoginPayloadType)) as UserProfileStateType

      const tokens = TokenService.generateTokens(profile.id)
      if (tokens.refreshToken) {
        CookeiService.setCookies(
          res,
          profile.hasSecuredAccount,
          tokens.refreshToken,
          tokens.refreshTokenExp,
        )
        await UserModel.updateRefreshToken(profile.id, tokens.refreshToken, true)
      }

      sendOK(req, res, {
        accessToken: tokens.accessToken,
        profile,
      })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed login' })
      sendBadRequest(req, res, err.message)
    }
  },

  logout: async (req: Request, res: Response) => {
    logRequest({ req, type: 'logout' })
    try {
      const refreshToken = CookeiService.getCookie(req, AUTH_TOKEN_NAMES.REFRESH)
      CookeiService.clearCookies(res)
      if (!refreshToken) {
        return sendOK(req, res, { loggedOut: true })
      }
      const service = new AuthService()
      const result = await service.logout(refreshToken)
      if (!result) {
        return sendOK(req, res, { loggedOut: false })
      }

      // req.session.destroy((err: Error) => {
      //   if (err) {
      //     return sendBadRequest(req, res, err.message || 'Failed to destroy session');
      //   }
      //   ApiLoggingClass.instance.logInfo(`Session Destroyed: ${req.user?.id}`);
      // });

      sendOK(req, res, { loggedOut: true })
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed logout' })
      sendBadRequest(req, res, err.message)
    }
  },

  refreshTokens: async (req: Request, res: Response) => {
    logRequest({ req, type: 'refreshTokens' })
    const refreshToken = CookeiService.getCookie(req, AUTH_TOKEN_NAMES.REFRESH)
    if (!refreshToken) {
      ApiLoggingClass.instance.logError('No refresh token.')
      CookeiService.clearCookies(res)
      // req.session.destroy((err: Error) => {
      //   if (err) {
      //     return sendBadRequest(req, res, err.message || 'Failed to destroy session');
      //   }
      //   ApiLoggingClass.instance.logInfo(`Session Destroyed: ${req.sessionId}`);
      // });
      logRequest({ message: 'No refresh token.', req, type: 'Failed refreshTokens' })
      return sendUnauthorized(req, res, 'No refresh token.')
    }

    const userId = await TokenService.isRefreshValid(refreshToken)
    if (!userId) {
      CookeiService.clearCookie(res, AUTH_TOKEN_NAMES.REFRESH)
      logRequest({ message: 'Invalid token.', req, type: 'Failed refreshTokens' })
      return sendUnauthorized(req, res, 'Invalid token.')
    }

    const tokens = TokenService.generateTokens(userId as string)
    if (tokens.refreshToken) {
      CookeiService.setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExp)
      try {
        await UserModel.updateRefreshToken(userId as string, tokens.refreshToken)
        return sendOK(req, res, {
          accessToken: tokens.accessToken,
        })
      } catch (err) {
        logRequest({ message: (err as Error)?.message, req, type: 'Failed refreshTokens' })
        ApiLoggingClass.instance.logError(err)
      }
    }

    logRequest({ message: 'Could not refresh the token.', req, type: 'Failed refreshTokens' })
    sendBadRequest(req, res, 'Could not refresh the token.')
  },

  rejectDevice: async (req: Request, res: Response) => {
    logRequest({ req, type: 'rejectDevice' })
    try {
      const service = new DevicesService()
      const { token } = req.params as { token: string }
      const result = await service.rejectDevice(token)
      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed rejectDevice' })
      sendBadRequest(req, res, err.message)
    }
  },

  sendOtpById: async (req: Request, res: Response) => {
    logRequest({ req, type: 'sendOtpById' })
    try {
      const { id, type } = req.body as { id: string; type: 'PHONE' | 'EMAIL' }
      const service = new AuthService()
      const result = await service.sentOtpById(id, type)

      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed sendOtpById' })
      sendBadRequest(req, res, err.message)
    }
  },

  sendOtpToEmail: async (req: Request, res: Response) => {
    logRequest({ req, type: 'sendOtpToEmail' })
    try {
      const { email, strict } = req.body as { email: string; strict?: boolean }
      const service = new AuthService()
      const result = await service.sendOtpToEmail(email, strict)

      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed sendOtpToEmail' })
      sendBadRequest(req, res, err.message)
    }
  },

  sendOtpToPhone: async (req: Request, res: Response) => {
    logRequest({ req, type: 'sendOtpToPhone' })
    try {
      const { phone, regionCode, strict } = req.body as {
        phone: string
        regionCode?: string
        strict?: boolean
      }
      const service = new AuthService()
      const result = await service.sendOtpToPhone(phone, regionCode, strict)

      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed sendOtpToPhone' })
      sendBadRequest(req, res, err.message)
    }
  },

  validateEmail: async (req: Request, res: Response) => {
    logRequest({ req, type: 'validateEmail' })
    try {
      const { token } = req.params as { token: string }
      const service = new AuthService()
      const result = await service.validateEmail(token)

      sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed validateEmail' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type AuthControllerType = typeof AuthController
