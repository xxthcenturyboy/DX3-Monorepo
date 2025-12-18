import type { Request as IRequest, Response as IResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { RedisService } from '@dx3/api-libs/redis'

import { DxRateLimiters } from './rate-limiters.dx'

jest.mock('@dx3/api-libs/http-response/http-responses.ts', () => ({
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
  sendTooManyRequests: jest.fn(),
}))

describe('DxRateLimiters', () => {
  let _req: IRequest
  let _res: IResponse
  let redisService: RedisService

  beforeAll(async () => {
    redisService = new RedisService({
      isLocal: true,
      redis: {
        port: 6379,
        prefix: 'dx',
        url: 'redis://redis',
      },
    })
  })

  beforeEach(() => {
    _req = new Request() as unknown as IRequest
    _res = new Response() as unknown as IResponse
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    // Close Redis connection to prevent hanging
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DxRateLimiters).toBeDefined()
  })

  describe('authLookup', () => {
    test('should exist on the class', async () => {
      // arrange
      // act
      // assert
      expect(DxRateLimiters.authLookup).toBeDefined()
    })
  })

  describe('login', () => {
    test('should exist on the class', async () => {
      // arrange
      // act
      // assert
      expect(DxRateLimiters.standard).toBeDefined()
    })
  })

  describe('login', () => {
    test('should exist on the class', async () => {
      // arrange
      // act
      // assert
      expect(DxRateLimiters.strict).toBeDefined()
    })
  })

  describe('veryStrict', () => {
    test('should exist on the class', async () => {
      // arrange
      // act
      // assert
      expect(DxRateLimiters.veryStrict).toBeDefined()
    })
  })
})
