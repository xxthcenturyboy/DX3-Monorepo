import { USER_LOOKUPS } from '@dx3/models-shared'

import {
  accountCreationBodySchema,
  checkPasswordStrengthBodySchema,
  loginBodySchema,
  rejectDeviceParamsSchema,
  sendOtpByIdBodySchema,
  sendOtpToEmailBodySchema,
  sendOtpToPhoneBodySchema,
  userLookupQuerySchema,
  validateEmailParamsSchema,
} from './auth-api.validation'

describe('auth-api.validation', () => {
  describe('accountCreationBodySchema', () => {
    it('should accept valid payload with code and value', () => {
      const result = accountCreationBodySchema.safeParse({
        code: '123456',
        value: 'test@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid payload with device', () => {
      const result = accountCreationBodySchema.safeParse({
        code: '123456',
        device: { uniqueDeviceId: 'device-1' },
        region: 'US',
        value: '+15551234567',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when value is missing', () => {
      const result = accountCreationBodySchema.safeParse({ code: '123456' })
      expect(result.success).toBe(false)
    })

    it('should reject when code is missing', () => {
      const result = accountCreationBodySchema.safeParse({ value: 'test@example.com' })
      expect(result.success).toBe(false)
    })

    it('should reject when device.uniqueDeviceId is empty', () => {
      const result = accountCreationBodySchema.safeParse({
        code: '123456',
        device: { uniqueDeviceId: '' },
        value: 'test@example.com',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('checkPasswordStrengthBodySchema', () => {
    it('should accept valid password', () => {
      const result = checkPasswordStrengthBodySchema.safeParse({ password: 'SecureP@ss1' })
      expect(result.success).toBe(true)
    })

    it('should reject empty password', () => {
      const result = checkPasswordStrengthBodySchema.safeParse({ password: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const result = checkPasswordStrengthBodySchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('loginBodySchema', () => {
    it('should accept valid payload with value only', () => {
      const result = loginBodySchema.safeParse({ value: 'test@example.com' })
      expect(result.success).toBe(true)
    })

    it('should accept valid payload with biometric', () => {
      const result = loginBodySchema.safeParse({
        biometric: {
          device: null,
          signature: 'sig',
          userId: 'user-1',
        },
        value: 'payload',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when value is missing', () => {
      const result = loginBodySchema.safeParse({ code: '123456' })
      expect(result.success).toBe(false)
    })

    it('should reject when biometric.userId is empty', () => {
      const result = loginBodySchema.safeParse({
        biometric: { signature: 'sig', userId: '' },
        value: 'payload',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('userLookupQuerySchema', () => {
    it('should accept valid email lookup', () => {
      const result = userLookupQuerySchema.safeParse({
        type: USER_LOOKUPS.EMAIL,
        value: 'test@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid phone lookup', () => {
      const result = userLookupQuerySchema.safeParse({
        region: 'US',
        type: USER_LOOKUPS.PHONE,
        value: '+15551234567',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid type', () => {
      const result = userLookupQuerySchema.safeParse({
        type: 'invalid',
        value: 'test@example.com',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when value is missing', () => {
      const result = userLookupQuerySchema.safeParse({ type: USER_LOOKUPS.EMAIL })
      expect(result.success).toBe(false)
    })
  })

  describe('sendOtpToEmailBodySchema', () => {
    it('should accept valid email', () => {
      const result = sendOtpToEmailBodySchema.safeParse({ email: 'test@example.com' })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = sendOtpToEmailBodySchema.safeParse({ email: 'not-an-email' })
      expect(result.success).toBe(false)
    })
  })

  describe('sendOtpToPhoneBodySchema', () => {
    it('should accept valid phone', () => {
      const result = sendOtpToPhoneBodySchema.safeParse({ phone: '+15551234567' })
      expect(result.success).toBe(true)
    })

    it('should reject empty phone', () => {
      const result = sendOtpToPhoneBodySchema.safeParse({ phone: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('rejectDeviceParamsSchema', () => {
    it('should accept valid id', () => {
      const result = rejectDeviceParamsSchema.safeParse({ id: 'device-1' })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = rejectDeviceParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('sendOtpByIdBodySchema', () => {
    it('should accept valid payload', () => {
      const result = sendOtpByIdBodySchema.safeParse({
        id: 'user-1',
        type: 'EMAIL',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid type', () => {
      const result = sendOtpByIdBodySchema.safeParse({
        id: 'user-1',
        type: 'INVALID',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateEmailParamsSchema', () => {
    it('should accept valid token', () => {
      const result = validateEmailParamsSchema.safeParse({ token: 'abc123' })
      expect(result.success).toBe(true)
    })

    it('should reject empty token', () => {
      const result = validateEmailParamsSchema.safeParse({ token: '' })
      expect(result.success).toBe(false)
    })
  })
})
