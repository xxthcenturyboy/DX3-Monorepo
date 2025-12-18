jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
jest.mock('../../redis', () => require('../../testing/mocks/internal/redis.mock'))

// Unmock OtpService to test real implementation
jest.unmock('./otp.service')

import { TEST_COUNTRY_CODE, TEST_EMAIL, TEST_PHONE, TEST_UUID } from '@dx3/test-data'

import { ApiLoggingClass } from '../../logger'
import { RedisService } from '../../redis'
import { UserModel } from '../../user/user-api.postgres-model'
import { OtpService } from './otp.service'
import { OtpCodeCache } from './otp-code.redis-cache'

// Mock UserModel
jest.mock('../../user/user-api.postgres-model')
// Mock OtpCodeCache
jest.mock('./otp-code.redis-cache')

describe('OtpService', () => {
  let redisService: RedisService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
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
    jest.clearAllMocks()
  })

  afterAll(async () => {
    // Close Redis connection to prevent hanging
    if (redisService?.cacheHandle) {
      await redisService.cacheHandle.quit()
    }
  })

  it('should exist', () => {
    expect(OtpService).toBeDefined()
  })

  describe('generateOptCode', () => {
    test('should exist', async () => {
      // arrange
      // act
      // assert
      expect(OtpService.generateOptCode).toBeDefined()
    })
  })

  describe('validateOptCode', () => {
    test('should exist', async () => {
      // arrange
      // act
      // assert
      expect(OtpService.validateOptCode).toBeDefined()
    })

    test('should throw error when userId is not provided', async () => {
      // arrange & act & assert
      await expect(OtpService.validateOptCode('', '123456')).rejects.toThrow('Insufficient data.')
    })

    test('should throw error when code is not provided', async () => {
      // arrange & act & assert
      await expect(OtpService.validateOptCode(TEST_UUID, '')).rejects.toThrow('Insufficient data.')
    })

    test('should return false when user not found', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue(null)
      // act
      const result = await OtpService.validateOptCode(TEST_UUID, '123456')
      // assert
      expect(result).toBe(false)
    })

    test('should return false when account is locked', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: true,
      })
      // act
      const result = await OtpService.validateOptCode(TEST_UUID, '123456')
      // assert
      expect(result).toBe(false)
    })

    test('should validate phone OTP when phone exists', async () => {
      // arrange
      const mockCacheInstance = {
        validateEmailOtp: jest.fn().mockResolvedValue(false),
        validatePhoneOtp: jest.fn().mockResolvedValue(true),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
        getDefaultEmailModel: jest.fn().mockResolvedValue({
          email: TEST_EMAIL,
        }),
        getDefaultPhoneModel: jest.fn().mockResolvedValue({
          countryCode: TEST_COUNTRY_CODE,
          phone: TEST_PHONE,
          regionCode: 'US',
        }),
      })
      // act
      const result = await OtpService.validateOptCode(TEST_UUID, '123456')
      // assert
      expect(result).toBe(true)
      expect(mockCacheInstance.validatePhoneOtp).toHaveBeenCalledWith(
        '123456',
        TEST_COUNTRY_CODE,
        TEST_PHONE,
      )
    })

    test('should validate email OTP when phone validation fails', async () => {
      // arrange
      const mockCacheInstance = {
        validateEmailOtp: jest.fn().mockResolvedValue(true),
        validatePhoneOtp: jest.fn().mockResolvedValue(false),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
        getDefaultEmailModel: jest.fn().mockResolvedValue({
          email: TEST_EMAIL,
        }),
        getDefaultPhoneModel: jest.fn().mockResolvedValue({
          countryCode: TEST_COUNTRY_CODE,
          phone: TEST_PHONE,
          regionCode: 'US',
        }),
      })
      // act
      const result = await OtpService.validateOptCode(TEST_UUID, '123456')
      // assert
      expect(result).toBe(true)
      expect(mockCacheInstance.validateEmailOtp).toHaveBeenCalledWith('123456', TEST_EMAIL)
    })

    test('should throw error when no default email found', async () => {
      // arrange
      const mockCacheInstance = {
        validatePhoneOtp: jest.fn().mockResolvedValue(false),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
        getDefaultEmailModel: jest.fn().mockResolvedValue(null),
        getDefaultPhoneModel: jest.fn().mockResolvedValue(null),
      })
      // act
      const result = await OtpService.validateOptCode(TEST_UUID, '123456')
      // assert
      expect(result).toBe(false)
    })
  })

  describe('validateOptCodeByEmail', () => {
    test('should exist', () => {
      // arrange & act & assert
      expect(OtpService.validateOptCodeByEmail).toBeDefined()
    })

    test('should throw error when email is not provided', async () => {
      // arrange & act & assert
      await expect(OtpService.validateOptCodeByEmail(TEST_UUID, '', '123456')).rejects.toThrow(
        'Insufficient data.',
      )
    })

    test('should throw error when code is not provided', async () => {
      // arrange & act & assert
      await expect(OtpService.validateOptCodeByEmail(TEST_UUID, TEST_EMAIL, '')).rejects.toThrow(
        'Insufficient data.',
      )
    })

    test('should return false when user not found', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue(null)
      // act
      const result = await OtpService.validateOptCodeByEmail(TEST_UUID, TEST_EMAIL, '123456')
      // assert
      expect(result).toBe(false)
    })

    test('should return false when account is locked', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: true,
      })
      // act
      const result = await OtpService.validateOptCodeByEmail(TEST_UUID, TEST_EMAIL, '123456')
      // assert
      expect(result).toBe(false)
    })

    test('should validate email OTP successfully', async () => {
      // arrange
      const mockCacheInstance = {
        validateEmailOtp: jest.fn().mockResolvedValue(true),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
      })
      // act
      const result = await OtpService.validateOptCodeByEmail(TEST_UUID, TEST_EMAIL, '123456')
      // assert
      expect(result).toBe(true)
      expect(mockCacheInstance.validateEmailOtp).toHaveBeenCalledWith('123456', TEST_EMAIL)
    })
  })

  describe('validateOptCodeByPhone', () => {
    test('should exist', () => {
      // arrange & act & assert
      expect(OtpService.validateOptCodeByPhone).toBeDefined()
    })

    test('should throw error when nationalNumber is not provided', async () => {
      // arrange & act & assert
      await expect(
        OtpService.validateOptCodeByPhone(TEST_UUID, TEST_COUNTRY_CODE, '', '123456'),
      ).rejects.toThrow('Insufficient data.')
    })

    test('should throw error when code is not provided', async () => {
      // arrange & act & assert
      await expect(
        OtpService.validateOptCodeByPhone(TEST_UUID, TEST_COUNTRY_CODE, TEST_PHONE, ''),
      ).rejects.toThrow('Insufficient data.')
    })

    test('should return false when user not found', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue(null)
      // act
      const result = await OtpService.validateOptCodeByPhone(
        TEST_UUID,
        TEST_COUNTRY_CODE,
        TEST_PHONE,
        '123456',
      )
      // assert
      expect(result).toBe(false)
    })

    test('should return false when account is locked', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: true,
      })
      // act
      const result = await OtpService.validateOptCodeByPhone(
        TEST_UUID,
        TEST_COUNTRY_CODE,
        TEST_PHONE,
        '123456',
      )
      // assert
      expect(result).toBe(false)
    })

    test('should validate phone OTP successfully', async () => {
      // arrange
      const mockCacheInstance = {
        validatePhoneOtp: jest.fn().mockResolvedValue(true),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
      })
      // act
      const result = await OtpService.validateOptCodeByPhone(
        TEST_UUID,
        TEST_COUNTRY_CODE,
        TEST_PHONE,
        '123456',
      )
      // assert
      expect(result).toBe(true)
      expect(mockCacheInstance.validatePhoneOtp).toHaveBeenCalledWith(
        '123456',
        TEST_COUNTRY_CODE,
        TEST_PHONE,
      )
    })
  })

  describe('generateOptCode', () => {
    test('should return OTP code for phone when phone exists', async () => {
      // arrange
      const mockOtpCode = '123456'
      const mockCacheInstance = {
        setPhoneOtp: jest.fn().mockResolvedValue(mockOtpCode),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
        getDefaultPhoneModel: jest.fn().mockResolvedValue({
          countryCode: TEST_COUNTRY_CODE,
          phone: TEST_PHONE,
        }),
      })
      // act
      const result = await OtpService.generateOptCode(TEST_UUID)
      // assert
      expect(result).toBe(mockOtpCode)
      expect(mockCacheInstance.setPhoneOtp).toHaveBeenCalledWith(TEST_COUNTRY_CODE, TEST_PHONE)
    })

    test('should return OTP code for email when phone does not exist', async () => {
      // arrange
      const mockOtpCode = '654321'
      const mockCacheInstance = {
        setEmailOtp: jest.fn().mockResolvedValue(mockOtpCode),
      }
      ;(OtpCodeCache as jest.Mock).mockImplementation(() => mockCacheInstance)

      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: false,
        getDefaultEmailModel: jest.fn().mockResolvedValue({
          email: TEST_EMAIL,
        }),
        getDefaultPhoneModel: jest.fn().mockResolvedValue(null),
      })
      // act
      const result = await OtpService.generateOptCode(TEST_UUID)
      // assert
      expect(result).toBe(mockOtpCode)
      expect(mockCacheInstance.setEmailOtp).toHaveBeenCalledWith(TEST_EMAIL)
    })

    test('should return undefined when user not found', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue(null)
      // act
      const result = await OtpService.generateOptCode(TEST_UUID)
      // assert
      expect(result).toBeUndefined()
    })

    test('should return undefined when account is locked', async () => {
      // arrange
      UserModel.findByPk = jest.fn().mockResolvedValue({
        accountLocked: true,
      })
      // act
      const result = await OtpService.generateOptCode(TEST_UUID)
      // assert
      expect(result).toBeUndefined()
    })
  })
})
