import type { CookieOptions, Request, Response } from 'express'

import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'

import { isLocal } from '../config/config-api.service'

export class CookeiService {
  public static setCookies(
    res: Response,
    hasAccountBeenSecured: boolean,
    refreshToken: string,
    refreshTokenExpTimestamp: number,
  ) {
    res.cookie(AUTH_TOKEN_NAMES.ACCTSECURE, hasAccountBeenSecured, {
      httpOnly: true,
      secure: !isLocal(),
    })

    CookeiService.setRefreshCookie(res, refreshToken, refreshTokenExpTimestamp)
    // res.cookie(
    //   AUTH_TOKEN_NAMES.REFRESH,
    //   refreshToken,
    //   {
    //     httpOnly: true,
    //     maxAge: refreshTokenExpTimestamp * 1000,
    //     secure: true
    //   }
    // );
  }

  public static setRefreshCookie(res: Response, refreshToken: string, exp: number) {
    res.cookie(AUTH_TOKEN_NAMES.REFRESH, refreshToken, {
      httpOnly: true,
      maxAge: exp * 1000,
      secure: !isLocal(),
    })
  }

  public static setCookie(
    res: Response,
    cookeiName: string,
    cookieValue: string,
    cookieOptions: CookieOptions,
  ) {
    if (res) {
      res.cookie(cookeiName, cookieValue, cookieOptions)

      return true
    }

    return false
  }

  public static getCookie(req: Request, cookeiName: string): string {
    const cookie = req?.cookies[cookeiName]
    return cookie || ''
  }

  public static clearCookies(res: Response) {
    if (res) {
      const options = {
        httpOnly: true,
      }

      res.clearCookie(AUTH_TOKEN_NAMES.ACCTSECURE, options)
      // res.clearCookie(AUTH_TOKEN_NAMES.AUTH, options);
      res.clearCookie(AUTH_TOKEN_NAMES.REFRESH, options)
      // res.clearCookie(AUTH_TOKEN_NAMES.EXP, options);

      return true
    }

    return false
  }

  public static clearCookie(res: Response, cookeiName: string) {
    if (res) {
      const options = {
        httpOnly: true,
      }

      res.clearCookie(cookeiName, options)

      return true
    }

    return false
  }
}

export type CookeiServiceType = typeof CookeiService.prototype
