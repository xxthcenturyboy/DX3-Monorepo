import { ApiLoggingClass } from '../logger'
import { EmailService } from './email-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('@dx3/encryption/src', () => ({
  dxRsaValidateBiometricKey: jest.fn(),
}))
jest.mock('../auth/otp/otp.service', () => ({
  OtpService: { validateOptCodeByEmail: jest.fn() },
}))
jest.mock('../user/user-api.postgres-model', () => ({
  UserModel: { getBiomAuthKey: jest.fn() },
}))
jest.mock('../utils/lib/error/api-error.utils', () => ({
  createApiErrorMessage: (_code: string, msg: string) => msg,
}))

const mockEmailInstance = {
  default: false,
  email: '',
  emailObfuscated: 't***@example.com',
  id: 'email-1',
  label: '',
  save: jest.fn().mockResolvedValue(undefined),
  setDataValue: jest.fn(),
  userId: '',
  verifiedAt: null as Date | null,
}

const MockEmailModel = jest.fn().mockImplementation(() => mockEmailInstance) as jest.Mock & {
  clearAllDefaultByUserId: jest.Mock
  findByPk: jest.Mock
  isEmailAvailable: jest.Mock
}
MockEmailModel.clearAllDefaultByUserId = jest.fn()
MockEmailModel.findByPk = jest.fn()
MockEmailModel.isEmailAvailable = jest.fn()

jest.mock('./email-api.postgres-model', () => ({
  get EmailModel() {
    return MockEmailModel
  },
}))

const mockEmailUtilInstance = {
  emailObfuscated: 't***@example.com',
  formattedEmail: jest.fn().mockReturnValue('test@example.com'),
  isDisposableDomainAsync: jest.fn().mockResolvedValue(false),
  validateAsync: jest.fn().mockResolvedValue(true),
}
jest.mock('../utils', () => ({
  EmailUtil: jest.fn().mockImplementation(() => mockEmailUtilInstance),
}))

import { dxRsaValidateBiometricKey } from '@dx3/encryption/src'

import { OtpService } from '../auth/otp/otp.service'
import { UserModel } from '../user/user-api.postgres-model'

