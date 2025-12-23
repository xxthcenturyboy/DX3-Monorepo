import { TEST_EMAIL, TEST_PHONE_2, TEST_PHONE_COUNTRY_CODE } from '@dx3/test-data'

import { getRedisConfig } from '../../config/config-api'
import { ApiLoggingClass } from '../../logger'
import { RedisService } from '../../redis'
import { OtpCodeCache, type OtpCodeCacheType } from './otp-code.redis-cache'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
// Note: We don't mock redis here because this test needs real RedisService
// behavior for testing OTP cache operations. The ioredis module is mocked via
// __mocks__/ioredis.ts using ioredis-mock which provides full redis functionality.
jest.unmock('./otp-code.redis-cache')

describe('OtpCodeCache', () => {
  let cache: OtpCodeCacheType
  let otpEmail: string
  let otpPhone: string
  let redisService: RedisService

  beforeAll(async () => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    const redisConfig = getRedisConfig()
    redisService = new RedisService({
      isDev: true,
      redis: redisConfig,
    })
  })

  beforeEach(() => {
    cache = new OtpCodeCache()
  })

  afterAll(async () => {
    // Close Redis connection to prevent hanging
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(OtpCodeCache).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    // assert
    expect(cache).toBeDefined()
  })

  describe('setEmailOtp', () => {
    test('should return false no data is passed', async () => {
      // arrange
      // act
      const result = await cache.setEmailOtp('')
      // assert
      expect(result).toBeFalsy()
    })
    test('should set to Cache and get OTP code when invoked', async () => {
      // arrange
      // act
      otpEmail = await cache.setEmailOtp(TEST_EMAIL)
      // assert
      expect(otpEmail).toBeTruthy()
    })
  })

  describe('setPhoneOtp', () => {
    test('should return false no data is passed', async () => {
      // arrange
      // act
      const result = await cache.setPhoneOtp('', '')
      // assert
      expect(result).toBeFalsy()
    })
    test('should set to Cache and get OTP code when invoked', async () => {
      // arrange
      // act
      otpPhone = await cache.setPhoneOtp(TEST_PHONE_COUNTRY_CODE, TEST_PHONE_2)
      // assert
      expect(otpPhone).toBeTruthy()
    })
  })

  describe('validateEmailOtp', () => {
    test('return false when code not passed', async () => {
      // arrange
      // act
      const result = await cache.validateEmailOtp('', TEST_EMAIL)
      // assert
      expect(result).toBe(false)
    })
    test('should return false when code is incorrect', async () => {
      // arrange
      // act
      const result = await cache.validateEmailOtp('OU812', TEST_EMAIL)
      // assert
      expect(result).toBe(false)
    })

    test('should return true when code is correct', async () => {
      // arrange
      const otpCache = new OtpCodeCache()
      // act
      const result = await otpCache.validateEmailOtp(otpEmail, TEST_EMAIL)
      // assert
      expect(result).toBe(true)
    })
  })

  describe('validatePhoneOtp', () => {
    test('return false when code not passed', async () => {
      // arrange
      // act
      const result = await cache.validatePhoneOtp('', TEST_PHONE_COUNTRY_CODE, TEST_PHONE_2)
      // assert
      expect(result).toBe(false)
    })
    test('should return false when code is incorrect', async () => {
      // arrange
      // act
      const result = await cache.validatePhoneOtp('OU812', TEST_PHONE_COUNTRY_CODE, TEST_PHONE_2)
      // assert
      expect(result).toBe(false)
    })

    test('should return true when code is correct', async () => {
      // arrange
      const otpCache = new OtpCodeCache()
      // act
      const result = await otpCache.validatePhoneOtp(
        otpPhone,
        TEST_PHONE_COUNTRY_CODE,
        TEST_PHONE_2,
      )
      // assert
      expect(result).toBe(true)
    })
  })
})
