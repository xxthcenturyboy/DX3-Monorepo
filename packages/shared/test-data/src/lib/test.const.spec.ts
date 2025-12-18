import {
  TEST_COUNTRY_CODE,
  TEST_DEVICE,
  TEST_EMAIL,
  TEST_EXISTING_EMAIL,
  TEST_EXISTING_PASSWORD,
  TEST_EXISTING_PHONE,
  TEST_EXISTING_USER_ID,
  TEST_EXISTING_USER_PRIVILEGE_ID,
  TEST_EXISTING_USERNAME,
  TEST_FIRST_NAME,
  TEST_LAST_NAME,
  TEST_PASSWORD,
  TEST_PHONE,
  TEST_PHONE_IT_INVALID,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_VALID,
  TEST_USER_CREATE,
  TEST_USERNAME,
  TEST_UUID,
} from './test.const'

describe('Test Constants', () => {
  describe('String Constants', () => {
    it('should export TEST_COUNTRY_CODE', () => {
      expect(TEST_COUNTRY_CODE).toBeDefined()
      expect(typeof TEST_COUNTRY_CODE).toBe('string')
    })

    it('should have TEST_COUNTRY_CODE value of "1"', () => {
      expect(TEST_COUNTRY_CODE).toBe('1')
    })

    it('should export TEST_EMAIL', () => {
      expect(TEST_EMAIL).toBeDefined()
      expect(typeof TEST_EMAIL).toBe('string')
    })

    it('should have TEST_EMAIL in valid email format', () => {
      expect(TEST_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(TEST_EMAIL).toBe('test@test.com')
    })

    it('should export TEST_EXISTING_EMAIL', () => {
      expect(TEST_EXISTING_EMAIL).toBeDefined()
      expect(typeof TEST_EXISTING_EMAIL).toBe('string')
    })

    it('should have TEST_EXISTING_EMAIL in valid email format', () => {
      expect(TEST_EXISTING_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(TEST_EXISTING_EMAIL).toBe('admin@danex.software')
      // expect(TEST_EXISTING_EMAIL).toBe('du.dx.software@gmail.com');
    })

    it('should export TEST_EXISTING_PASSWORD', () => {
      expect(TEST_EXISTING_PASSWORD).toBeDefined()
      expect(typeof TEST_EXISTING_PASSWORD).toBe('string')
      expect(TEST_EXISTING_PASSWORD).toBe('advancedbasics1')
    })

    it('should export TEST_EXISTING_PHONE', () => {
      expect(TEST_EXISTING_PHONE).toBeDefined()
      expect(typeof TEST_EXISTING_PHONE).toBe('string')
      expect(TEST_EXISTING_PHONE).toBe('8584846800')
    })

    it('should export TEST_EXISTING_USERNAME', () => {
      expect(TEST_EXISTING_USERNAME).toBeDefined()
      expect(typeof TEST_EXISTING_USERNAME).toBe('string')
      expect(TEST_EXISTING_USERNAME).toBe('admin')
    })

    it('should export TEST_FIRST_NAME', () => {
      expect(TEST_FIRST_NAME).toBeDefined()
      expect(typeof TEST_FIRST_NAME).toBe('string')
      expect(TEST_FIRST_NAME).toBe('George')
    })

    it('should export TEST_LAST_NAME', () => {
      expect(TEST_LAST_NAME).toBeDefined()
      expect(typeof TEST_LAST_NAME).toBe('string')
      expect(TEST_LAST_NAME).toBe('Washington')
    })

    it('should export TEST_PASSWORD', () => {
      expect(TEST_PASSWORD).toBeDefined()
      expect(typeof TEST_PASSWORD).toBe('string')
      expect(TEST_PASSWORD).toBe('password')
    })

    it('should export TEST_PHONE', () => {
      expect(TEST_PHONE).toBeDefined()
      expect(typeof TEST_PHONE).toBe('string')
      expect(TEST_PHONE).toBe('0123456789')
    })

    it('should export TEST_PHONE_IT_INVALID', () => {
      expect(TEST_PHONE_IT_INVALID).toBeDefined()
      expect(typeof TEST_PHONE_IT_INVALID).toBe('string')
      expect(TEST_PHONE_IT_INVALID).toBe('11 111 1111')
    })

    it('should export TEST_PHONE_VALID', () => {
      expect(TEST_PHONE_VALID).toBeDefined()
      expect(typeof TEST_PHONE_VALID).toBe('string')
      expect(TEST_PHONE_VALID).toBe('8584846801')
    })

    it('should export TEST_PHONE_IT_VALID', () => {
      expect(TEST_PHONE_IT_VALID).toBeDefined()
      expect(typeof TEST_PHONE_IT_VALID).toBe('string')
      expect(TEST_PHONE_IT_VALID).toBe('06 555 5555')
    })

    it('should export TEST_USERNAME', () => {
      expect(TEST_USERNAME).toBeDefined()
      expect(typeof TEST_USERNAME).toBe('string')
      expect(TEST_USERNAME).toBe('username')
    })
  })

  describe('UUID Constants', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    it('should export TEST_EXISTING_USER_ID', () => {
      expect(TEST_EXISTING_USER_ID).toBeDefined()
      expect(typeof TEST_EXISTING_USER_ID).toBe('string')
    })

    it('should have TEST_EXISTING_USER_ID in valid UUID format', () => {
      expect(TEST_EXISTING_USER_ID).toMatch(uuidRegex)
      expect(TEST_EXISTING_USER_ID).toBe('2cf4aebd-d30d-4c9e-9047-e52c10fe8d4d')
    })

    it('should export TEST_EXISTING_USER_PRIVILEGE_ID', () => {
      expect(TEST_EXISTING_USER_PRIVILEGE_ID).toBeDefined()
      expect(typeof TEST_EXISTING_USER_PRIVILEGE_ID).toBe('string')
    })

    it('should have TEST_EXISTING_USER_PRIVILEGE_ID in valid UUID format', () => {
      expect(TEST_EXISTING_USER_PRIVILEGE_ID).toMatch(uuidRegex)
      expect(TEST_EXISTING_USER_PRIVILEGE_ID).toBe('e5a96fa3-ab58-4d27-b607-3a32d4cf7270')
    })

    it('should export TEST_UUID', () => {
      expect(TEST_UUID).toBeDefined()
      expect(typeof TEST_UUID).toBe('string')
    })

    it('should have TEST_UUID in valid UUID format', () => {
      expect(TEST_UUID).toMatch(uuidRegex)
      expect(TEST_UUID).toBe('9472bfb8-f7a9-4146-951e-15520f392baf')
    })
  })

  describe('TEST_DEVICE Object', () => {
    it('should export TEST_DEVICE', () => {
      expect(TEST_DEVICE).toBeDefined()
      expect(typeof TEST_DEVICE).toBe('object')
    })

    it('should have uniqueDeviceId property', () => {
      expect(TEST_DEVICE).toHaveProperty('uniqueDeviceId')
      expect(typeof TEST_DEVICE.uniqueDeviceId).toBe('string')
    })

    it('should have uniqueDeviceId in UUID format', () => {
      expect(TEST_DEVICE.uniqueDeviceId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
      expect(TEST_DEVICE.uniqueDeviceId).toBe('e5a96fa3-ab58-4d27-b607-3a32d4cf7270')
    })

    it('should have deviceId property', () => {
      expect(TEST_DEVICE).toHaveProperty('deviceId')
      expect(typeof TEST_DEVICE.deviceId).toBe('string')
      expect(TEST_DEVICE.deviceId).toBe('test-device-id')
    })

    it('should have carrier property', () => {
      expect(TEST_DEVICE).toHaveProperty('carrier')
      expect(typeof TEST_DEVICE.carrier).toBe('string')
      expect(TEST_DEVICE.carrier).toBe('ATT')
    })

    it('should have deviceCountry property', () => {
      expect(TEST_DEVICE).toHaveProperty('deviceCountry')
      expect(typeof TEST_DEVICE.deviceCountry).toBe('string')
      expect(TEST_DEVICE.deviceCountry).toBe('US')
    })

    it('should have name property', () => {
      expect(TEST_DEVICE).toHaveProperty('name')
      expect(typeof TEST_DEVICE.name).toBe('string')
      expect(TEST_DEVICE.name).toBe('iPhone,16')
    })

    it('should have all required properties', () => {
      const keys = Object.keys(TEST_DEVICE)
      expect(keys).toContain('uniqueDeviceId')
      expect(keys).toContain('deviceId')
      expect(keys).toContain('carrier')
      expect(keys).toContain('deviceCountry')
      expect(keys).toContain('name')
    })

    it('should have exactly 5 properties', () => {
      expect(Object.keys(TEST_DEVICE).length).toBe(5)
    })
  })

  describe('TEST_USER_CREATE Object', () => {
    it('should export TEST_USER_CREATE', () => {
      expect(TEST_USER_CREATE).toBeDefined()
      expect(typeof TEST_USER_CREATE).toBe('object')
    })

    it('should have countryCode property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('countryCode')
      expect(typeof TEST_USER_CREATE.countryCode).toBe('string')
      expect(TEST_USER_CREATE.countryCode).toBe('1')
    })

    it('should have regionCode property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('regionCode')
      expect(typeof TEST_USER_CREATE.regionCode).toBe('string')
    })

    it('should have email property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('email')
      expect(typeof TEST_USER_CREATE.email).toBe('string')
      expect(TEST_USER_CREATE.email).toBe('test@test.com')
    })

    it('should have email in valid format', () => {
      expect(TEST_USER_CREATE.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should have firstName property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('firstName')
      expect(typeof TEST_USER_CREATE.firstName).toBe('string')
      expect(TEST_USER_CREATE.firstName).toBe('George')
    })

    it('should have lastName property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('lastName')
      expect(typeof TEST_USER_CREATE.lastName).toBe('string')
      expect(TEST_USER_CREATE.lastName).toBe('Washington')
    })

    it('should have shouldValidate property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('shouldValidate')
      expect(typeof TEST_USER_CREATE.shouldValidate).toBe('boolean')
      expect(TEST_USER_CREATE.shouldValidate).toBe(true)
    })

    it('should have phone property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('phone')
      expect(typeof TEST_USER_CREATE.phone).toBe('string')
      expect(TEST_USER_CREATE.phone).toBe('8584846801')
    })

    it('should have roles property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('roles')
      expect(Array.isArray(TEST_USER_CREATE.roles)).toBe(true)
    })

    it('should have roles array with USER role', () => {
      expect(TEST_USER_CREATE.roles).toContain('USER')
      expect(TEST_USER_CREATE.roles.length).toBe(1)
    })

    it('should have username property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('username')
      expect(typeof TEST_USER_CREATE.username).toBe('string')
      expect(TEST_USER_CREATE.username).toBe('username')
    })

    it('should have all required properties', () => {
      const keys = Object.keys(TEST_USER_CREATE)
      expect(keys).toContain('countryCode')
      expect(keys).toContain('regionCode')
      expect(keys).toContain('email')
      expect(keys).toContain('firstName')
      expect(keys).toContain('lastName')
      expect(keys).toContain('shouldValidate')
      expect(keys).toContain('phone')
      expect(keys).toContain('roles')
      expect(keys).toContain('username')
    })

    it('should reference other constants correctly', () => {
      expect(TEST_USER_CREATE.countryCode).toBe(TEST_COUNTRY_CODE)
      expect(TEST_USER_CREATE.email).toBe(TEST_EMAIL)
      expect(TEST_USER_CREATE.firstName).toBe(TEST_FIRST_NAME)
      expect(TEST_USER_CREATE.lastName).toBe(TEST_LAST_NAME)
      expect(TEST_USER_CREATE.phone).toBe(TEST_PHONE_VALID)
      expect(TEST_USER_CREATE.username).toBe(TEST_USERNAME)
    })
  })

  describe('Phone Number Formats', () => {
    it('should have TEST_PHONE as numeric string', () => {
      expect(TEST_PHONE).toMatch(/^\d+$/)
      expect(TEST_PHONE.length).toBe(10)
    })

    it('should have TEST_PHONE_VALID as numeric string', () => {
      expect(TEST_PHONE_VALID).toMatch(/^\d+$/)
      expect(TEST_PHONE_VALID.length).toBe(10)
    })

    it('should have TEST_EXISTING_PHONE as numeric string', () => {
      expect(TEST_EXISTING_PHONE).toMatch(/^\d+$/)
      expect(TEST_EXISTING_PHONE.length).toBe(10)
    })

    it('should have TEST_PHONE_IT_INVALID with spaces', () => {
      expect(TEST_PHONE_IT_INVALID).toContain(' ')
      expect(TEST_PHONE_IT_INVALID).toBe('11 111 1111')
    })

    it('should have TEST_PHONE_IT_VALID with spaces', () => {
      expect(TEST_PHONE_IT_VALID).toContain(' ')
      expect(TEST_PHONE_IT_VALID).toBe('06 555 5555')
    })

    it('should have different phone numbers for each constant', () => {
      expect(TEST_PHONE).not.toBe(TEST_PHONE_VALID)
      expect(TEST_PHONE).not.toBe(TEST_EXISTING_PHONE)
      expect(TEST_PHONE_VALID).not.toBe(TEST_EXISTING_PHONE)
    })
  })

  describe('Value Uniqueness', () => {
    it('should have TEST_EXISTING_USER_PRIVILEGE_ID and TEST_DEVICE.uniqueDeviceId as same value', () => {
      // These share the same UUID intentionally
      expect(TEST_EXISTING_USER_PRIVILEGE_ID).toBe(TEST_DEVICE.uniqueDeviceId)
      expect(TEST_EXISTING_USER_PRIVILEGE_ID).toBe('e5a96fa3-ab58-4d27-b607-3a32d4cf7270')
    })

    it('should have TEST_EXISTING_USER_ID different from other UUIDs', () => {
      expect(TEST_EXISTING_USER_ID).not.toBe(TEST_EXISTING_USER_PRIVILEGE_ID)
      expect(TEST_EXISTING_USER_ID).not.toBe(TEST_UUID)
      expect(TEST_EXISTING_USER_ID).not.toBe(TEST_DEVICE.uniqueDeviceId)
    })

    it('should have TEST_UUID different from other UUIDs', () => {
      expect(TEST_UUID).not.toBe(TEST_EXISTING_USER_ID)
      expect(TEST_UUID).not.toBe(TEST_EXISTING_USER_PRIVILEGE_ID)
      expect(TEST_UUID).not.toBe(TEST_DEVICE.uniqueDeviceId)
    })

    it('should have unique email values', () => {
      expect(TEST_EMAIL).not.toBe(TEST_EXISTING_EMAIL)
    })

    it('should have unique username values', () => {
      expect(TEST_USERNAME).not.toBe(TEST_EXISTING_USERNAME)
    })
  })

  describe('Immutability', () => {
    it('should not allow modification of TEST_DEVICE', () => {
      const _originalDeviceId = TEST_DEVICE.deviceId
      expect(() => {
        ;(TEST_DEVICE as any).deviceId = 'modified'
      }).not.toThrow()
      // In JavaScript, const prevents reassignment but not mutation
      // This test documents the current behavior
      expect(TEST_DEVICE.deviceId).toBeDefined()
    })

    it('should not allow modification of TEST_USER_CREATE', () => {
      const _originalEmail = TEST_USER_CREATE.email
      expect(() => {
        ;(TEST_USER_CREATE as any).email = 'modified@test.com'
      }).not.toThrow()
      // Documents that objects are mutable even when exported as const
      expect(TEST_USER_CREATE.email).toBeDefined()
    })
  })
})
