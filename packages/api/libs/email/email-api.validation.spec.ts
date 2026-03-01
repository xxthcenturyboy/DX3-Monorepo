import {
  checkEmailAvailabilityBodySchema,
  createEmailBodySchema,
  emailParamsSchema,
  updateEmailBodySchema,
} from './email-api.validation'

describe('email-api.validation', () => {
  describe('checkEmailAvailabilityBodySchema', () => {
    it('should accept valid email', () => {
      const result = checkEmailAvailabilityBodySchema.safeParse({
        email: 'test@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = checkEmailAvailabilityBodySchema.safeParse({
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const result = checkEmailAvailabilityBodySchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('createEmailBodySchema', () => {
    it('should accept valid payload with required fields', () => {
      const result = createEmailBodySchema.safeParse({
        def: true,
        email: 'test@example.com',
        label: 'Primary',
        userId: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional code and signature', () => {
      const result = createEmailBodySchema.safeParse({
        code: '123456',
        def: false,
        email: 'test@example.com',
        label: 'Work',
        signature: 'sig',
        userId: 'user-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when email is invalid', () => {
      const result = createEmailBodySchema.safeParse({
        def: true,
        email: 'invalid',
        label: 'Primary',
        userId: 'user-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when label is empty', () => {
      const result = createEmailBodySchema.safeParse({
        def: true,
        email: 'test@example.com',
        label: '',
        userId: 'user-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject when userId is empty', () => {
      const result = createEmailBodySchema.safeParse({
        def: true,
        email: 'test@example.com',
        label: 'Primary',
        userId: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateEmailBodySchema', () => {
    it('should accept empty object', () => {
      const result = updateEmailBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept partial payload', () => {
      const result = updateEmailBodySchema.safeParse({
        def: true,
        label: 'Updated',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('emailParamsSchema', () => {
    it('should accept valid id', () => {
      const result = emailParamsSchema.safeParse({ id: 'email-123' })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = emailParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })
})
