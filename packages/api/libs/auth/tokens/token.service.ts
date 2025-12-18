import jwt from 'jsonwebtoken'

import { APP_DOMAIN, type JwtPayloadType } from '@dx3/models-shared'
import { DxDateUtilClass } from '@dx3/utils-shared'

import { JWT_SECRET } from '../../config/config-api.consts'
import { ApiLoggingClass } from '../../logger'
import { UserModel } from '../../user/user-api.postgres-model'
import type { GenerateTokenParams, GenerateTokenResponse, TokenExpiration } from './token.types'

export class TokenService {
  public static issuer = `accounts.${APP_DOMAIN}`

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
          // time: 10,
          // unit: 'seconds',
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
    const accessToken = jwt.sign(
      {
        _id: userId,
        issuer: TokenService.issuer,
        // sub: randomId().toString()
      },
      JWT_SECRET,
      {
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
    const refreshToken = jwt.sign(
      {
        _id: userId,
        issuer: TokenService.issuer,
        // sub: randomId().toString()
      },
      JWT_SECRET,
      {
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

  public static getUserIdFromToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadType
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
        const userId = TokenService.getUserIdFromToken(refreshToken)
        if (!userId) {
          return false
        }

        // this user has been hacked
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
