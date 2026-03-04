import type {
  NextFunction as INextFunction,
  Request as IRequest,
  Response as IResponse,
} from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

// The global test setup (setupAllMocks) mocks DxRateLimiters to bypass rate-limiting in tests.
// This unmock ensures the spec loads the REAL implementation for behavioral coverage.
jest.unmock('./rate-limiters.dx')

import { DxRateLimiters } from './rate-limiters.dx'

jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
  sendTooManyRequests: jest.fn(),
}))
jest.mock('@dx3/api-libs/redis', () => ({
  REDIS_DELIMITER: ':',
  RedisService: jest.fn().mockImplementation(() => ({
    cacheHandle: { quit: jest.fn() },
  })),
}))
jest.mock('@dx3/api-libs/timescale/timescale.logging.service', () => ({
  LoggingService: { instance: null },
}))
jest.mock('@dx3/api-libs/timescale/timescale.logging.socket', () => ({
  AdminLogsSocketService: { instance: null },
}))

describe('DxRateLimiters', () => {
  let req: IRequest
  let res: IResponse
  let next: INextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    next = jest.fn() as unknown as INextFunction
    req.body = {}
    req.headers = {}
    req.params = {}
  })

  it('should exist when imported', () => {
    expect(DxRateLimiters).toBeDefined()
  })

  // ─── Static method existence ───────────────────────────────────────────────

  describe('authLookup', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.authLookup).toBeDefined()
    })
  })

  describe('login', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.login).toBeDefined()
    })
  })

  describe('standard', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.standard).toBeDefined()
    })
  })

  describe('strict', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.strict).toBeDefined()
    })
  })

  describe('veryStrict', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.veryStrict).toBeDefined()
    })
  })

  describe('accountCreation', () => {
    it('should exist on the class', () => {
      expect(DxRateLimiters.accountCreation).toBeDefined()
    })
  })

  // ─── keyGenStandard ────────────────────────────────────────────────────────

  describe('keyGenStandard', () => {
    it('should exist as a function on the class', () => {
      expect(typeof DxRateLimiters.keyGenStandard).toBe('function')
    })

    it('should return user ID when user is authenticated', () => {
      // arrange
      req.user = { id: 'user-abc' } as IRequest['user']
      // act
      const key = DxRateLimiters.keyGenStandard(req)
      // assert
      expect(key).toBe('user-abc')
    })

    it('should return a string fallback when user is not authenticated', () => {
      // arrange (no user, no ip set)
      // act
      const key = DxRateLimiters.keyGenStandard(req)
      // assert — should fall back to req.ip or 'unknown-ip'
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })
  })

  // ─── keyGenLogin ───────────────────────────────────────────────────────────

  describe('keyGenLogin', () => {
    it('should exist as a function on the class', () => {
      expect(typeof DxRateLimiters.keyGenLogin).toBe('function')
    })

    it('should return normalized login key from body.value', () => {
      // arrange
      req.body = { value: 'User@Example.COM' }
      // act
      const key = DxRateLimiters.keyGenLogin(req)
      // assert
      expect(key).toBe('login:user@example.com')
    })

    it('should trim whitespace in body.value', () => {
      // arrange
      req.body = { value: '  test@example.com  ' }
      // act
      const key = DxRateLimiters.keyGenLogin(req)
      // assert
      expect(key).toBe('login:test@example.com')
    })

    it('should fall back to device ID when body.value is absent', () => {
      // arrange
      req.body = { device: { uniqueDeviceId: 'device-xyz' } }
      // act
      const key = DxRateLimiters.keyGenLogin(req)
      // assert
      expect(key).toBe('login:device:device-xyz')
    })

    it('should fall back to ip prefix when body.value and device ID are both absent', () => {
      // arrange
      req.body = {}
      // act
      const key = DxRateLimiters.keyGenLogin(req)
      // assert — falls back to 'login:ip:...'
      expect(key.startsWith('login:ip:')).toBe(true)
    })
  })

  // ─── handleLimitCommon ─────────────────────────────────────────────────────

  describe('handleLimitCommon', () => {
    it('should exist as a function on the class', () => {
      expect(typeof DxRateLimiters.handleLimitCommon).toBe('function')
    })

    it('should call next() and bypass when DISABLE_RATE_LIMIT is true in dev', () => {
      // arrange
      const originalNodeEnv = process.env.NODE_ENV
      const originalDisable = process.env.DISABLE_RATE_LIMIT
      process.env.NODE_ENV = 'development'
      process.env.DISABLE_RATE_LIMIT = 'true'
      // act
      DxRateLimiters.handleLimitCommon(req, res, next, { message: 'Too many requests' })
      // assert
      expect(next).toHaveBeenCalled()
      // cleanup
      process.env.NODE_ENV = originalNodeEnv
      process.env.DISABLE_RATE_LIMIT = originalDisable
    })

    it('should call sendTooManyRequests when not in dev and rate limit is exceeded', () => {
      // arrange
      const { sendTooManyRequests } = jest.requireMock('@dx3/api-libs/http-response/http-responses')
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'
      req.originalUrl = '/api/some-endpoint'
      // act
      DxRateLimiters.handleLimitCommon(req, res, next, { message: 'Too many requests' })
      // assert
      expect(sendTooManyRequests).toHaveBeenCalled()
      // cleanup
      process.env.NODE_ENV = originalNodeEnv
    })

    it('should call sendOK for auth rate-limited routes instead of 429', () => {
      // arrange
      const { sendOK } = jest.requireMock('@dx3/api-libs/http-response/http-responses')
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'
      // AUTH_ROUTES_V1_RATE_LIMIT entries have no leading slash (e.g. 'api/auth/login')
      req.originalUrl = 'api/auth/login'
      // act
      DxRateLimiters.handleLimitCommon(req, res, next, { message: 'Rate limited' })
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({ error: expect.any(String) }),
      )
      // cleanup
      process.env.NODE_ENV = originalNodeEnv
    })
  })
})
