import {
  checkPhoneAvailabilityBodySchema,
  createPhoneBodySchema,
  phoneParamsSchema,
  updatePhoneBodySchema,
} from './phone-api.validation'

describe('phone-api.validation', () => {
  describe('checkPhoneAvailabilityBodySchema', () => {
    it('should accept valid phone and regionCode', () => {
      const result = checkPhoneAvailabilityBodySchema.safeParse({
        phone: '8584846800',
        regionCode: 'US',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing phone', () => {
      const result = checkPhoneAvailabilityBodySchema.safeParse({
        regionCode: 'US',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty phone', () => {
      const result = checkPhoneAvailabilityBodySchema.safeParse({
        phone: '',
        regionCode: 'US',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing regionCode', () => {
      const result = checkPhoneAvailabilityBodySchema.safeParse({
        phone: '8584846800',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty regionCode', () => {
      const result = checkPhoneAvailabilityBodySchema.safeParse({
        phone: '8584846800',
        regionCode: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createPhoneBodySchema', () => {
    it('should accept valid payload with required fields', () => {
      const result = createPhoneBodySchema.safeParse({
        def: false,
        label: 'Work',
        phone: '8584846800',
        userId: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional code, countryCode, regionCode, and signature', () => {
      const result = createPhoneBodySchema.safeParse({
        code: '123456',
        countryCode: '1',
        def: true,
        label: 'Primary',
        phone: '8584846800',
        regionCode: 'US',
        signature: 'sig',
        userId: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when label is empty', () => {
      const result = createPhoneBodySchema.safeParse({
        def: false,
        label: '',
        phone: '8584846800',
        userId: 'user-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when phone is empty', () => {
      const result = createPhoneBodySchema.safeParse({
        def: false,
        label: 'Work',
        phone: '',
        userId: 'user-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when userId is empty', () => {
      const result = createPhoneBodySchema.safeParse({
        def: false,
        label: 'Work',
        phone: '8584846800',
        userId: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePhoneBodySchema', () => {
    it('should accept empty object', () => {
      const result = updatePhoneBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept partial payload with def only', () => {
      const result = updatePhoneBodySchema.safeParse({ def: true })
      expect(result.success).toBe(true)
    })

    it('should accept partial payload with label only', () => {
      const result = updatePhoneBodySchema.safeParse({ label: 'Updated' })
      expect(result.success).toBe(true)
    })

    it('should accept both def and label', () => {
      const result = updatePhoneBodySchema.safeParse({
        def: true,
        label: 'Primary',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('phoneParamsSchema', () => {
    it('should accept valid id', () => {
      const result = phoneParamsSchema.safeParse({ id: 'phone-123' })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = phoneParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing id', () => {
      const result = phoneParamsSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
