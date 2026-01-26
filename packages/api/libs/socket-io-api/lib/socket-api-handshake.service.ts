import type {
  // @ts-expect-error - this is for typing - no impact
  Handshake,
} from 'socket.io/dist/socket'

import { regexUuid } from '@dx3/utils-shared'

import { TokenService } from '../../auth/tokens/token.service'
import { HeaderService } from '../../headers/header.service'
import { ApiLoggingClass } from '../../logger'

export function getUserIdFromHandshake(handshake: Handshake): string {
  try {
    const token = HeaderService.getTokenFromHandshake(handshake)
    if (!token) {
      throw new Error('No Token in handshake.')
    }

    const userId = TokenService.getUserIdFromToken(token)
    if (!userId || regexUuid.test(userId) === false) {
      throw new Error('Token invalid or expired from handshake.')
    }

    return userId
  } catch (err) {
    const msg = err.message || err
    ApiLoggingClass.instance.logError(`Failed to get userId from handshake: ${msg}`)
    return ''
  }
}

export function ensureLoggedInSocket(handshake: Handshake) {
  try {
    const userId = getUserIdFromHandshake(handshake)
    return !!userId
  } catch (err) {
    const msg = err.message || err
    ApiLoggingClass.instance.logError(`Failed to authenticate socket token: ${msg}`)
    return false
  }
}

export async function getUserRolesFromHandshake(handshake: Handshake): Promise<string[]> {
  try {
    const userId = getUserIdFromHandshake(handshake)
    if (!userId) {
      return []
    }

    // Import here to avoid circular dependency
    const { UserModel } = await import('../../user/user-api.postgres-model')
    const user = await UserModel.findByPk(userId, { attributes: ['roles'] })
    return user?.roles || []
  } catch (err) {
    const msg = err.message || err
    ApiLoggingClass.instance.logError(`Failed to get roles from handshake: ${msg}`)
    return []
  }
}
