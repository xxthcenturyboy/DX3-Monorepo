import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'

jest.mock('../config/config-api.service', () => ({
  isDev: jest.fn().mockReturnValue(false),
}))

// Bypass global cookie mock from setupAllMocks; use real implementation
const { CookeiService } = jest.requireActual<typeof import('./cookie.service')>('./cookie.service')

describe('CookeiService', () => {
  let req: IRequest
  let res: IResponse

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('setCookies', () => {
    it('should set ACCTSECURE and refresh cookies on response', () => {
      CookeiService.setCookies(res, true, 'refresh-token-123', 1234567890)

      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_TOKEN_NAMES.ACCTSECURE,
        true,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
        }),
      )
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_TOKEN_NAMES.REFRESH,
        'refresh-token-123',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 1234567890000,
          sameSite: 'lax',
          secure: true,
        }),
      )
    })
  })

  describe('setRefreshCookie', () => {
    it('should set refresh cookie with maxAge from exp timestamp', () => {
      CookeiService.setRefreshCookie(res, 'token-xyz', 1000)

      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_TOKEN_NAMES.REFRESH,
        'token-xyz',
        expect.objectContaining({
          maxAge: 1000000,
        }),
      )
    })
  })

  describe('setCookie', () => {
    it('should set cookie with merged options when res is provided', () => {
      const result = CookeiService.setCookie(res, 'my-cookie', 'my-value', { path: '/api' })

      expect(result).toBe(true)
      expect(res.cookie).toHaveBeenCalledWith(
        'my-cookie',
        'my-value',
        expect.objectContaining({
          httpOnly: true,
          path: '/api',
          sameSite: 'lax',
          secure: true,
        }),
      )
    })

    it('should return false when res is null', () => {
      const result = CookeiService.setCookie(
        null as unknown as IResponse,
        'my-cookie',
        'my-value',
        {},
      )

      expect(result).toBe(false)
      expect(res.cookie).not.toHaveBeenCalled()
    })
  })

  describe('getCookie', () => {
    it('should return cookie value when present', () => {
      req.cookies = { 'my-cookie': 'cookie-value' }

      const result = CookeiService.getCookie(req, 'my-cookie')

      expect(result).toBe('cookie-value')
    })

    it('should return empty string when cookie is missing', () => {
      req.cookies = {}

      const result = CookeiService.getCookie(req, 'missing-cookie')

      expect(result).toBe('')
    })

    it('should return empty string when req.cookies is undefined', () => {
      req.cookies = undefined as unknown as Record<string, string>

      const result = CookeiService.getCookie(req, 'any')

      expect(result).toBe('')
    })
  })

  describe('clearCookies', () => {
    it('should clear ACCTSECURE and REFRESH cookies when res is provided', () => {
      const result = CookeiService.clearCookies(res)

      expect(result).toBe(true)
      expect(res.clearCookie).toHaveBeenCalledWith(AUTH_TOKEN_NAMES.ACCTSECURE, expect.any(Object))
      expect(res.clearCookie).toHaveBeenCalledWith(AUTH_TOKEN_NAMES.REFRESH, expect.any(Object))
    })

    it('should return false when res is null', () => {
      const result = CookeiService.clearCookies(null as unknown as IResponse)

      expect(result).toBe(false)
    })
  })

  describe('clearCookie', () => {
    it('should clear named cookie when res is provided', () => {
      const result = CookeiService.clearCookie(res, 'my-cookie')

      expect(result).toBe(true)
      expect(res.clearCookie).toHaveBeenCalledWith('my-cookie', expect.any(Object))
    })

    it('should return false when res is null', () => {
      const result = CookeiService.clearCookie(null as unknown as IResponse, 'my-cookie')

      expect(result).toBe(false)
    })
  })
})