describe('EmailService', () => {
  let service: EmailService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    service = new EmailService()
    jest.clearAllMocks()
    mockEmailUtilInstance.validateAsync.mockResolvedValue(true)
    mockEmailUtilInstance.isDisposableDomainAsync.mockResolvedValue(false)
    mockEmailUtilInstance.formattedEmail.mockReturnValue('test@example.com')
    MockEmailModel.isEmailAvailable.mockResolvedValue(true)
    mockEmailInstance.save.mockResolvedValue(undefined)
    mockEmailInstance.setDataValue.mockReset()
  })

  it('should exist when imported', () => {
    expect(EmailService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    expect(service.createEmail).toBeDefined()
    expect(service.deleteEmail).toBeDefined()
    expect(service.updateEmail).toBeDefined()
    expect(service.isEmailAvailableAndValid).toBeDefined()
  })

  describe('isEmailAvailableAndValid', () => {
    it('should throw when email is empty', async () => {
      await expect(service.isEmailAvailableAndValid('')).rejects.toThrow('No value supplied')
    })

    it('should throw EMAIL_INVALID when validation fails and domain is not disposable', async () => {
      mockEmailUtilInstance.validateAsync.mockResolvedValue(false)
      mockEmailUtilInstance.isDisposableDomainAsync.mockResolvedValue(false)

      await expect(service.isEmailAvailableAndValid('bad@email')).rejects.toThrow('not valid')
    })

    it('should throw disposable domain message when domain is disposable', async () => {
      mockEmailUtilInstance.validateAsync.mockResolvedValue(false)
      mockEmailUtilInstance.isDisposableDomainAsync.mockResolvedValue(true)

      await expect(service.isEmailAvailableAndValid('test@disposable.com')).rejects.toThrow(
        'Disposable emails are not allowed',
      )
    })

    it('should throw when email already exists and not auth flow', async () => {
      MockEmailModel.isEmailAvailable.mockResolvedValue(false)

      await expect(service.isEmailAvailableAndValid('taken@example.com')).rejects.toThrow(
        'already exists',
      )
    })

    it('should return error code when email already exists in auth flow', async () => {
      MockEmailModel.isEmailAvailable.mockResolvedValue(false)

      const result = await service.isEmailAvailableAndValid('taken@example.com', true)

      expect(result).toBeDefined()
    })

    it('should return undefined when email is valid and available', async () => {
      const result = await service.isEmailAvailableAndValid('valid@example.com')
      expect(result).toBeUndefined()
    })
  })

  describe('createEmail', () => {
    it('should throw when userId or email is missing', async () => {
      await expect(service.createEmail({ email: '', userId: 'user-1' } as never)).rejects.toThrow(
        'No value supplied',
      )

      await expect(
        service.createEmail({ email: 'test@test.com', userId: '' } as never),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when OTP code is invalid', async () => {
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValue(false)

      await expect(
        service.createEmail({
          code: 'wrong-code',
          email: 'test@example.com',
          userId: 'user-1',
        } as never),
      ).rejects.toThrow('Invalid OTP code')
    })

    it('should throw when biometric signature is invalid', async () => {
      ;(UserModel.getBiomAuthKey as jest.Mock).mockResolvedValue('public-key')
      ;(dxRsaValidateBiometricKey as jest.Mock).mockReturnValue(false)

      await expect(
        service.createEmail({
          email: 'test@example.com',
          signature: 'invalid-sig',
          userId: 'user-1',
        } as never),
      ).rejects.toThrow('Device signature is invalid')
    })

    it('should throw when neither code nor signature is provided', async () => {
      await expect(
        service.createEmail({
          email: 'test@example.com',
          userId: 'user-1',
        } as never),
      ).rejects.toThrow('Could not validate')
    })

    it('should create email when validated via OTP code', async () => {
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValue(true)

      const result = await service.createEmail({
        code: '123456',
        def: false,
        email: 'test@example.com',
        userId: 'user-1',
      } as never)

      expect(mockEmailInstance.save).toHaveBeenCalled()
      expect(result).toEqual({ email: 't***@example.com', id: 'email-1' })
    })

    it('should clear defaults when def is true', async () => {
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValue(true)

      await service.createEmail({
        code: '123456',
        def: true,
        email: 'test@example.com',
        userId: 'user-1',
      } as never)

      expect(MockEmailModel.clearAllDefaultByUserId).toHaveBeenCalledWith('user-1')
    })

    it('should create email when validated via biometric signature', async () => {
      ;(UserModel.getBiomAuthKey as jest.Mock).mockResolvedValue('public-key')
      ;(dxRsaValidateBiometricKey as jest.Mock).mockReturnValue(true)

      const result = await service.createEmail({
        email: 'test@example.com',
        signature: 'valid-sig',
        userId: 'user-1',
      } as never)

      expect(result).toEqual({ email: 't***@example.com', id: 'email-1' })
    })

    it('should rethrow wrapped error when save fails in createEmail', async () => {
      ;(OtpService.validateOptCodeByEmail as jest.Mock).mockResolvedValue(true)
      mockEmailInstance.save.mockRejectedValue(new Error('DB save error'))

      await expect(
        service.createEmail({
          code: '123456',
          email: 'test@example.com',
          userId: 'user-1',
        } as never),
      ).rejects.toThrow('DB save error')
    })
  })

  describe('deleteEmail', () => {
    it('should throw when id is empty', async () => {
      await expect(service.deleteEmail('')).rejects.toThrow('No id provided for delete')
    })

    it('should throw when email not found', async () => {
      MockEmailModel.findByPk.mockResolvedValue(null)

      await expect(service.deleteEmail('nonexistent')).rejects.toThrow('could not be found')
    })

    it('should throw when userId does not match email owner', async () => {
      MockEmailModel.findByPk.mockResolvedValue({ id: 'email-1', userId: 'other-user' })

      await expect(service.deleteEmail('email-1', 'user-1')).rejects.toThrow(
        'You cannot delete this email',
      )
    })

    it('should soft delete email when userId matches', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      const result = await service.deleteEmail('email-1', 'user-1')

      expect(mockEmail.setDataValue).toHaveBeenCalledWith('deletedAt', expect.any(Date))
      expect(mockEmail.save).toHaveBeenCalled()
      expect(result).toEqual({ id: 'email-1' })
    })

    it('should delete email without userId ownership check', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      const result = await service.deleteEmail('email-1')

      expect(result).toEqual({ id: 'email-1' })
    })

    it('should rethrow wrapped error when save fails in deleteEmail', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockRejectedValue(new Error('DB delete error')),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      await expect(service.deleteEmail('email-1', 'user-1')).rejects.toThrow('DB delete error')
    })
  })

  describe('updateEmail', () => {
    it('should throw when id is empty', async () => {
      await expect(service.updateEmail('', {} as never)).rejects.toThrow(
        'No id provided for update',
      )
    })

    it('should throw when email not found', async () => {
      MockEmailModel.findByPk.mockResolvedValue(null)

      await expect(service.updateEmail('nonexistent', {} as never)).rejects.toThrow(
        'could not be found',
      )
    })

    it('should update label and default when def is true', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)
      MockEmailModel.clearAllDefaultByUserId.mockResolvedValue(undefined)

      const result = await service.updateEmail('email-1', { def: true, label: 'work' } as never)

      expect(MockEmailModel.clearAllDefaultByUserId).toHaveBeenCalledWith('user-1')
      expect(mockEmail.setDataValue).toHaveBeenCalledWith('default', true)
      expect(mockEmail.setDataValue).toHaveBeenCalledWith('label', 'work')
      expect(result).toEqual({ id: 'email-1' })
    })

    it('should update default to false without clearing defaults', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      await service.updateEmail('email-1', { def: false } as never)

      expect(MockEmailModel.clearAllDefaultByUserId).not.toHaveBeenCalled()
      expect(mockEmail.setDataValue).toHaveBeenCalledWith('default', false)
    })

    it('should skip label update when label is undefined', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      await service.updateEmail('email-1', {} as never)

      const labelCall = mockEmail.setDataValue.mock.calls.find(([key]: [string]) => key === 'label')
      expect(labelCall).toBeUndefined()
    })

    it('should rethrow wrapped error when save fails in updateEmail', async () => {
      const mockEmail = {
        id: 'email-1',
        save: jest.fn().mockRejectedValue(new Error('DB update error')),
        setDataValue: jest.fn(),
        userId: 'user-1',
      }
      MockEmailModel.findByPk.mockResolvedValue(mockEmail)

      await expect(service.updateEmail('email-1', {} as never)).rejects.toThrow('DB update error')
    })
  })
})
