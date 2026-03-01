import { ApiLoggingClass } from '../logger'
import { PhoneService } from './phone-api.service'

import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import { TEST_BAD_UUID, TEST_PHONE_1 } from '@dx3/test-data'

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

jest.mock('./phone-api.postgres-model', () => ({
  PhoneModel: {
    clearAllDefaultByUserId: (...args: unknown[]) =>
      mockPhoneModelClearAllDefaultByUserId(...args),
    findByPk: (...args: unknown[]) => mockPhoneModelFindByPk(...args),
    isPhoneAvailable: (...args: unknown[]) => mockPhoneModelIsPhoneAvailable(...args),
  },
}))

describe('PhoneService', () => {
  let phoneService: PhoneService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    phoneService = new PhoneService()
    jest.clearAllMocks()
    mockPhoneUtilInstance.isValid = true
    mockPhoneUtilInstance.isValidMobile = true
    mockPhoneModelIsPhoneAvailable.mockResolvedValue(true)
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
        setDataValue: mockPhoneSetDataValue,
        save: mockPhoneSave,
        userId: 'other-user-id',
      })
      await expect(
        phoneService.deletePhone('phone-id', 'user-123'),
      ).rejects.toThrow('You cannot delete this phone.')
    })
  })

  describe('isPhoneAvailableAndValid', () => {
    it('should throw when phone is missing', async () => {
      await expect(
        phoneService.isPhoneAvailableAndValid('', PHONE_DEFAULT_REGION_CODE),
      ).rejects.toThrow('Missing phone or region code.')
    })

    it('should throw when regionCode is missing', async () => {
      await expect(
        phoneService.isPhoneAvailableAndValid(TEST_PHONE_1, ''),
      ).rejects.toThrow('Missing phone or region code.')
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
  })
})
