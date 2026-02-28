import { ApiLoggingClass } from '../logger'
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
jest.mock('../user/user-api.postgres-model')
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
  })
})
