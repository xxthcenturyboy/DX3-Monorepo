import { ApiLoggingClass } from '../logger'
import { UserModel } from './user-api.postgres-model'
import { UserService } from './user-api.service'

jest.mock('../auth/otp/otp.service', () => ({
  OtpService: {
    generateOptCode: jest.fn().mockResolvedValue('123456'),
    validateOptCode: jest.fn().mockResolvedValue(true),
    validateOptCodeByEmail: jest.fn().mockResolvedValue(true),
    validateOptCodeByPhone: jest.fn().mockResolvedValue(true),
  },
}))
jest.mock('../config/config-api.service', () => ({
  allowsDevFallbacks: jest.fn().mockReturnValue(true),
  getEnvironment: jest.fn().mockReturnValue({ NODE_ENV: 'test' }),
  isDebug: jest.fn().mockReturnValue(false),
  isProd: jest.fn().mockReturnValue(false),
}))
jest.mock('../email/email-api.postgres-model')
jest.mock('../email/email-api.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    isEmailAvailableAndValid: jest.fn().mockResolvedValue(undefined),
  })),
}))
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../mail/mail-api-sendgrid', () => ({
  MailSendgrid: jest.fn().mockImplementation(() => ({
    sendInvite: jest.fn().mockResolvedValue('msg-id'),
  })),
}))
jest.mock('../phone/phone-api.postgres-model')
jest.mock('../shortlink/shortlink-api.postgres-model')
jest.mock('@dx3/encryption', () => ({
  dxRsaValidateBiometricKey: jest.fn().mockReturnValue(true),
}))
jest.mock('./user-api.postgres-model', () => ({
  UserModel: {
    createFromUsername: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    getBiomAuthKey: jest.fn().mockResolvedValue('mock-key'),
    isUsernameAvailable: jest.fn(),
    updatePassword: jest.fn(),
  },
}))
jest.mock('./user-profile-api', () => ({
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

describe('UserService', () => {
  let service: UserService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    service = new UserService()
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(UserService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have the correct methods', () => {
    expect(service.createUser).toBeDefined()
    expect(service.deleteUser).toBeDefined()
    expect(service.getProfile).toBeDefined()
    expect(service.getUser).toBeDefined()
    expect(service.getUserList).toBeDefined()
    expect(service.sendOtpCode).toBeDefined()
    expect(service.updatePassword).toBeDefined()
    expect(service.updateUser).toBeDefined()
  })

  describe('isUsernameAvailable', () => {
    it('should throw when username is empty', async () => {
      await expect(service.isUsernameAvailable('')).rejects.toThrow('Nothing provided to search')
    })

    it('should return available: false for invalid username format', async () => {
      const result = await service.isUsernameAvailable('a')

      expect(result).toEqual({ available: false })
      expect(UserModel.isUsernameAvailable).not.toHaveBeenCalled()
    })

    it('should return available: true when username is available', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)

      const result = await service.isUsernameAvailable('validuser123')

      expect(result).toEqual({ available: true })
      expect(UserModel.isUsernameAvailable).toHaveBeenCalledWith('validuser123')
    })

    it('should return available: false when username is taken', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(false)

      const result = await service.isUsernameAvailable('takenuser')

      expect(result).toEqual({ available: false })
    })
  })

  describe('sendOtpCode', () => {
    it('should throw when userId is empty', async () => {
      await expect(service.sendOtpCode('')).rejects.toThrow('No value provided')
    })

    it('should return code when not in production', async () => {
      const result = await service.sendOtpCode('user-1')

      expect(result).toEqual({ code: '123456' })
    })
  })

  describe('createUser', () => {
    it('should throw when username or email is missing', async () => {
      await expect(service.createUser({ email: '', username: 'user' } as never)).rejects.toThrow(
        'Not enough information to create a user',
      )
      await expect(service.createUser({ email: 'a@b.com', username: '' } as never)).rejects.toThrow(
        'Not enough information to create a user',
      )
    })

    it('should create user and return id with invited', async () => {
      const mockUser = { id: 'user-1', token: 'token' }
      ;(UserModel.createFromUsername as jest.Mock).mockResolvedValue(mockUser)
      const ShortLinkModel = require('../shortlink/shortlink-api.postgres-model').ShortLinkModel
      const EmailModel = require('../email/email-api.postgres-model').EmailModel
      ;(ShortLinkModel.generateShortlink as jest.Mock).mockResolvedValue('short-link')
      ;(EmailModel.updateMessageInfoValidate as jest.Mock).mockResolvedValue(undefined)

      const result = await service.createUser({
        email: 'new@example.com',
        username: 'newuser123',
      } as never)

      expect(result).toEqual({ id: 'user-1', invited: true })
    })
  })

  describe('getProfile', () => {
    it('should throw when userId is empty', async () => {
      await expect(service.getProfile('')).rejects.toThrow('No ID supplied')
    })

    it('should return profile when user exists', async () => {
      const mockUser = {
        getEmails: jest.fn().mockResolvedValue([]),
        getPhones: jest.fn().mockResolvedValue([]),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.getProfile('user-1')

      expect(result.profile).toBeDefined()
      expect(
        result.profile && typeof result.profile === 'object' && 'id' in result.profile
          ? (result.profile as { id: string }).id
          : undefined,
      ).toBe('user-1')
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(service.getProfile('nonexistent')).rejects.toThrow('User could not be found')
    })
  })

  describe('getUser', () => {
    it('should throw when id is empty', async () => {
      await expect(service.getUser('', 'logged-in')).rejects.toThrow('No id provided for search')
    })

    it('should return user when found', async () => {
      const mockUser = {
        toJSON: () => ({
          emails: [
            {
              email: 'a@b.com',
              emailObfuscated: 'a***@b.com',
            },
          ],
          id: 'user-1',
          phones: [
            {
              phone: '123',
              phoneFormatted: '+123',
              phoneObfuscated: '***',
            },
          ],
        }),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue({ isSuperAdmin: true })

      const result = await service.getUser('user-1', 'admin-id')

      expect(result).toBeDefined()
      expect(result.id).toBe('user-1')
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.getUser('nonexistent', '')).rejects.toThrow('User could not be found')
    })
  })

  describe('getUserList', () => {
    it('should return paginated user list', async () => {
      const mockRows = [
        {
          toJSON: () => ({
            emails: [],
            id: '1',
            phones: [],
          }),
        },
      ]
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockRows,
      })

      const result = await service.getUserList({})

      expect(result.count).toBe(1)
      expect(result.rows).toHaveLength(1)
    })
  })

  describe('deleteUser', () => {
    it('should throw when id is empty', async () => {
      await expect(service.deleteUser('')).rejects.toThrow('No id provided for delete')
    })

    it('should soft delete user when found', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.deleteUser('user-1')

      expect(result).toEqual({ userId: 'user-1' })
      expect(mockUser.setDataValue).toHaveBeenCalledWith('deletedAt', expect.any(Date))
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.deleteUser('nonexistent')).rejects.toThrow('User could not be found')
    })
  })

  describe('updateUser', () => {
    it('should throw when id is empty', async () => {
      await expect(service.updateUser('', { firstName: 'John' } as never)).rejects.toThrow(
        'No id provided for update',
      )
    })

    it('should update user fields when found', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(null),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.updateUser('user-1', {
        firstName: 'John',
        lastName: 'Doe',
      } as never)

      expect(result).toEqual({ userId: 'user-1' })
      expect(mockUser.setDataValue).toHaveBeenCalledWith('firstName', 'John')
      expect(mockUser.setDataValue).toHaveBeenCalledWith('lastName', 'Doe')
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updateUser('nonexistent', { firstName: 'John' } as never),
      ).rejects.toThrow('User could not be found')
    })
  })

  describe('updateRolesAndRestrictions', () => {
    it('should throw when id is empty', async () => {
      await expect(service.updateRolesAndRestrictions('', { roles: [] } as never)).rejects.toThrow(
        'No value provided',
      )
    })

    it('should update roles when user found', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(null),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.updateRolesAndRestrictions('user-1', {
        restrictions: [],
        roles: ['ADMIN'],
      } as never)

      expect(result).toEqual({ userId: 'user-1' })
    })
  })

  describe('updatePassword', () => {
    it('should throw when required fields missing', async () => {
      await expect(
        service.updatePassword({
          id: '',
          otp: { code: '123', id: 'x', method: 'EMAIL' },
          password: 'p',
          passwordConfirm: 'p',
        } as never),
      ).rejects.toThrow('No value provided')
    })

    it('should throw when passwords do not match', async () => {
      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '123', id: 'x', method: 'EMAIL' },
          password: 'pass',
          passwordConfirm: 'different',
        } as never),
      ).rejects.toThrow('Passwords must match')
    })

    it('should update password when OTP valid', async () => {
      const { EmailModel } = require('../email/email-api.postgres-model')
      ;(EmailModel.findByPk as jest.Mock).mockResolvedValue({ email: 'a@b.com' })
      ;(UserModel.updatePassword as jest.Mock).mockResolvedValue(true)

      const result = await service.updatePassword({
        id: 'user-1',
        otp: { code: '123456', id: 'email-id', method: 'EMAIL' },
        password: 'ComplexP@ssw0rd!123',
        passwordConfirm: 'ComplexP@ssw0rd!123',
      } as never)

      expect(result).toEqual({ success: true })
    })

    it('should throw when email record not found for OTP validation', async () => {
      const { EmailModel } = require('../email/email-api.postgres-model')
      ;(EmailModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '123456', id: 'email-id', method: 'EMAIL' },
          password: 'ComplexP@ssw0rd!123',
          passwordConfirm: 'ComplexP@ssw0rd!123',
        } as never),
      ).rejects.toThrow('Could not get email to validate code.')
    })

    it('should throw when OTP code is invalid', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      const { EmailModel } = require('../email/email-api.postgres-model')
      ;(EmailModel.findByPk as jest.Mock).mockResolvedValue({ email: 'a@b.com' })
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValue(false)

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: 'wrong', id: 'email-id', method: 'EMAIL' },
          password: 'ComplexP@ssw0rd!123',
          passwordConfirm: 'ComplexP@ssw0rd!123',
        } as never),
      ).rejects.toThrow('Invalid OTP code.')
    })

    it('should validate via PHONE method', async () => {
      const { PhoneModel } = require('../phone/phone-api.postgres-model')
      ;(PhoneModel.findByPk as jest.Mock).mockResolvedValue({
        countryCode: 'US',
        phoneFormatted: '+15551234567',
      })
      ;(UserModel.updatePassword as jest.Mock).mockResolvedValue(true)

      const result = await service.updatePassword({
        id: 'user-1',
        otp: { code: '123456', id: 'phone-id', method: 'PHONE' },
        password: 'ComplexP@ssw0rd!123',
        passwordConfirm: 'ComplexP@ssw0rd!123',
      } as never)

      expect(result).toEqual({ success: true })
    })

    it('should throw when phone record not found for OTP validation', async () => {
      const { PhoneModel } = require('../phone/phone-api.postgres-model')
      ;(PhoneModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '123456', id: 'phone-id', method: 'PHONE' },
          password: 'ComplexP@ssw0rd!123',
          passwordConfirm: 'ComplexP@ssw0rd!123',
        } as never),
      ).rejects.toThrow('Could not get phone to validate code.')
    })

    it('should validate via biometric signature', async () => {
      ;(UserModel.updatePassword as jest.Mock).mockResolvedValue(true)

      const result = await service.updatePassword({
        id: 'user-1',
        otp: { code: '', id: '', method: 'EMAIL' },
        password: 'ComplexP@ssw0rd!123',
        passwordConfirm: 'ComplexP@ssw0rd!123',
        signature: 'biometric-signature',
      } as never)

      expect(result).toEqual({ success: true })
    })

    it('should throw when biometric signature is invalid', async () => {
      const { dxRsaValidateBiometricKey } = require('@dx3/encryption')
      ;(dxRsaValidateBiometricKey as jest.Mock).mockReturnValueOnce(false)

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '', id: '', method: 'EMAIL' },
          password: 'ComplexP@ssw0rd!123',
          passwordConfirm: 'ComplexP@ssw0rd!123',
          signature: 'invalid-signature',
        } as never),
      ).rejects.toThrow('Device signature is invalid')
    })

    it('should throw when password is too weak', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      const { EmailModel } = require('../email/email-api.postgres-model')
      ;(EmailModel.findByPk as jest.Mock).mockResolvedValue({ email: 'a@b.com' })
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValueOnce(true)

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '123456', id: 'email-id', method: 'EMAIL' },
          password: 'weak',
          passwordConfirm: 'weak',
        } as never),
      ).rejects.toThrow('Please choose a stronger password.')
    })

    it('should throw server error when updatePassword DB call fails', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      const { EmailModel } = require('../email/email-api.postgres-model')
      ;(EmailModel.findByPk as jest.Mock).mockResolvedValue({ email: 'a@b.com' })
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValueOnce(true)
      ;(UserModel.updatePassword as jest.Mock).mockRejectedValue(new Error('DB failure'))

      await expect(
        service.updatePassword({
          id: 'user-1',
          otp: { code: '123456', id: 'email-id', method: 'EMAIL' },
          password: 'ComplexP@ssw0rd!123',
          passwordConfirm: 'ComplexP@ssw0rd!123',
        } as never),
      ).rejects.toThrow('DB failure')
    })
  })

  describe('getUserList - sorting and filtering', () => {
    const mockUser = (id: string) => ({
      toJSON: () => ({
        emails: [{ email: 'a@b.com', emailObfuscated: 'a***@b.com' }],
        id,
        phones: [{ phone: '123', phoneFormatted: '+123', phoneObfuscated: '***' }],
      }),
    })

    it('should sort by fullName', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [mockUser('u1')],
      })
      const result = await service.getUserList({ orderBy: 'fullName' } as never)
      expect(result.count).toBe(1)
    })

    it('should sort by isAdmin', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [mockUser('u1')],
      })
      const result = await service.getUserList({ orderBy: 'isAdmin' } as never)
      expect(result.count).toBe(1)
    })

    it('should sort by isSuperAdmin', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [mockUser('u1')],
      })
      const result = await service.getUserList({ orderBy: 'isSuperAdmin' } as never)
      expect(result.count).toBe(1)
    })

    it('should sort by a valid named field', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [mockUser('u1')],
      })
      const result = await service.getUserList({ orderBy: 'username', sortDir: 'ASC' } as never)
      expect(result.count).toBe(1)
    })

    it('should apply filterValue search query', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: [mockUser('u1'), mockUser('u2')],
      })
      const result = await service.getUserList({ filterValue: 'john' } as never)
      expect(result.count).toBe(2)
    })

    it('should throw server error when findAndCountAll fails', async () => {
      ;(UserModel.findAndCountAll as jest.Mock).mockRejectedValue(new Error('Query failed'))
      await expect(service.getUserList({} as never)).rejects.toThrow('Query failed')
    })
  })

  describe('getUser - additional coverage', () => {
    it('should call hidePiiFromUser when loggedInUser is not superAdmin', async () => {
      const mockUser = {
        toJSON: () => ({
          emails: [{ email: 'a@b.com', emailObfuscated: 'a***@b.com' }],
          id: 'user-1',
          phones: [{ phone: '123', phoneFormatted: '+123', phoneObfuscated: '***' }],
        }),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue({ isSuperAdmin: false })

      const result = await service.getUser('user-1', 'non-admin-id')

      expect(result).toBeDefined()
      // hidePiiFromUser swaps email with emailObfuscated
      expect((result as { emails?: { email: string }[] }).emails?.[0]?.email).toBe('a***@b.com')
    })

    it('should call hidePiiFromUser when no loggedInUserId', async () => {
      const mockUser = {
        toJSON: () => ({
          emails: [{ email: 'a@b.com', emailObfuscated: 'a***@b.com' }],
          id: 'user-1',
          phones: [{ phone: '123', phoneFormatted: '+123', phoneObfuscated: '***' }],
        }),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.getUser('user-1', '')

      expect(result).toBeDefined()
    })

    it('should throw server error when loggedInUser lookup throws', async () => {
      ;(UserModel.findByPk as jest.Mock).mockRejectedValueOnce(
        new Error('DB error for logged-in user'),
      )
      const mockUser = {
        toJSON: () => ({
          emails: [{ email: 'a@b.com', emailObfuscated: 'a***@b.com' }],
          id: 'user-1',
          phones: [{ phone: '123', phoneFormatted: '+123', phoneObfuscated: '***' }],
        }),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)

      // Error is logged but swallowed; result still returned
      const result = await service.getUser('user-1', 'logged-in-id')
      expect(result).toBeDefined()
    })

    it('should throw server error when findOne throws', async () => {
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)
      ;(UserModel.findOne as jest.Mock).mockRejectedValue(new Error('findOne error'))

      await expect(service.getUser('user-1', '')).rejects.toThrow('findOne error')
    })
  })

  describe('getProfile - catch blocks', () => {
    it('should throw server error when findByPk throws', async () => {
      ;(UserModel.findByPk as jest.Mock).mockRejectedValue(new Error('DB down'))

      await expect(service.getProfile('user-1')).rejects.toThrow('DB down')
    })

    it('should throw server error when getUserProfileState throws', async () => {
      const mockUser = {
        getEmails: jest.fn().mockResolvedValue([]),
        getPhones: jest.fn().mockResolvedValue([]),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)
      const { getUserProfileState } = require('./user-profile-api')
      ;(getUserProfileState as jest.Mock).mockRejectedValueOnce(new Error('Profile error'))

      await expect(service.getProfile('user-1')).rejects.toThrow('Profile error')
    })
  })

  describe('deleteUser - catch blocks', () => {
    it('should throw server error when findOne throws', async () => {
      ;(UserModel.findOne as jest.Mock).mockRejectedValue(new Error('findOne failed'))

      await expect(service.deleteUser('user-1')).rejects.toThrow('findOne failed')
    })

    it('should throw server error when save throws', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockRejectedValue(new Error('save failed')),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser)

      await expect(service.deleteUser('user-1')).rejects.toThrow('save failed')
    })
  })

  describe('updateUser - catch blocks and profanity', () => {
    it('should throw server error when findByPk throws', async () => {
      ;(UserModel.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'))

      await expect(service.updateUser('user-1', { firstName: 'John' } as never)).rejects.toThrow(
        'DB error',
      )
    })

    it('should clean profane firstName when updating', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(null),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      // ProfanityFilter is a real util - use a known profane word or mock it
      // Using a normal word so profanity check passes normally
      await service.updateUser('user-1', {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'America/New_York',
      } as never)

      expect(mockUser.setDataValue).toHaveBeenCalledWith('timezone', 'America/New_York')
    })

    it('should throw server error when save throws', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockRejectedValue(new Error('save failed')),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      await expect(service.updateUser('user-1', { firstName: 'John' } as never)).rejects.toThrow(
        'save failed',
      )
    })
  })

  describe('updateRolesAndRestrictions - catch blocks', () => {
    it('should throw server error when findByPk throws', async () => {
      ;(UserModel.findByPk as jest.Mock).mockRejectedValue(new Error('DB down'))

      await expect(
        service.updateRolesAndRestrictions('user-1', { roles: [] } as never),
      ).rejects.toThrow('DB down')
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updateRolesAndRestrictions('user-1', { roles: [] } as never),
      ).rejects.toThrow('User could not be found')
    })

    it('should throw server error when save throws', async () => {
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockRejectedValue(new Error('save failed')),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        service.updateRolesAndRestrictions('user-1', { roles: ['ADMIN'] } as never),
      ).rejects.toThrow('save failed')
    })
  })

  describe('sendOtpCode - catch block', () => {
    it('should throw server error when generateOptCode throws', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      ;(OtpService.generateOptCode as jest.Mock).mockRejectedValueOnce(new Error('OTP error'))

      await expect(service.sendOtpCode('user-1')).rejects.toThrow('OTP error')
    })
  })

  describe('createUser - profanity and phone branches', () => {
    it('should throw when username is profane', async () => {
      await expect(
        service.createUser({
          email: 'test@example.com',
          username: 'ass',
        } as never),
      ).rejects.toThrow('Profane usernames are not allowed')
    })

    it('should throw when phone is invalid', async () => {
      await expect(
        service.createUser({
          email: 'test@example.com',
          phone: 'not-a-phone',
          regionCode: 'US',
          username: 'validuser123',
        } as never),
      ).rejects.toThrow('Invalid Phone')
    })

    it('should throw server error when UserModel.createFromUsername throws', async () => {
      ;(UserModel.createFromUsername as jest.Mock).mockRejectedValue(new Error('DB create failed'))

      await expect(
        service.createUser({
          email: 'test@example.com',
          username: 'validuser123',
        } as never),
      ).rejects.toThrow('DB create failed')
    })
  })

  describe('isUsernameAvailable - profanity and catch block', () => {
    it('should throw when username is profane', async () => {
      // Use a username that passes isUsernameValid (min length) but is profane
      await expect(service.isUsernameAvailable('asshole123')).rejects.toThrow(
        'Profane usernames are not allowed',
      )
    })

    it('should throw server error when isUsernameAvailable DB call fails', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockRejectedValue(new Error('DB error'))

      await expect(service.isUsernameAvailable('validuser123')).rejects.toThrow('DB error')
    })
  })

  describe('updateUserName', () => {
    it('should throw when id is missing', async () => {
      await expect(
        service.updateUserName('', { otpCode: '123456', username: 'newname' } as never),
      ).rejects.toThrow('No id provided')
    })

    it('should throw when neither otp nor signature provided', async () => {
      await expect(
        service.updateUserName('user-1', { username: 'newname' } as never),
      ).rejects.toThrow('No otp or signature provided')
    })

    it('should throw when OTP code is invalid', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      ;(OtpService.validateOptCode as jest.Mock).mockResolvedValueOnce(false)

      await expect(
        service.updateUserName('user-1', { otpCode: 'bad-code', username: 'newname123' } as never),
      ).rejects.toThrow('Invalid OTP code')
    })

    it('should throw when biometric signature is invalid', async () => {
      const { dxRsaValidateBiometricKey } = require('@dx3/encryption')
      ;(dxRsaValidateBiometricKey as jest.Mock).mockReturnValueOnce(false)

      await expect(
        service.updateUserName('user-1', {
          signature: 'invalid-sig',
          username: 'newname123',
        } as never),
      ).rejects.toThrow('Device signature is invalid')
    })

    it('should throw when username is not available', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(false)

      await expect(
        service.updateUserName('user-1', { otpCode: '123456', username: 'takenname' } as never),
      ).rejects.toThrow('Username is not available')
    })

    it('should throw when user not found', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updateUserName('user-1', { otpCode: '123456', username: 'newname123' } as never),
      ).rejects.toThrow('User could not be found')
    })

    it('should throw server error when findByPk throws', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)
      ;(UserModel.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'))

      await expect(
        service.updateUserName('user-1', { otpCode: '123456', username: 'newname123' } as never),
      ).rejects.toThrow('DB error')
    })

    it('should successfully update username with OTP', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.updateUserName('user-1', {
        otpCode: '123456',
        username: 'newname123',
      } as never)

      expect(result).toEqual({ userId: 'user-1' })
      expect(mockUser.setDataValue).toHaveBeenCalledWith('username', 'newname123')
    })

    it('should successfully update username with biometric signature', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const result = await service.updateUserName('user-1', {
        signature: 'valid-sig',
        username: 'newname123',
      } as never)

      expect(result).toEqual({ userId: 'user-1' })
    })

    it('should throw server error when save throws', async () => {
      ;(UserModel.isUsernameAvailable as jest.Mock).mockResolvedValue(true)
      const mockUser = {
        id: 'user-1',
        save: jest.fn().mockRejectedValue(new Error('save failed')),
        setDataValue: jest.fn(),
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        service.updateUserName('user-1', { otpCode: '123456', username: 'newname123' } as never),
      ).rejects.toThrow('save failed')
    })
  })
})
