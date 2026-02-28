import { ApiLoggingClass } from '../logger'
import { AuthSignupService } from './auth-signup.service'

jest.mock('../config/config-api.service', () => ({
  allowsDevFallbacks: jest.fn().mockReturnValue(true),
  getEnvironment: jest.fn().mockReturnValue({ NODE_ENV: 'test' }),
  isDebug: jest.fn().mockReturnValue(false),
}))

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('../devices/device-api.postgres-model')
jest.mock('../email/email-api.postgres-model')
jest.mock('../email/email-api.service')
jest.mock('../mail/mail-api-sendgrid')
jest.mock('../phone/phone-api.postgres-model')
jest.mock('../shortlink/shortlink-api.postgres-model')
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

jest.mock('./otp/otp-code.redis-cache', () => ({
  OtpCodeCache: jest.fn().mockImplementation(() => ({
    validateEmailOtp: jest.fn().mockResolvedValue(true),
    validatePhoneOtp: jest.fn().mockResolvedValue(true),
  })),
}))

describe('AuthSignupService', () => {
  let authSignupService: AuthSignupService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    authSignupService = new AuthSignupService()
  })

  it('should exist when imported', () => {
    expect(AuthSignupService).toBeDefined()
  })

  it('should create instance when constructed', () => {
    expect(authSignupService).toBeDefined()
  })

  it('should have signup method', () => {
    expect(authSignupService.signup).toBeDefined()
    expect(typeof authSignupService.signup).toBe('function')
  })

  describe('signup', () => {
    it('should throw when value is empty', async () => {
      await expect(
        authSignupService.signup({ code: '123456', value: '' }),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when value is undefined', async () => {
      await expect(
        authSignupService.signup({ code: '123456', value: undefined as unknown as string }),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when account could not be created with invalid payload', async () => {
      await expect(
        authSignupService.signup({ code: '123456', value: 'invalid-xyz-no-email-no-phone' }),
      ).rejects.toThrow('Account could not be created')
    })
  })
})
