import { TEST_PHONE_1 } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { AuthSignupService } from './auth-signup.service'

jest.mock('@dx3/api-libs/reference-data/reference-data-api.client', () =>
  require('../testing/mocks/reference-data-api.client.mock'),
)
jest.mock('../config/config-api.service', () => ({
  allowsDevFallbacks: jest.fn().mockReturnValue(true),
  getEnvironment: jest.fn().mockReturnValue({ NODE_ENV: 'test' }),
  isDebug: jest.fn().mockReturnValue(false),
}))

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

jest.mock('../devices/device-api.postgres-model')
jest.mock('../email/email-api.postgres-model')
jest.mock('../email/email-api.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    isEmailAvailableAndValid: jest.fn().mockResolvedValue(undefined),
  })),
}))
jest.mock('../mail/mail-api-sendgrid', () => ({
  MailSendgrid: jest.fn().mockImplementation(() => ({
    sendConfirmation: jest.fn().mockResolvedValue('msg-id'),
  })),
}))
jest.mock('../phone/phone-api.postgres-model')
jest.mock('../shortlink/shortlink-api.postgres-model')
jest.mock('../user/user-api.postgres-model', () => ({
  UserModel: {
    create: jest.fn(),
    findByPk: jest.fn(),
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
      await expect(authSignupService.signup({ code: '123456', value: '' })).rejects.toThrow(
        'No value supplied',
      )
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

    it('should return user profile on email code signup success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        getEmails: jest.fn().mockResolvedValue([]),
        getPhones: jest.fn().mockResolvedValue([]),
        id: 'user-1',
      }
      ;(UserModel.registerAndCreateFromEmail as jest.Mock).mockResolvedValue(mockUser)

      const result = await authSignupService.signup({
        code: '123456',
        value: 'test@gmail.com',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
      expect(UserModel.registerAndCreateFromEmail).toHaveBeenCalledWith(
        'test@gmail.com',
        true,
        undefined,
      )
    })

    it('should return user profile on phone code signup success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        getEmails: jest.fn().mockResolvedValue([]),
        getPhones: jest.fn().mockResolvedValue([]),
        id: 'user-1',
      }
      const { PhoneModel } = require('../phone/phone-api.postgres-model')
      ;(PhoneModel.isPhoneAvailable as jest.Mock).mockResolvedValue(true)
      ;(UserModel.registerAndCreateFromPhone as jest.Mock).mockResolvedValue(mockUser)

      const result = await authSignupService.signup({
        code: '123456',
        region: 'US',
        value: `+1${TEST_PHONE_1}`,
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
    })

    it('should return user profile on email magic link signup success', async () => {
      const mockUser = {
        accountLocked: false,
        deletedAt: null,
        getEmails: jest.fn().mockResolvedValue([]),
        getPhones: jest.fn().mockResolvedValue([]),
        id: 'user-1',
        token: 'magic-token',
      }
      ;(UserModel.registerAndCreateFromEmail as jest.Mock).mockResolvedValue(mockUser)
      const ShortLinkModel = require('../shortlink/shortlink-api.postgres-model').ShortLinkModel
      const EmailModel = require('../email/email-api.postgres-model').EmailModel
      ;(ShortLinkModel.generateShortlink as jest.Mock).mockResolvedValue('short-link')
      ;(EmailModel.updateMessageInfoValidate as jest.Mock).mockResolvedValue(undefined)

      const result = await authSignupService.signup({
        code: '',
        value: 'magiclink@gmail.com',
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('user-1')
    })
  })
})
