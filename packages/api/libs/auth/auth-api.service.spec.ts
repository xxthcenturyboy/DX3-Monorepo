import { USER_LOOKUPS } from '@dx3/models-shared'
import {
  TEST_EMAIL_ADMIN,
  TEST_PHONE_1,
  TEST_PHONE_IT_VALID,
} from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { AuthService, type AuthServiceType } from './auth-api.service'

jest.mock('@dx3/api-libs/reference-data/reference-data-api.client', () =>
  require('../testing/mocks/reference-data-api.client.mock'),
)
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

import { mockEmailModel } from '../email/email-api.postgres-model.mock'
import { mockPhoneModel } from '../phone/phone-api.postgres-model.mock'
import { mockUserProfileApi } from '../user/user-profile-api.mock'
import { mockOtpCodeCache } from './otp/otp-code.redis-cache.mock'
import { mockTokenService } from './tokens/token.service.mock'

describe('AuthService', () => {
  let authService: AuthServiceType

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    // Setup centralized mocks for unit tests
    mockOtpCodeCache()
    mockUserProfileApi()
    mockEmailModel()
    mockPhoneModel()
    mockTokenService()

    // Create service instance for unit tests
    authService = new AuthService()
  })

  describe('checkPasswordStrength', () => {
    it('should exist', () => {
      expect(authService.checkPasswordStrength).toBeDefined()
    })

    test('should throw when no password is provided', async () => {
      await expect(authService.checkPasswordStrength('')).rejects.toThrow('No value supplied')
    })

    test('should return password strength score and feedback for valid password', async () => {
      const result = await authService.checkPasswordStrength('password123')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('feedback')
      expect(typeof result.score).toBe('number')
      expect(Array.isArray(result.feedback.suggestions)).toBe(true)
    })

    test('should handle weak passwords', async () => {
      const result = await authService.checkPasswordStrength('123')
      expect(result.score).toBeLessThanOrEqual(2)
    })

    test('should handle strong passwords', async () => {
      const result = await authService.checkPasswordStrength('Complex!P@ssw0rd#2024$')
      expect(result.score).toBeGreaterThanOrEqual(3)
    })
  })

  describe('doesEmailPhoneExist', () => {
    it('should exist', () => {
      expect(authService.doesEmailPhoneExist).toBeDefined()
    })

    test('should throw when type is missing', async () => {
      const query = { value: 'test@example.com' }
      await expect(authService.doesEmailPhoneExist(query as never)).rejects.toThrow(
        'Incorrect parameters',
      )
    })

    test('should throw when value is missing', async () => {
      const query = { type: USER_LOOKUPS.EMAIL }
      await expect(authService.doesEmailPhoneExist(query as never)).rejects.toThrow(
        'Incorrect parameters',
      )
    })

    test('should return available false for existing email', async () => {
      const query = {
        type: USER_LOOKUPS.EMAIL,
        value: TEST_EMAIL_ADMIN,
      }

      const result = await authService.doesEmailPhoneExist(query)

      expect(result?.available).toBe(false)
    })

    test('should return available false for existing phone', async () => {
      const query = {
        region: 'US',
        type: USER_LOOKUPS.PHONE,
        value: TEST_PHONE_1,
      }

      const result = await authService.doesEmailPhoneExist(query)

      expect(result?.available).toBe(false)
    })

    test('should return available true for non-existing email', async () => {
      const query = {
        type: USER_LOOKUPS.EMAIL,
        value: 'newuser@example.com',
      }

      const result = await authService.doesEmailPhoneExist(query)
      expect(result.available).toBe(true)
    })

    test('should return available true for non-existing phone', async () => {
      const query = {
        region: 'IT',
        type: USER_LOOKUPS.PHONE,
        value: TEST_PHONE_IT_VALID,
      }
      const result = await authService.doesEmailPhoneExist(query)
      expect(result.available).toBe(true)
    })
  })

  describe('logout', () => {
    it('should exist', () => {
      expect(authService.logout).toBeDefined()
    })

    test('should return false for non-existent token', async () => {
      const result = await authService.logout('non-existent-token')
      expect(result).toBe(false)
    })

    test('should return true for valid token', async () => {
      const result = await authService.logout('valid-token')
      expect(result).toBe(true)
    })
  })

  it('should exist when imported', () => {
    expect(AuthService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const authService = new AuthService()
    // assert
    expect(authService).toBeDefined()
  })

  it('should have all methods', () => {
    const svc = new AuthService()
    expect(svc.checkPasswordStrength).toBeDefined()
    expect(svc.doesEmailPhoneExist).toBeDefined()
    expect(svc.logout).toBeDefined()
    expect(svc.sendOtpToEmail).toBeDefined()
    expect(svc.sendOtpToPhone).toBeDefined()
    expect(svc.sentOtpById).toBeDefined()
    expect(svc.validateEmail).toBeDefined()
  })
})
