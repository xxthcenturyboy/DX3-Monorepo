import type { NextFunction, Request, Response } from 'express'

import { AUTH_TOKEN_NAMES, ERROR_CODES } from '@dx3/models-shared'

import { CookeiService } from '../../cookies/cookie.service'
import { HeaderService } from '../../headers/header.service'
import { sendForbiddenWithCode } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import { createApiErrorMessage } from '../../utils/lib/error/api-error.utils'
import { TokenService } from '../tokens/token.service'

export async function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  try {
    const token = HeaderService.getTokenFromRequest(req)
    if (!token) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_TOKEN_INVALID, 'No authentication token provided.'),
      )
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token invalid or expired.'),
      )
    }

    req.user = await UserModel.getUserSessionData(userId)

    next()
  } catch (err) {
    const msg = err.message || err
    // CookeiService.clearCookies(res);
    ApiLoggingClass.instance.logError(`Failed to authenticate tokens: ${msg}`)
    sendForbiddenWithCode(req, res, ERROR_CODES.AUTH_TOKEN_INVALID, msg)
  }
}

export async function ensureLoggedInMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const token = CookeiService.getCookie(req, AUTH_TOKEN_NAMES.REFRESH)
    if (!token) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_TOKEN_INVALID, 'No authentication token provided.'),
      )
    }

    const userId = TokenService.getUserIdFromRefreshToken(token)
    if (!userId) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.AUTH_TOKEN_INVALID, 'Token invalid or expired.'),
      )
    }

    req.user = await UserModel.getUserSessionData(userId)

    next()
  } catch (err) {
    const msg = err.message || err
    // CookeiService.clearCookies(res);
    ApiLoggingClass.instance.logError(`Failed to authenticate tokens: ${msg}`)
    sendForbiddenWithCode(req, res, ERROR_CODES.AUTH_TOKEN_INVALID, msg)
  }
}
