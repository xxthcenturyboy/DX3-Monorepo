import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import { TEST_BAD_UUID, TEST_PHONE_1 } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { PhoneService } from './phone-api.service'

const mockPhoneUtilInstance = {
  countryCode: '1',
  isValid: true,
  isValidMobile: true,
  nationalNumber: TEST_PHONE_1,
  normalizedPhone: `+1${TEST_PHONE_1}`,
}

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../utils', () => ({
  PhoneUtil: jest.fn().mockImplementation(() => mockPhoneUtilInstance),
}))
jest.mock('../auth/otp/otp.service', () => ({
  OtpService: {
    validateOptCodeByPhone: jest.fn().mockResolvedValue(true),
  },
}))
jest.mock('../user/user-api.postgres-model', () => ({
  UserModel: {
    getBiomAuthKey: jest.fn().mockResolvedValue('mock-public-key'),
  },
}))
jest.mock('@dx3/encryption', () => ({
  dxRsaValidateBiometricKey: jest.fn().mockReturnValue(true),
}))

const mockPhoneModelFindByPk = jest.fn()
const mockPhoneModelIsPhoneAvailable = jest.fn()
const mockPhoneModelClearAllDefaultByUserId = jest.fn()
const mockPhoneSave = jest.fn()
const mockPhoneSetDataValue = jest.fn().mockReturnThis()

// Support both static methods and `new PhoneModel()` instance usage in the service
jest.mock('./phone-api.postgres-model', () => ({
  PhoneModel: class {
    id = 'phone-id-123'
    phoneObfuscated = '***-0001234'
    userId = 'user-123'
    save(...args: unknown[]) {
      return mockPhoneSave(...args)
    }
    setDataValue(...args: unknown[]) {
      return mockPhoneSetDataValue(...args)
    }
    static clearAllDefaultByUserId(...args: unknown[]) {
      return mockPhoneModelClearAllDefaultByUserId(...args)
    }
    static findByPk(...args: unknown[]) {
      return mockPhoneModelFindByPk(...args)
    }
    static isPhoneAvailable(...args: unknown[]) {
      return mockPhoneModelIsPhoneAvailable(...args)
    }
  },
}))

