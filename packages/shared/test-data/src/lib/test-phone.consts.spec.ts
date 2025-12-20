import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'

import { TEST_UUID } from './test.consts'
import {
  TEST_BIOMETRIC_PRIVATE_KEY,
  TEST_BIOMETRIC_PUBLIC_KEY,
  TEST_DEVICE,
  TEST_PHONE_1,
  TEST_PHONE_2,
  TEST_PHONE_3,
  TEST_PHONE_CARRIER,
  TEST_PHONE_COUNTRY_CODE,
  TEST_PHONE_COUNTRY_CODE_IT,
  TEST_PHONE_IT_INVALID,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_NAME,
  TEST_PHONE_REGION_CODE_IT,
  TEST_PHONE_UNIQUE_DEVICE_ID,
  TEST_PHONE_VALID,
} from './test-phone.consts'

describe('Test Phone Constants (test-phone.consts.ts)', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  describe('Phone Number Constants', () => {
    it('should export TEST_PHONE_1', () => {
      expect(TEST_PHONE_1).toBeDefined()
      expect(typeof TEST_PHONE_1).toBe('string')
      expect(TEST_PHONE_1).toBe('8584846800')
    })

    it('should export TEST_PHONE_2', () => {
      expect(TEST_PHONE_2).toBeDefined()
      expect(typeof TEST_PHONE_2).toBe('string')
      expect(TEST_PHONE_2).toBe('8584846802')
    })

    it('should export TEST_PHONE_3', () => {
      expect(TEST_PHONE_3).toBeDefined()
      expect(typeof TEST_PHONE_3).toBe('string')
      expect(TEST_PHONE_3).toBe('8584846803')
    })

    it('should export TEST_PHONE_VALID', () => {
      expect(TEST_PHONE_VALID).toBeDefined()
      expect(typeof TEST_PHONE_VALID).toBe('string')
      expect(TEST_PHONE_VALID).toBe('8584846801')
    })

    it('should have TEST_PHONE_1 as numeric string', () => {
      expect(TEST_PHONE_1).toMatch(/^\d+$/)
      expect(TEST_PHONE_1.length).toBe(10)
    })

    it('should have TEST_PHONE_2 as numeric string', () => {
      expect(TEST_PHONE_2).toMatch(/^\d+$/)
      expect(TEST_PHONE_2.length).toBe(10)
    })

    it('should have TEST_PHONE_VALID as numeric string', () => {
      expect(TEST_PHONE_VALID).toMatch(/^\d+$/)
      expect(TEST_PHONE_VALID.length).toBe(10)
    })

    it('should have different phone numbers for each constant', () => {
      expect(TEST_PHONE_1).not.toBe(TEST_PHONE_2)
      expect(TEST_PHONE_1).not.toBe(TEST_PHONE_3)
      expect(TEST_PHONE_1).not.toBe(TEST_PHONE_VALID)
      expect(TEST_PHONE_2).not.toBe(TEST_PHONE_3)
      expect(TEST_PHONE_2).not.toBe(TEST_PHONE_VALID)
    })
  })

  describe('Italian Phone Number Constants', () => {
    it('should export TEST_PHONE_IT_INVALID', () => {
      expect(TEST_PHONE_IT_INVALID).toBeDefined()
      expect(typeof TEST_PHONE_IT_INVALID).toBe('string')
      expect(TEST_PHONE_IT_INVALID).toBe('11 111 1111')
    })

    it('should export TEST_PHONE_IT_VALID', () => {
      expect(TEST_PHONE_IT_VALID).toBeDefined()
      expect(typeof TEST_PHONE_IT_VALID).toBe('string')
      expect(TEST_PHONE_IT_VALID).toBe('06 555 5555')
    })

    it('should have TEST_PHONE_IT_INVALID with spaces', () => {
      expect(TEST_PHONE_IT_INVALID).toContain(' ')
    })

    it('should have TEST_PHONE_IT_VALID with spaces', () => {
      expect(TEST_PHONE_IT_VALID).toContain(' ')
    })
  })

  describe('Country/Region Code Constants', () => {
    it('should export TEST_PHONE_COUNTRY_CODE', () => {
      expect(TEST_PHONE_COUNTRY_CODE).toBeDefined()
      expect(typeof TEST_PHONE_COUNTRY_CODE).toBe('string')
      expect(TEST_PHONE_COUNTRY_CODE).toBe('1')
    })

    it('should export TEST_PHONE_COUNTRY_CODE_IT', () => {
      expect(TEST_PHONE_COUNTRY_CODE_IT).toBeDefined()
      expect(typeof TEST_PHONE_COUNTRY_CODE_IT).toBe('string')
      expect(TEST_PHONE_COUNTRY_CODE_IT).toBe('39')
    })

    it('should export TEST_PHONE_REGION_CODE_IT', () => {
      expect(TEST_PHONE_REGION_CODE_IT).toBeDefined()
      expect(typeof TEST_PHONE_REGION_CODE_IT).toBe('string')
      expect(TEST_PHONE_REGION_CODE_IT).toBe('IT')
    })
  })

  describe('Device Constants', () => {
    it('should export TEST_PHONE_CARRIER', () => {
      expect(TEST_PHONE_CARRIER).toBeDefined()
      expect(typeof TEST_PHONE_CARRIER).toBe('string')
      expect(TEST_PHONE_CARRIER).toBe('ATT')
    })

    it('should export TEST_PHONE_NAME', () => {
      expect(TEST_PHONE_NAME).toBeDefined()
      expect(typeof TEST_PHONE_NAME).toBe('string')
      expect(TEST_PHONE_NAME).toBe('iphone,16')
    })

    it('should export TEST_PHONE_UNIQUE_DEVICE_ID', () => {
      expect(TEST_PHONE_UNIQUE_DEVICE_ID).toBeDefined()
      expect(typeof TEST_PHONE_UNIQUE_DEVICE_ID).toBe('string')
      expect(TEST_PHONE_UNIQUE_DEVICE_ID).toMatch(uuidRegex)
    })
  })

  describe('Biometric Key Constants', () => {
    it('should export TEST_BIOMETRIC_PUBLIC_KEY', () => {
      expect(TEST_BIOMETRIC_PUBLIC_KEY).toBeDefined()
      expect(typeof TEST_BIOMETRIC_PUBLIC_KEY).toBe('string')
    })

    it('should have TEST_BIOMETRIC_PUBLIC_KEY as valid base64', () => {
      // The RSA key is stored as raw base64 (not PEM format)
      expect(TEST_BIOMETRIC_PUBLIC_KEY).toMatch(/^[A-Za-z0-9+/=]+$/)
      expect(TEST_BIOMETRIC_PUBLIC_KEY.length).toBeGreaterThan(100)
    })

    it('should export TEST_BIOMETRIC_PRIVATE_KEY', () => {
      expect(TEST_BIOMETRIC_PRIVATE_KEY).toBeDefined()
      expect(typeof TEST_BIOMETRIC_PRIVATE_KEY).toBe('string')
    })

    it('should have TEST_BIOMETRIC_PRIVATE_KEY as valid base64', () => {
      // The RSA key is stored as raw base64 (not PEM format)
      expect(TEST_BIOMETRIC_PRIVATE_KEY).toMatch(/^[A-Za-z0-9+/=]+$/)
      expect(TEST_BIOMETRIC_PRIVATE_KEY.length).toBeGreaterThan(100)
    })

    it('should have different public and private keys', () => {
      expect(TEST_BIOMETRIC_PUBLIC_KEY).not.toBe(TEST_BIOMETRIC_PRIVATE_KEY)
    })

    it('should have private key longer than public key (RSA)', () => {
      expect(TEST_BIOMETRIC_PRIVATE_KEY.length).toBeGreaterThan(TEST_BIOMETRIC_PUBLIC_KEY.length)
    })
  })

  describe('TEST_DEVICE Object', () => {
    it('should export TEST_DEVICE', () => {
      expect(TEST_DEVICE).toBeDefined()
      expect(typeof TEST_DEVICE).toBe('object')
    })

    it('should have carrier property', () => {
      expect(TEST_DEVICE).toHaveProperty('carrier')
      expect(typeof TEST_DEVICE.carrier).toBe('string')
      expect(TEST_DEVICE.carrier).toBe(TEST_PHONE_CARRIER)
    })

    it('should have deviceCountry property', () => {
      expect(TEST_DEVICE).toHaveProperty('deviceCountry')
      expect(typeof TEST_DEVICE.deviceCountry).toBe('string')
      expect(TEST_DEVICE.deviceCountry).toBe(PHONE_DEFAULT_REGION_CODE)
    })

    it('should have deviceId property referencing TEST_UUID', () => {
      expect(TEST_DEVICE).toHaveProperty('deviceId')
      expect(typeof TEST_DEVICE.deviceId).toBe('string')
      expect(TEST_DEVICE.deviceId).toBe(TEST_UUID)
    })

    it('should have name property', () => {
      expect(TEST_DEVICE).toHaveProperty('name')
      expect(typeof TEST_DEVICE.name).toBe('string')
      expect(TEST_DEVICE.name).toBe(TEST_PHONE_NAME)
    })

    it('should have uniqueDeviceId property', () => {
      expect(TEST_DEVICE).toHaveProperty('uniqueDeviceId')
      expect(typeof TEST_DEVICE.uniqueDeviceId).toBe('string')
      expect(TEST_DEVICE.uniqueDeviceId).toBe(TEST_PHONE_UNIQUE_DEVICE_ID)
    })

    it('should have uniqueDeviceId in UUID format', () => {
      expect(TEST_DEVICE.uniqueDeviceId).toMatch(uuidRegex)
    })

    it('should have all required properties', () => {
      const keys = Object.keys(TEST_DEVICE)
      expect(keys).toContain('carrier')
      expect(keys).toContain('deviceCountry')
      expect(keys).toContain('deviceId')
      expect(keys).toContain('name')
      expect(keys).toContain('uniqueDeviceId')
    })

    it('should have exactly 5 properties', () => {
      expect(Object.keys(TEST_DEVICE).length).toBe(5)
    })
  })
})
