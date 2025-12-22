import jwt from 'jsonwebtoken'

import { APP_DOMAIN, type JwtPayloadType, TOKEN_TYPE } from '@dx3/models-shared'
import { DxDateUtilClass } from '@dx3/utils-shared'

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../config/config-api.consts'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import type { GenerateTokenParams, GenerateTokenResponse, TokenExpiration } from './token.types'

export class TokenService {
  public static issuer = `accounts.${APP_DOMAIN}`
  public static audience = 'dx3-api'

  private static getExpiresIn(time: number, unit: string): string {
    const unitMap: Record<string, string> = {
      day: 'd',
      days: 'd',
      hour: 'h',
      hours: 'h',
      minute: 'm',
      minutes: 'm',
      second: 's',
      seconds: 's',
      year: 'y',
      years: 'y',
    }

    const abbreviation = unitMap[unit] || 's'
    return `${time}${abbreviation}`
  }

  public static generateTokens(
    userId: string,
    params?: GenerateTokenParams,
  ): GenerateTokenResponse {
    const accessExpOptions: TokenExpiration = params?.accessToken
      ? params?.accessToken
      : {
          addSub: 'ADD',
          time: 30,
          unit: 'minutes',
        }
    const refreshExpOptions: TokenExpiration = params?.refreshToken
      ? params?.refreshToken
      : {
          addSub: 'ADD',
          time: 2,
          unit: 'days',
        }

    const accessTokenExp = DxDateUtilClass.getTimestamp(
      accessExpOptions.time,
      accessExpOptions.unit,
      accessExpOptions.addSub,
    )

    // Access token uses dedicated secret and includes type claim
    const accessToken = jwt.sign(
      {
        _id: userId,
        aud: TokenService.audience,
        issuer: TokenService.issuer,
        type: TOKEN_TYPE.ACCESS,
      },
      JWT_ACCESS_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: TokenService.getExpiresIn(
          accessExpOptions.time,
          accessExpOptions.unit,
        ) as jwt.SignOptions['expiresIn'],
      },
    )

    const refreshTokenExp = DxDateUtilClass.getTimestamp(
      refreshExpOptions.time,
      refreshExpOptions.unit,
      refreshExpOptions.addSub,
    )

    // Refresh token uses separate secret and includes type claim
    const refreshToken = jwt.sign(
      {
        _id: userId,
        aud: TokenService.audience,
        issuer: TokenService.issuer,
        type: TOKEN_TYPE.REFRESH,
      },
      JWT_REFRESH_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: TokenService.getExpiresIn(
          refreshExpOptions.time,
          refreshExpOptions.unit,
        ) as jwt.SignOptions['expiresIn'],
      },
    )

    return {
      accessToken,
      accessTokenExp,
      refreshToken,
      refreshTokenExp,
    }
  }

  /**
   * Extracts user ID from an access token.
   * Uses the access secret and validates token type.
   */
  public static getUserIdFromToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
        audience: TokenService.audience,
      }) as JwtPayloadType

      // Verify this is an access token, not a refresh token
      if (payload.type && payload.type !== TOKEN_TYPE.ACCESS) {
        ApiLoggingClass.instance.logError('Invalid token type: expected access token')
        return ''
      }

      return payload._id || ''
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
    }
    return ''
  }

  /**
   * Extracts user ID from a refresh token.
   * Uses the refresh secret and validates token type.
   */
  public static getUserIdFromRefreshToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
        audience: TokenService.audience,
      }) as JwtPayloadType

      // Verify this is a refresh token, not an access token
      if (payload.type && payload.type !== TOKEN_TYPE.REFRESH) {
        ApiLoggingClass.instance.logError('Invalid token type: expected refresh token')
        return ''
      }

      return payload._id || ''
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
    }
    return ''
  }

  public static async isRefreshValid(refreshToken: string): Promise<string | boolean> {
    try {
      const user = await UserModel.getByRefreshToken(refreshToken)
      if (!user) {
        // Use the refresh-specific method for proper token validation
        const userId = TokenService.getUserIdFromRefreshToken(refreshToken)
        if (!userId) {
          return false
        }

        // This user has been hacked - clear all tokens
        await UserModel.clearRefreshTokens(userId)
        return false
      }

      return user.id
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
      return false
    }
  }
}

export type TokenServiceType = typeof TokenService.prototype
