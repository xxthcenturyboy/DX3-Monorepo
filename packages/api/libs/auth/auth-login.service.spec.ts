import { TEST_PHONE_IT_VALID } from '@dx3/test-data'

import { EmailModel } from '../email/email-api.postgres-model'
import { ApiLoggingClass } from '../logger'
import { PhoneModel } from '../phone/phone-api.postgres-model'
import { UserModel } from '../user/user-api.postgres-model'
import { AuthLoginService } from './auth-login.service'

jest.mock('../config/config-api.service', () => ({
  allowsDevFallbacks: jest.fn().mockReturnValue(true),
  getEnvironment: jest.fn().mockReturnValue({ NODE_ENV: 'test' }),
  isDebug: jest.fn().mockReturnValue(false),
}))

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('../devices/devices-api.service')
jest.mock('../email/email-api.postgres-model')
jest.mock('../phone/phone-api.postgres-model')
jest.mock('../user/user-api.postgres-model', () => ({
  UserModel: {
    findByPk: jest.fn(),
    getBiomAuthKey: jest.fn(),
    isUsernameAvailable: jest.fn(),
    loginWithPassword: jest.fn(),
    loginWithUsernamePassword: jest.fn(),
    registerAndCreateFromEmail: jest.fn(),
    registerAndCreateFromPhone: jest.fn(),
  },
}))
jest.mock('../user/user-profile-api', () => ({
  getUserProfileState: jest.fn().mockResolvedValue({
    emails: [],
    fullName: 'Test User',
    hasSecuredAccount: true,
    id: 'user-1',
    isAdmin: false,
    isSuperAdmin: false,
    optInBeta: false,
    phones: [],
    restrictions: [],
    roles: [],
    username: 'testuser',
  }),
}))

jest.mock('@dx3/encryption', () => ({
  dxRsaValidateBiometricKey: jest.fn().mockReturnValue(true),
}))

jest.mock('./otp/otp-code.redis-cache', () => ({
  OtpCodeCache: jest.fn().mockImplementation(() => ({
    validateEmailOtp: jest.fn().mockResolvedValue(true),
    validatePhoneOtp: jest.fn().mockResolvedValue(true),
  })),
}))

describe('AuthLoginService', () => {
  let authLoginService: AuthLoginService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    authLoginService = new AuthLoginService()
  })

  it('should exist when imported', () => {
    expect(AuthLoginService).toBeDefined()
  })

  it('should create instance when constructed', () => {
    expect(authLoginService).toBeDefined()
  })

  it('should have login method', () => {
    expect(authLoginService.login).toBeDefined()
    expect(typeof authLoginService.login).toBe('function')
  })

  describe('login', () => {
    it('should throw when value is empty', async () => {
      await expect(authLoginService.login({ value: '' })).rejects.toThrow('No value supplied')
    })

    it('should throw when value is undefined', async () => {
      await expect(
        authLoginService.login({ value: undefined as unknown as string }),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when no matching login type could be determined', async () => {
      await expect(authLoginService.login({ value: 'invalid-input-xyz' })).rejects.toThrow(
        'Could not log you in',
      )
    })

    it('should return user profile on username+password login success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        id: 'user-1',
      }
      ;(UserModel.loginWithUsernamePassword as jest.Mock).mockResolvedValue(mockUser)

      const result = await authLoginService.login({
        password: 'password123',
        value: 'testuser',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
      expect(result?.username).toBe('testuser')
      expect(UserModel.loginWithUsernamePassword).toHaveBeenCalledWith('testuser', 'password123')
    })

    it('should throw when user has deletedAt', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: new Date(),
        id: 'user-1',
      }
      ;(UserModel.loginWithUsernamePassword as jest.Mock).mockResolvedValue(mockUser)

      await expect(authLoginService.login({ password: 'pass', value: 'testuser' })).rejects.toThrow(
        'Could not log you in',
      )
    })

    it('should throw when user has accountLocked', async () => {
      const mockUser = {
        accountLocked: true,
        deletedAt: null,
        id: 'user-1',
      }
      ;(UserModel.loginWithUsernamePassword as jest.Mock).mockResolvedValue(mockUser)

      await expect(authLoginService.login({ password: 'pass', value: 'testuser' })).rejects.toThrow(
        'Could not log you in',
      )
    })

    it('should return user profile on email+password login success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        id: 'user-1',
      }
      ;(UserModel.loginWithPassword as jest.Mock).mockResolvedValue(mockUser)

      const result = await authLoginService.login({
        password: 'password123',
        value: 'test@example.com',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
      expect(UserModel.loginWithPassword).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('should return user profile on email+OTP login success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        id: 'user-1',
      }
      ;(EmailModel.findByEmail as jest.Mock).mockResolvedValue({ userId: 'user-1' })
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await authLoginService.login({
        code: '123456',
        value: 'otp@example.com',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
    })

    it('should return user profile on phone+OTP login success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        id: 'user-1',
      }
      ;(PhoneModel.findByPhoneAndCode as jest.Mock).mockResolvedValue({
        isVerified: true,
        userId: 'user-1',
      })
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await authLoginService.login({
        code: '123456',
        region: 'IT',
        value: TEST_PHONE_IT_VALID,
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
    })

    it('should return user profile on biometric login success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        id: 'user-1',
      }
      ;(UserModel.getBiomAuthKey as jest.Mock).mockResolvedValue('mock-public-key')
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await authLoginService.login({
        biometric: {
          device: null,
          signature: 'signature',
          userId: 'user-1',
        },
        value: 'payload-data',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
    })

    it('should throw when username+password login returns null', async () => {
      ;(UserModel.loginWithUsernamePassword as jest.Mock).mockResolvedValue(null)

      await expect(authLoginService.login({ password: 'pass', value: 'testuser' })).rejects.toThrow(
        'Invalid username or password',
      )
    })
  })
})