describe('PhoneService', () => {
  let phoneService: PhoneService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    phoneService = new PhoneService()
    // clearAllMocks resets call counts; explicitly reset individual mocks
    // that use "once" queues to prevent cross-test pollution
    jest.clearAllMocks()
    mockPhoneSave.mockReset()
    mockPhoneSave.mockResolvedValue(undefined)
    mockPhoneSetDataValue.mockReset()
    mockPhoneSetDataValue.mockReturnThis()
    mockPhoneUtilInstance.isValid = true
    mockPhoneUtilInstance.isValidMobile = true
    mockPhoneModelIsPhoneAvailable.mockResolvedValue(true)
    // Restore OTP default to valid so success-path tests work
    const { OtpService } = require('../auth/otp/otp.service')
    OtpService.validateOptCodeByPhone.mockReset()
    OtpService.validateOptCodeByPhone.mockResolvedValue(true)
    const { dxRsaValidateBiometricKey } = require('@dx3/encryption')
    dxRsaValidateBiometricKey.mockReset()
    dxRsaValidateBiometricKey.mockReturnValue(true)
    const { UserModel } = require('../user/user-api.postgres-model')
    UserModel.getBiomAuthKey.mockReset()
    UserModel.getBiomAuthKey.mockResolvedValue('mock-public-key')
  })

  it('should exist when imported', () => {
    expect(PhoneService).toBeDefined()
  })

  it('should create instance when constructed', () => {
    expect(phoneService).toBeDefined()
  })

  describe('createPhone', () => {
    it('should throw when userId is missing', async () => {
      await expect(
        phoneService.createPhone({
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          userId: '',
        }),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when phone is missing', async () => {
      await expect(
        phoneService.createPhone({
          def: false,
          label: 'Work',
          phone: '',
          userId: 'user-123',
        }),
      ).rejects.toThrow('No value supplied')
    })

    it('should throw when phone is invalid', async () => {
      mockPhoneUtilInstance.isValid = false
      await expect(
        phoneService.createPhone({
          code: '123456',
          def: false,
          label: 'Work',
          phone: 'invalid',
          regionCode: PHONE_DEFAULT_REGION_CODE,
          userId: 'user-123',
        }),
      ).rejects.toThrow('This phone cannot be used.')
    })

    it('should throw when phone already exists', async () => {
      mockPhoneModelIsPhoneAvailable.mockResolvedValue(false)
      await expect(
        phoneService.createPhone({
          code: '123456',
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          userId: 'user-123',
        }),
      ).rejects.toThrow('is already in use.')
    })

    it('should throw when OTP code is invalid', async () => {
      const { OtpService } = require('../auth/otp/otp.service')
      OtpService.validateOptCodeByPhone.mockResolvedValue(false)
      await expect(
        phoneService.createPhone({
          code: 'wrong',
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          userId: 'user-123',
        }),
      ).rejects.toThrow('Invalid OTP code.')
    })

    it('should throw when def is true but phone is not mobile', async () => {
      mockPhoneUtilInstance.isValidMobile = false
      await expect(
        phoneService.createPhone({
          def: true,
          label: 'Primary',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          signature: 'valid-signature',
          userId: 'user-123',
        }),
      ).rejects.toThrow('Cannot use this phone number as your default')
    })

    it('should throw when biometric signature is invalid', async () => {
      const { dxRsaValidateBiometricKey } = require('@dx3/encryption')
      dxRsaValidateBiometricKey.mockReturnValueOnce(false)
      await expect(
        phoneService.createPhone({
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          signature: 'bad-signature',
          userId: 'user-123',
        }),
      ).rejects.toThrow('Device signature is invalid')
    })

    it('should throw when neither code nor signature is provided', async () => {
      await expect(
        phoneService.createPhone({
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          userId: 'user-123',
        }),
      ).rejects.toThrow('Could not validate')
    })

    it('should successfully create a phone with a valid OTP code', async () => {
      const result = await phoneService.createPhone({
        code: '123456',
        def: false,
        label: 'Work',
        phone: TEST_PHONE_1,
        regionCode: PHONE_DEFAULT_REGION_CODE,
        userId: 'user-123',
      })
      expect(result).toEqual({ id: 'phone-id-123', phone: '***-0001234' })
    })

    it('should successfully create a default phone with valid signature', async () => {
      mockPhoneModelClearAllDefaultByUserId.mockResolvedValue(undefined)
      const result = await phoneService.createPhone({
        def: true,
        label: 'Primary',
        phone: TEST_PHONE_1,
        regionCode: PHONE_DEFAULT_REGION_CODE,
        signature: 'valid-signature',
        userId: 'user-123',
      })
      expect(result).toEqual({ id: 'phone-id-123', phone: '***-0001234' })
      expect(mockPhoneModelClearAllDefaultByUserId).toHaveBeenCalledWith('user-123')
    })

    it('should use default region code when regionCode is omitted', async () => {
      const result = await phoneService.createPhone({
        code: '123456',
        def: false,
        label: 'Work',
        phone: TEST_PHONE_1,
        userId: 'user-123',
      })
      expect(result).toEqual({ id: 'phone-id-123', phone: '***-0001234' })
    })

    it('should use empty string when getBiomAuthKey returns null', async () => {
      const { UserModel } = require('../user/user-api.postgres-model')
      UserModel.getBiomAuthKey.mockResolvedValue(null)
      const result = await phoneService.createPhone({
        def: false,
        label: 'Work',
        phone: TEST_PHONE_1,
        regionCode: PHONE_DEFAULT_REGION_CODE,
        signature: 'valid-sig',
        userId: 'user-123',
      })
      expect(result).toEqual({ id: 'phone-id-123', phone: '***-0001234' })
    })

    it('should throw server error when phone.save() fails during createPhone', async () => {
      mockPhoneSave.mockRejectedValueOnce(new Error('DB write failed'))
      await expect(
        phoneService.createPhone({
          code: '123456',
          def: false,
          label: 'Work',
          phone: TEST_PHONE_1,
          regionCode: PHONE_DEFAULT_REGION_CODE,
          userId: 'user-123',
        }),
      ).rejects.toThrow('DB write failed')
    })
  })

  describe('deletePhone', () => {
    it('should throw when id is missing', async () => {
      await expect(phoneService.deletePhone('')).rejects.toThrow('No id provided for delete.')
    })

    it('should throw when phone not found', async () => {
      mockPhoneModelFindByPk.mockResolvedValue(null)
      await expect(phoneService.deletePhone(TEST_BAD_UUID)).rejects.toThrow(
        'Phone could not be found.',
      )
    })

    it('should throw when userId does not match phone owner', async () => {
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'other-user-id',
      })
      await expect(phoneService.deletePhone('phone-id', 'user-123')).rejects.toThrow(
        'You cannot delete this phone.',
      )
    })

    it('should successfully delete a phone when userId matches', async () => {
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      const result = await phoneService.deletePhone('phone-id', 'user-123')
      expect(result).toEqual({ id: 'phone-id' })
    })

    it('should successfully delete a phone when no userId is provided', async () => {
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      const result = await phoneService.deletePhone('phone-id')
      expect(result).toEqual({ id: 'phone-id' })
    })

    it('should throw server error when phone.save() fails during deletePhone', async () => {
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      mockPhoneSave.mockRejectedValueOnce(new Error('Delete DB error'))
      await expect(phoneService.deletePhone('phone-id', 'user-123')).rejects.toThrow(
        'Delete DB error',
      )
    })
  })

  describe('isPhoneAvailableAndValid', () => {
    it('should throw when phone is missing', async () => {
      await expect(
        phoneService.isPhoneAvailableAndValid('', PHONE_DEFAULT_REGION_CODE),
      ).rejects.toThrow('Missing phone or region code.')
    })

    it('should throw when regionCode is missing', async () => {
      await expect(phoneService.isPhoneAvailableAndValid(TEST_PHONE_1, '')).rejects.toThrow(
        'Missing phone or region code.',
      )
    })

    it('should throw when phone is invalid', async () => {
      mockPhoneUtilInstance.isValid = false
      await expect(
        phoneService.isPhoneAvailableAndValid('invalid', PHONE_DEFAULT_REGION_CODE),
      ).rejects.toThrow('This phone cannot be used.')
    })

    it('should return ERROR_CODES.PHONE_ALREADY_EXISTS when authFlow is true and phone exists', async () => {
      mockPhoneModelIsPhoneAvailable.mockResolvedValue(false)
      const result = await phoneService.isPhoneAvailableAndValid(
        TEST_PHONE_1,
        PHONE_DEFAULT_REGION_CODE,
        true,
      )
      expect(result).toBe('500')
    })

    it('should return null when phone is available and valid', async () => {
      const result = await phoneService.isPhoneAvailableAndValid(
        TEST_PHONE_1,
        PHONE_DEFAULT_REGION_CODE,
      )
      expect(result).toBeNull()
    })

    it('should throw when phone is invalid with no regionCode (uses default region)', async () => {
      mockPhoneUtilInstance.isValid = false
      await expect(phoneService.isPhoneAvailableAndValid('invalid', '')).rejects.toThrow(
        'Missing phone or region code.',
      )
    })
  })

  describe('updatePhone', () => {
    it('should throw when id is missing', async () => {
      await expect(
        phoneService.updatePhone('', { def: true, id: '', label: 'Primary' }),
      ).rejects.toThrow('No id provided for update.')
    })

    it('should throw when phone not found', async () => {
      mockPhoneModelFindByPk.mockResolvedValue(null)
      await expect(
        phoneService.updatePhone(TEST_BAD_UUID, { def: true, id: TEST_BAD_UUID }),
      ).rejects.toThrow('Phone could not be found.')
    })

    it('should successfully update phone with def=true and label', async () => {
      mockPhoneSave.mockResolvedValue(undefined)
      mockPhoneModelClearAllDefaultByUserId.mockResolvedValue(undefined)
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      const result = await phoneService.updatePhone('phone-id', {
        def: true,
        id: 'phone-id',
        label: 'Updated Label',
      })
      expect(result).toEqual({ id: 'phone-id' })
      expect(mockPhoneModelClearAllDefaultByUserId).toHaveBeenCalled()
      expect(mockPhoneSetDataValue).toHaveBeenCalledWith('default', true)
      expect(mockPhoneSetDataValue).toHaveBeenCalledWith('label', 'Updated Label')
    })

    it('should successfully update phone with def=false (no clearAllDefault called)', async () => {
      mockPhoneSave.mockResolvedValue(undefined)
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      const result = await phoneService.updatePhone('phone-id', { def: false, id: 'phone-id' })
      expect(result).toEqual({ id: 'phone-id' })
      expect(mockPhoneModelClearAllDefaultByUserId).not.toHaveBeenCalled()
    })

    it('should throw server error when phone.save() fails during updatePhone', async () => {
      mockPhoneModelFindByPk.mockResolvedValue({
        id: 'phone-id',
        save: mockPhoneSave,
        setDataValue: mockPhoneSetDataValue,
        userId: 'user-123',
      })
      mockPhoneSave.mockRejectedValueOnce(new Error('Update DB error'))
      await expect(
        phoneService.updatePhone('phone-id', { def: false, id: 'phone-id' }),
      ).rejects.toThrow('Update DB error')
    })
  })
})
