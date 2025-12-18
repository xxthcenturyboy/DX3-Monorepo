import { USER_LOOKUPS } from '@dx3/models-shared'
import {
  TEST_BIOMETRIC_PUBLIC_KEY,
  TEST_DEVICE,
  TEST_EMAIL,
  TEST_EXISTING_EMAIL,
  TEST_EXISTING_PHONE,
  TEST_EXISTING_USER_ID,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_VALID,
} from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { AuthService, type AuthServiceType } from './auth-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

import { mockEmailModel } from '../email/email-api.postgres-model.mock'
import { mockPhoneModel } from '../phone/phone-api.postgres-model.mock'
import { mockUserProfileApi } from '../user/user-profile-api.mock'
import { mockOtpCodeCache } from './otp/otp-code.redis-cache.mock'

describe('AuthService', () => {
  let authService: AuthServiceType

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    // Setup centralized mocks for unit tests
    mockOtpCodeCache()
    mockUserProfileApi()
    mockEmailModel()
    mockPhoneModel()

    // Create service instance for unit tests
    authService = new AuthService()
  })

  describe('checkPasswordStrength', () => {
    it('should exist', () => {
      expect(authService.checkPasswordStrength).toBeDefined()
    })

    test('should throw when no password is provided', async () => {
      await expect(authService.checkPasswordStrength('')).rejects.toThrow('No value supplied.')
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

  describe('createAccount', () => {
    it('should exist', () => {
      expect(authService.createAccount).toBeDefined()
    })

    test('should throw when value is missing', async () => {
      const payload = { code: '123456' }
      await expect(authService.createAccount(payload as never)).rejects.toThrow('Bad data sent.')
    })

    test('should throw when code is missing', async () => {
      const payload = { value: 'test@example.com' }
      await expect(authService.createAccount(payload as never)).rejects.toThrow('Bad data sent.')
    })

    test('should throw when phone number is not mobile', async () => {
      const payload = {
        code: '123456',
        region: 'US',
        value: '8005551212', // Not a mobile number
      }
      await expect(authService.createAccount(payload)).rejects.toThrow(
        'This phone number cannot be used to create an account.',
      )
    })

    test('should throw when phone is already in use', async () => {
      const payload = {
        code: '123456',
        region: 'US',
        value: TEST_EXISTING_PHONE,
      }
      await expect(authService.createAccount(payload)).rejects.toThrow(
        '(858) 484-6800 is already in use.',
      )
    })

    test('should throw when email is already in use', async () => {
      const payload = {
        code: '123456',
        value: TEST_EXISTING_EMAIL,
      }
      await expect(authService.createAccount(payload)).rejects.toThrow('already exists.')
    })

    test('should throw when email is invalid format', async () => {
      const payload = {
        code: '123456',
        value: 'invalid-email',
      }
      await expect(authService.createAccount(payload)).rejects.toThrow()
    })
  })

  describe('doesEmailPhoneExist', () => {
    it('should exist', () => {
      expect(authService.doesEmailPhoneExist).toBeDefined()
    })

    test('should throw when type is missing', async () => {
      const query = { value: 'test@example.com' }
      await expect(authService.doesEmailPhoneExist(query as never)).rejects.toThrow(
        'Incorrect query parameters.',
      )
    })

    test('should throw when value is missing', async () => {
      const query = { type: USER_LOOKUPS.EMAIL }
      await expect(authService.doesEmailPhoneExist(query as never)).rejects.toThrow(
        'Incorrect query parameters.',
      )
    })

    test('should return available false for existing email', async () => {
      const query = {
        type: USER_LOOKUPS.EMAIL,
        value: TEST_EXISTING_EMAIL,
      }

      const result = await authService.doesEmailPhoneExist(query)

      expect(result?.available).toBe(false)
    })

    test('should return available false for existing phone', async () => {
      const query = {
        region: 'US',
        type: USER_LOOKUPS.PHONE,
        value: TEST_EXISTING_PHONE,
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

  describe('biometricLogin', () => {
    it('should exist', () => {
      expect(authService.biometricLogin).toBeDefined()
    })

    test('should throw when userId is missing', async () => {
      const payload = {
        payload: 'payload',
        signature: 'signature',
      }
      await expect(authService.biometricLogin(payload as never)).rejects.toThrow(
        'Insufficient data for Biometric login.',
      )
    })

    test('should throw when signature is missing', async () => {
      const payload = {
        payload: 'payload',
        userId: 'user-id',
      }
      await expect(authService.biometricLogin(payload as never)).rejects.toThrow(
        'Insufficient data for Biometric login.',
      )
    })

    test('should throw when payload is missing', async () => {
      const payload = {
        signature: 'signature',
        userId: 'user-id',
      }
      await expect(authService.biometricLogin(payload as never)).rejects.toThrow(
        'Insufficient data for Biometric login.',
      )
    })

    test('should throw when user has no biometric key', async () => {
      const payload = {
        device: TEST_DEVICE,
        payload: 'payload',
        signature: 'signature',
        userId: 'non-existent-user',
      }
      await expect(authService.biometricLogin(payload)).rejects.toThrow('no stored public key')
    })

    test('should throw when signature is invalid', async () => {
      const payload = {
        device: TEST_DEVICE,
        payload: 'payload',
        signature: 'invalid-signature',
        userId: TEST_EXISTING_USER_ID,
      }
      await expect(authService.biometricLogin(payload)).rejects.toThrow(
        'Device signature is invalid',
      )
    })
  })

  describe('login', () => {
    it('should exist', () => {
      expect(authService.login).toBeDefined()
    })

    test('should throw when value is missing', async () => {
      const payload = {}
      await expect(authService.login(payload as never)).rejects.toThrow('No data sent.')
    })

    test('should throw when password is incorrect for email login', async () => {
      const payload = {
        password: 'wrongpassword',
        value: TEST_EXISTING_EMAIL,
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
    })

    test('should throw when user account is locked', async () => {
      const payload = {
        password: 'password',
        value: 'locked@example.com',
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
    })

    test('should throw when user account is deleted', async () => {
      const payload = {
        password: 'password',
        value: 'deleted@example.com',
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
    })

    test('should handle biometric login priority', async () => {
      const payload = {
        biometric: {
          device: TEST_DEVICE,
          signature: TEST_BIOMETRIC_PUBLIC_KEY,
          userId: TEST_EXISTING_USER_ID,
        },
        value: 'test@example.com',
      }
      await expect(authService.login(payload)).rejects.toThrow('Device signature is invalid')
    })

    test('should handle phone OTP login', async () => {
      const payload = {
        code: '123456',
        region: 'US',
        value: TEST_PHONE_VALID,
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
    })

    test('should handle email OTP login', async () => {
      const payload = {
        code: '123456',
        value: TEST_EMAIL,
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
    })

    test('should handle username/password login', async () => {
      const payload = {
        password: 'password123',
        value: 'some-user',
      }
      await expect(authService.login(payload)).rejects.toThrow('100 Could not log you in.')
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
    // arrange
    // act
    const authService = new AuthService()
    // assert
    expect(authService.biometricLogin).toBeDefined()
    expect(authService.createAccount).toBeDefined()
    expect(authService.doesEmailPhoneExist).toBeDefined()
    expect(authService.login).toBeDefined()
    expect(authService.logout).toBeDefined()
    expect(authService.sendOtpToEmail).toBeDefined()
    expect(authService.sendOtpToPhone).toBeDefined()
    expect(authService.validateEmail).toBeDefined()
  })
})
