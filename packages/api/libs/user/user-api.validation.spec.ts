import { ACCOUNT_RESTRICTIONS, USER_ROLE } from '@dx3/models-shared'

import {
  checkUsernameAvailabilityQuerySchema,
  createUserBodySchema,
  getUserParamsSchema,
  getUsersListQuerySchema,
  updatePasswordBodySchema,
  updateUserBodySchema,
  updateUsernameBodySchema,
} from './user-api.validation'

describe('user-api.validation', () => {
  describe('createUserBodySchema', () => {
    it('should accept valid payload with required fields', () => {
      const result = createUserBodySchema.safeParse({
        email: 'test@example.com',
        roles: [USER_ROLE.USER],
        username: 'testuser',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional fields', () => {
      const result = createUserBodySchema.safeParse({
        countryCode: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        regionCode: 'US',
        roles: [USER_ROLE.ADMIN],
        shouldValidate: true,
        username: 'testuser',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = createUserBodySchema.safeParse({
        email: 'invalid',
        roles: [USER_ROLE.USER],
        username: 'testuser',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty roles array', () => {
      const result = createUserBodySchema.safeParse({
        email: 'test@example.com',
        roles: [],
        username: 'testuser',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty username', () => {
      const result = createUserBodySchema.safeParse({
        email: 'test@example.com',
        roles: [USER_ROLE.USER],
        username: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePasswordBodySchema', () => {
    it('should accept valid payload', () => {
      const result = updatePasswordBodySchema.safeParse({
        id: 'user-123',
        password: 'newpassword',
        passwordConfirm: 'newpassword',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional otp and signature', () => {
      const result = updatePasswordBodySchema.safeParse({
        id: 'user-123',
        otp: {
          code: '123456',
          id: 'otp-id',
          method: 'EMAIL',
        },
        password: 'newpassword',
        passwordConfirm: 'newpassword',
        signature: 'sig',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const result = updatePasswordBodySchema.safeParse({
        id: 'user-123',
        password: '',
        passwordConfirm: 'newpassword',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateUserBodySchema', () => {
    it('should accept valid payload with id only', () => {
      const result = updateUserBodySchema.safeParse({
        id: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional fields', () => {
      const result = updateUserBodySchema.safeParse({
        firstName: 'Updated',
        id: 'user-123',
        lastName: 'Name',
        restrictions: [ACCOUNT_RESTRICTIONS.ADMIN_LOCKOUT],
        roles: [USER_ROLE.ADMIN],
        timezone: 'America/New_York',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = updateUserBodySchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateUsernameBodySchema', () => {
    it('should accept valid payload', () => {
      const result = updateUsernameBodySchema.safeParse({
        username: 'newusername',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional otpCode and signature', () => {
      const result = updateUsernameBodySchema.safeParse({
        otpCode: '123456',
        signature: 'sig',
        username: 'newusername',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty username', () => {
      const result = updateUsernameBodySchema.safeParse({
        username: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('getUserParamsSchema', () => {
    it('should accept valid id', () => {
      const result = getUserParamsSchema.safeParse({ id: 'user-123' })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = getUserParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('checkUsernameAvailabilityQuerySchema', () => {
    it('should accept valid username', () => {
      const result = checkUsernameAvailabilityQuerySchema.safeParse({
        username: 'testuser',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty username', () => {
      const result = checkUsernameAvailabilityQuerySchema.safeParse({
        username: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('getUsersListQuerySchema', () => {
    it('should accept empty object', () => {
      const result = getUsersListQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept valid query params', () => {
      const result = getUsersListQuerySchema.safeParse({
        filterValue: 'test',
        limit: 10,
        offset: 0,
        orderBy: 'username',
        sortDir: 'ASC',
      })
      expect(result.success).toBe(true)
    })

    it('should coerce limit and offset to numbers', () => {
      const result = getUsersListQuerySchema.safeParse({
        limit: '10',
        offset: '0',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
      }
    })
  })
})
