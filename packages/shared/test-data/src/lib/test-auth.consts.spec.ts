import { PHONE_DEFAULT_REGION_CODE, USER_ROLE } from '@dx3/models-shared'

import { TEST_AUTH_PASSWORD, TEST_AUTH_USERNAME, TEST_USER_CREATE } from './test-auth.consts'
import { TEST_EMAIL } from './test-email.consts'
import { TEST_PHONE_COUNTRY_CODE, TEST_PHONE_VALID } from './test-phone.consts'
import { TEST_NAME_FIRST_USER, TEST_NAME_LAST_USER } from './test-user.consts'

describe('Test Auth Constants (test-auth.consts.ts)', () => {
  describe('Auth Credential Constants', () => {
    it('should export TEST_AUTH_PASSWORD', () => {
      expect(TEST_AUTH_PASSWORD).toBeDefined()
      expect(typeof TEST_AUTH_PASSWORD).toBe('string')
      expect(TEST_AUTH_PASSWORD).toBe('password')
    })

    it('should export TEST_AUTH_USERNAME', () => {
      expect(TEST_AUTH_USERNAME).toBeDefined()
      expect(typeof TEST_AUTH_USERNAME).toBe('string')
      expect(TEST_AUTH_USERNAME).toBe('username')
    })

    it('should have non-empty credentials', () => {
      expect(TEST_AUTH_PASSWORD.length).toBeGreaterThan(0)
      expect(TEST_AUTH_USERNAME.length).toBeGreaterThan(0)
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
      expect(TEST_USER_CREATE.countryCode).toBe(TEST_PHONE_COUNTRY_CODE)
    })

    it('should have email property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('email')
      expect(typeof TEST_USER_CREATE.email).toBe('string')
      expect(TEST_USER_CREATE.email).toBe(TEST_EMAIL)
    })

    it('should have email in valid format', () => {
      expect(TEST_USER_CREATE.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should have firstName property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('firstName')
      expect(typeof TEST_USER_CREATE.firstName).toBe('string')
      expect(TEST_USER_CREATE.firstName).toBe(TEST_NAME_FIRST_USER)
    })

    it('should have lastName property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('lastName')
      expect(typeof TEST_USER_CREATE.lastName).toBe('string')
      expect(TEST_USER_CREATE.lastName).toBe(TEST_NAME_LAST_USER)
    })

    it('should have phone property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('phone')
      expect(typeof TEST_USER_CREATE.phone).toBe('string')
      expect(TEST_USER_CREATE.phone).toBe(TEST_PHONE_VALID)
    })

    it('should have regionCode property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('regionCode')
      expect(typeof TEST_USER_CREATE.regionCode).toBe('string')
      expect(TEST_USER_CREATE.regionCode).toBe(PHONE_DEFAULT_REGION_CODE)
    })

    it('should have roles property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('roles')
      expect(Array.isArray(TEST_USER_CREATE.roles)).toBe(true)
    })

    it('should have roles array with USER role', () => {
      expect(TEST_USER_CREATE.roles).toContain(USER_ROLE.USER)
      expect(TEST_USER_CREATE.roles.length).toBe(1)
    })

    it('should have shouldValidate property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('shouldValidate')
      expect(typeof TEST_USER_CREATE.shouldValidate).toBe('boolean')
      expect(TEST_USER_CREATE.shouldValidate).toBe(true)
    })

    it('should have username property', () => {
      expect(TEST_USER_CREATE).toHaveProperty('username')
      expect(typeof TEST_USER_CREATE.username).toBe('string')
      expect(TEST_USER_CREATE.username).toBe(TEST_AUTH_USERNAME)
    })

    it('should have all required CreateUserPayloadType properties', () => {
      const keys = Object.keys(TEST_USER_CREATE)
      expect(keys).toContain('countryCode')
      expect(keys).toContain('email')
      expect(keys).toContain('firstName')
      expect(keys).toContain('lastName')
      expect(keys).toContain('phone')
      expect(keys).toContain('regionCode')
      expect(keys).toContain('roles')
      expect(keys).toContain('shouldValidate')
      expect(keys).toContain('username')
    })

    it('should have exactly 9 properties', () => {
      expect(Object.keys(TEST_USER_CREATE).length).toBe(9)
    })
  })
})
