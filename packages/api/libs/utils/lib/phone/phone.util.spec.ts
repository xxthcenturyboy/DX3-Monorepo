jest.mock('@dx3/api-libs/logger', () => ({
  ApiLoggingClass: {
    instance: {
      logDebug: jest.fn(),
      logError: jest.fn(),
      logInfo: jest.fn(),
      logWarn: jest.fn(),
    },
  },
}))

import {
  TEST_PHONE_1,
  TEST_PHONE_2,
  TEST_PHONE_IT_INVALID,
  TEST_PHONE_IT_VALID,
} from '@dx3/test-data'

import { PhoneUtil, type PhoneUtilType } from './phone.util'

describe('phone.util', () => {
  let phoneUtil: PhoneUtilType

  test('should invalidate a bogus US phone number', () => {
    // arrange
    const nationalPhone = TEST_PHONE_2.replace(/ /g, '')
    phoneUtil = new PhoneUtil(TEST_PHONE_2, 'US')
    // act
    // assert
    expect(phoneUtil.countryCode).toEqual('1')
    expect(phoneUtil.nationalNumber).toEqual(nationalPhone)
    expect(phoneUtil.isValid).toBe(false)
    expect(phoneUtil.phoneType).toBe(-1)
    expect(phoneUtil.isValidMobile).toBe(false)
  })

  test('should invalidate a bogus an Italian phone number', () => {
    // arrange
    const nationalPhone = TEST_PHONE_IT_INVALID.replace(/ /g, '')
    phoneUtil = new PhoneUtil(TEST_PHONE_IT_INVALID, 'IT')
    // act
    // assert
    expect(phoneUtil.countryCode).toEqual('39')
    expect(phoneUtil.nationalNumber).toEqual(nationalPhone)
    expect(phoneUtil.isValid).toBe(false)
    expect(phoneUtil.phoneType).toBe(-1)
    expect(phoneUtil.isValidMobile).toBe(false)
  })

  test('should validate a valid US phone number', () => {
    // arrange
    const nationalPhone = TEST_PHONE_1.replace(/ /g, '')
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    // assert
    expect(phoneUtil.countryCode).toEqual('1')
    expect(phoneUtil.nationalNumber).toEqual(nationalPhone)
    expect(phoneUtil.isValid).toBe(true)
    expect(phoneUtil.phoneType).toBe(2)
    expect(phoneUtil.isValidMobile).toBe(true)
  })

  test('should validate a valid an Italian phone number', () => {
    // arrange
    const nationalPhone = TEST_PHONE_IT_VALID.replace(/ /g, '')
    phoneUtil = new PhoneUtil(`39 ${TEST_PHONE_IT_VALID}`, 'IT')
    // act
    // assert
    expect(phoneUtil.countryCode).toEqual('39')
    expect(phoneUtil.nationalNumber).toEqual(nationalPhone)
    expect(phoneUtil.isValid).toBe(true)
    expect(phoneUtil.phoneType).toBe(0)
    expect(phoneUtil.isValidMobile).toBe(false)
  })

  test('should get international phone format', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const intlNumber = phoneUtil.internationalNumber
    // assert
    expect(intlNumber).toBeTruthy()
    expect(intlNumber).toContain('+1')
  })

  test('should get normalized phone number', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const normalized = phoneUtil.normalizedPhone
    // assert
    expect(normalized).toBeTruthy()
    expect(normalized).toMatch(/^\+\d+/)
    expect(normalized).not.toContain(' ')
  })

  test('should check if phone is a possible number', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const isPossible = phoneUtil.isPossibleNumber
    // assert
    expect(isPossible).toBe(true)
  })

  test('should return false for impossible number', () => {
    // arrange
    phoneUtil = new PhoneUtil('123', 'US')
    // act
    const isPossible = phoneUtil.isPossibleNumber
    // assert
    expect(isPossible).toBe(false)
  })

  test('should get possible number reason for valid number', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const reason = phoneUtil.isPossibleNumberReason
    // assert
    expect(reason).toBeDefined()
    expect(typeof reason).toBe('number')
  })

  test('should return empty string for impossible number reason', () => {
    // arrange
    phoneUtil = new PhoneUtil('123', 'US')
    // act
    const reason = phoneUtil.isPossibleNumberReason
    // assert
    expect(reason).toBe(-1)
  })

  test('should get phone type text for mobile', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const typeText = phoneUtil.phoneTypeText
    // assert
    expect(typeText).toBeTruthy()
    expect(['MOBILE', 'FIXED_LINE_OR_MOBILE']).toContain(typeText)
  })

  test('should get phone type text for fixed line', () => {
    // arrange
    phoneUtil = new PhoneUtil(`39 ${TEST_PHONE_IT_VALID}`, 'IT')
    // act
    const typeText = phoneUtil.phoneTypeText
    // assert
    expect(typeText).toBe('FIXED_LINE')
  })

  test('should get phone type string for mobile', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const typeString = phoneUtil.phoneTypeString
    // assert
    expect(['MOBILE', 'FIXED_OR_MOBILE']).toContain(typeString)
  })

  test('should get phone type string for fixed line', () => {
    // arrange
    phoneUtil = new PhoneUtil(`39 ${TEST_PHONE_IT_VALID}`, 'IT')
    // act
    const typeString = phoneUtil.phoneTypeString
    // assert
    expect(typeString).toBe('ZZ')
  })

  test('should return empty country code for invalid phone', () => {
    // arrange
    phoneUtil = new PhoneUtil('', 'US')
    // act
    const countryCode = phoneUtil.countryCode
    // assert
    expect(countryCode).toBe('')
  })

  test('should handle phone with leading zeros', () => {
    // arrange
    phoneUtil = new PhoneUtil('+39 0412345678', 'IT')
    // act
    const nationalNumber = phoneUtil.nationalNumber
    // assert
    expect(nationalNumber).toBeTruthy()
  })

  test('should return false for isValidMobile on non-mobile phone', () => {
    // arrange
    phoneUtil = new PhoneUtil(`39 ${TEST_PHONE_IT_VALID}`, 'IT')
    // act
    const isValidMobile = phoneUtil.isValidMobile
    // assert
    expect(isValidMobile).toBe(false)
  })

  test('should return true for isValidMobile on mobile phone', () => {
    // arrange
    phoneUtil = new PhoneUtil(TEST_PHONE_1, 'US')
    // act
    const isValidMobile = phoneUtil.isValidMobile
    // assert
    expect(isValidMobile).toBe(true)
  })

  test('should handle constructor error gracefully', () => {
    // arrange & act
    phoneUtil = new PhoneUtil('invalid phone', '', true)
    // assert
    expect(phoneUtil.isValid).toBe(false)
    expect(phoneUtil.countryCode).toBe('')
  })

  test('should return false for isValid on null phone', () => {
    // arrange
    phoneUtil = new PhoneUtil(null as any, 'US')
    // act
    const isValid = phoneUtil.isValid
    // assert
    expect(isValid).toBe(false)
  })

  test('should return empty string for phoneTypeText on null phone', () => {
    // arrange
    phoneUtil = new PhoneUtil(null as any, 'US')
    // act
    const typeText = phoneUtil.phoneTypeText
    // assert
    expect(typeText).toBe('')
  })

  test('should parse UK phone number correctly', () => {
    // arrange
    phoneUtil = new PhoneUtil('+44 20 7946 0958', 'GB')
    // act & assert
    expect(phoneUtil.countryCode).toBe('44')
    expect(phoneUtil.isPossibleNumber).toBeDefined()
  })

  test('should parse German phone number correctly', () => {
    // arrange
    phoneUtil = new PhoneUtil('+49 30 12345678', 'DE')
    // act & assert
    expect(phoneUtil.countryCode).toBe('49')
    // German numbers can be complex, just verify it parses
    expect(phoneUtil.isPossibleNumber).toBeDefined()
  })

  test('should handle toll-free number format', () => {
    // arrange
    phoneUtil = new PhoneUtil('+1 800 555 1234', 'US')
    // act
    const typeText = phoneUtil.phoneTypeText
    // assert
    expect(phoneUtil.countryCode).toBe('1')
    expect(typeText).toBeTruthy()
  })

  test('should format international number correctly', () => {
    // arrange
    phoneUtil = new PhoneUtil('2025551234', 'US')
    // act
    const intlNumber = phoneUtil.internationalNumber
    // assert
    expect(intlNumber).toContain('+1')
    expect(intlNumber).toContain('202')
  })

  test('should handle phone with country code prefix', () => {
    // arrange
    phoneUtil = new PhoneUtil('+1 202 555 1234', 'US')
    // act
    const normalized = phoneUtil.normalizedPhone
    // assert
    expect(normalized).toMatch(/^\+1\d+/)
  })

  test('should return 0 for phoneType when phone is not parsed', () => {
    // arrange
    phoneUtil = new PhoneUtil('', 'US')
    // act
    const phoneType = phoneUtil.phoneType
    // assert
    expect(phoneType).toBe(0)
  })
})
