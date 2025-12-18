import type { NextFunction, Request, Response } from 'express'

import { USER_ROLE } from '@dx3/models-shared'

import { HeaderService } from '../../headers/header.service'
import { sendUnauthorized } from '../../http-response/http-responses'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import { TokenService } from '../tokens/token.service'

export async function userHasRole(userId: string, role: string): Promise<boolean> {
  try {
    return await UserModel.userHasRole(userId, role)
  } catch (err) {
    ApiLoggingClass.instance.logError((err as Error).message || 'Error checking user role.')
    return false
  }
}

export async function hasAdminRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = HeaderService.getTokenFromRequest(req)
    if (!token) {
      throw new Error('No Token')
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Token invalid or expired.')
    }
    const hasSuperAdminRole = await userHasRole(userId, USER_ROLE.SUPER_ADMIN)
    if (hasSuperAdminRole) {
      next()
      return
    }

    const hasRole = await UserModel.userHasRole(userId, USER_ROLE.ADMIN)
    if (!hasRole) {
      throw new Error('User is not authorized for this activity.')
    }

    next()
  } catch (err) {
    const msg = (err as Error).message || 'Error checking admin role.'
    ApiLoggingClass.instance.logError(msg)
    sendUnauthorized(req, res, msg)
  }
}

export async function hasSuperAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new Error('No Auth Headers Sent.')
    }

    const token = authHeader.split('Bearer ')[1]
    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Token invalid or expired.')
    }

    const hasRole = await userHasRole(userId, USER_ROLE.SUPER_ADMIN)

    if (!hasRole) {
      throw new Error('User is not authorized for this activity.')
    }

    next()
  } catch (err) {
    const msg = (err as Error).message || 'Error checking super admin role.'
    ApiLoggingClass.instance.logError(msg)
    sendUnauthorized(req, res, msg)
  }
}
