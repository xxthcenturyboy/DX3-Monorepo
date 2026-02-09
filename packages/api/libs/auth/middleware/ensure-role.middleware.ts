import type { NextFunction, Request, Response } from 'express'

import { hasRoleOrHigher, USER_ROLE } from '@dx3/models-shared'

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

/**
 * Check if user has the required role or higher using the role hierarchy.
 * Uses the USER_ROLE_ORDER to determine if user's role is at or above the required level.
 */
export async function userHasRoleOrHigher(userId: string, requiredRole: string): Promise<boolean> {
  try {
    const userRoles = await UserModel.getUserRoles(userId)
    return hasRoleOrHigher(userRoles, requiredRole)
  } catch (err) {
    ApiLoggingClass.instance.logError(
      (err as Error).message || 'Error checking user role hierarchy.',
    )
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

/**
 * Middleware to check if user has LOGGING_ADMIN role or higher (SUPER_ADMIN).
 * Required for accessing centralized logging dashboard and log queries.
 */
export async function hasLoggingAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = HeaderService.getTokenFromRequest(req)
    if (!token) {
      throw new Error('No authentication token provided.')
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Token invalid or expired.')
    }

    const hasRole = await userHasRoleOrHigher(userId, USER_ROLE.LOGGING_ADMIN)
    if (!hasRole) {
      throw new Error('User is not authorized to access logging administration.')
    }

    next()
  } catch (err) {
    const msg = (err as Error).message || 'Error checking logging admin role.'
    ApiLoggingClass.instance.logError(msg)
    sendUnauthorized(req, res, msg)
  }
}

/**
 * Middleware to check if user has EDITOR role or higher (ADMIN, METRICS_ADMIN, LOGGING_ADMIN, SUPER_ADMIN).
 * Required for blog/content management.
 */
export async function hasEditorRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = HeaderService.getTokenFromRequest(req)
    if (!token) {
      throw new Error('No authentication token provided.')
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Token invalid or expired.')
    }

    const hasRole = await userHasRoleOrHigher(userId, USER_ROLE.EDITOR)
    if (!hasRole) {
      throw new Error('User is not authorized to access blog administration.')
    }

    next()
  } catch (err) {
    const msg = (err as Error).message || 'Error checking editor role.'
    ApiLoggingClass.instance.logError(msg)
    sendUnauthorized(req, res, msg)
  }
}

/**
 * Middleware to check if user has METRICS_ADMIN role or higher (LOGGING_ADMIN, SUPER_ADMIN).
 * Required for accessing metrics and analytics dashboards.
 */
export async function hasMetricsAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = HeaderService.getTokenFromRequest(req)
    if (!token) {
      throw new Error('No authentication token provided.')
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId) {
      throw new Error('Token invalid or expired.')
    }

    const hasRole = await userHasRoleOrHigher(userId, USER_ROLE.METRICS_ADMIN)
    if (!hasRole) {
      throw new Error('User is not authorized to access metrics administration.')
    }

    next()
  } catch (err) {
    const msg = (err as Error).message || 'Error checking metrics admin role.'
    ApiLoggingClass.instance.logError(msg)
    sendUnauthorized(req, res, msg)
  }
}
