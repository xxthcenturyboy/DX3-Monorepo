import type { CookieOptions, Request, Response } from 'express'

import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'

import { isLocal } from '../config/config-api.service'

export class CookeiService {
  /**
   * Returns secure cookie options with SameSite attribute.
   * Uses 'lax' for SameSite to:
   * - Allow top-level navigation (OAuth redirects, link clicks)
   * - Protect against CSRF attacks on cross-origin POST requests
   * - Work correctly in both local development (HTTP) and production (HTTPS)
   */
  private static getSecureCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: !isLocal(),
    }
  }

  public static setCookies(
    res: Response,
    hasAccountBeenSecured: boolean,
    refreshToken: string,
    refreshTokenExpTimestamp: number,
  ) {
    res.cookie(AUTH_TOKEN_NAMES.ACCTSECURE, hasAccountBeenSecured, {
      ...CookeiService.getSecureCookieOptions(),
    })

    CookeiService.setRefreshCookie(res, refreshToken, refreshTokenExpTimestamp)
  }

  public static setRefreshCookie(res: Response, refreshToken: string, exp: number) {
    res.cookie(AUTH_TOKEN_NAMES.REFRESH, refreshToken, {
      ...CookeiService.getSecureCookieOptions(),
      maxAge: exp * 1000,
    })
  }

  public static setCookie(
    res: Response,
    cookeiName: string,
    cookieValue: string,
    cookieOptions: CookieOptions,
  ) {
    if (res) {
      // Merge provided options with secure defaults
      const secureOptions: CookieOptions = {
        ...CookeiService.getSecureCookieOptions(),
        ...cookieOptions,
      }
      res.cookie(cookeiName, cookieValue, secureOptions)

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
      const options = CookeiService.getSecureCookieOptions()

      res.clearCookie(AUTH_TOKEN_NAMES.ACCTSECURE, options)
      res.clearCookie(AUTH_TOKEN_NAMES.REFRESH, options)

      return true
    }

    return false
  }

  public static clearCookie(res: Response, cookeiName: string) {
    if (res) {
      const options = CookeiService.getSecureCookieOptions()

      res.clearCookie(cookeiName, options)

      return true
    }

    return false
  }
}

export type CookeiServiceType = typeof CookeiService.prototype
