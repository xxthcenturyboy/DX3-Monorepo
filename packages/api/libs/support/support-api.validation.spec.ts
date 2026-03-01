import { SUPPORT_CATEGORY, SUPPORT_STATUS } from '@dx3/models-shared'

import {
  bulkUpdateSupportStatusBodySchema,
  createSupportRequestBodySchema,
  getSupportRequestsListQuerySchema,
  supportRequestParamsSchema,
  updateSupportRequestStatusBodySchema,
  userSupportRequestsParamsSchema,
} from './support-api.validation'

describe('support-api.validation', () => {
  describe('createSupportRequestBodySchema', () => {
    it('should accept valid payload', () => {
      const result = createSupportRequestBodySchema.safeParse({
        category: SUPPORT_CATEGORY.ISSUE,
        message: 'Test message',
        subject: 'Test subject',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing category', () => {
      const result = createSupportRequestBodySchema.safeParse({
        message: 'Test message',
        subject: 'Test subject',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid category', () => {
      const result = createSupportRequestBodySchema.safeParse({
        category: 'invalid',
        message: 'Test message',
        subject: 'Test subject',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty message', () => {
      const result = createSupportRequestBodySchema.safeParse({
        category: SUPPORT_CATEGORY.ISSUE,
        message: '',
        subject: 'Test subject',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty subject', () => {
      const result = createSupportRequestBodySchema.safeParse({
        category: SUPPORT_CATEGORY.ISSUE,
        message: 'Test message',
        subject: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateSupportRequestStatusBodySchema', () => {
    it('should accept valid status only', () => {
      const result = updateSupportRequestStatusBodySchema.safeParse({
        status: SUPPORT_STATUS.OPEN,
      })
      expect(result.success).toBe(true)
    })

    it('should accept status with assignedTo', () => {
      const result = updateSupportRequestStatusBodySchema.safeParse({
        assignedTo: 'admin-uuid',
        status: SUPPORT_STATUS.IN_PROGRESS,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const result = updateSupportRequestStatusBodySchema.safeParse({
        status: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('bulkUpdateSupportStatusBodySchema', () => {
    it('should accept valid payload', () => {
      const result = bulkUpdateSupportStatusBodySchema.safeParse({
        ids: ['550e8400-e29b-41d4-a716-446655440000'],
        status: SUPPORT_STATUS.CLOSED,
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty ids array', () => {
      const result = bulkUpdateSupportStatusBodySchema.safeParse({
        ids: [],
        status: SUPPORT_STATUS.CLOSED,
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid uuid in ids', () => {
      const result = bulkUpdateSupportStatusBodySchema.safeParse({
        ids: ['not-a-uuid'],
        status: SUPPORT_STATUS.CLOSED,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('getSupportRequestsListQuerySchema', () => {
    it('should accept empty object', () => {
      const result = getSupportRequestsListQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept valid query params', () => {
      const result = getSupportRequestsListQuerySchema.safeParse({
        category: SUPPORT_CATEGORY.ISSUE,
        limit: 10,
        offset: 0,
        openOnly: 'true',
        orderBy: 'createdAt',
        sortDir: 'DESC',
        status: SUPPORT_STATUS.OPEN,
        userId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('should transform openOnly string to boolean', () => {
      const result = getSupportRequestsListQuerySchema.safeParse({
        openOnly: 'true',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.openOnly).toBe(true)
      }
    })
  })

  describe('supportRequestParamsSchema', () => {
    it('should accept valid uuid', () => {
      const result = supportRequestParamsSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid uuid', () => {
      const result = supportRequestParamsSchema.safeParse({
        id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('userSupportRequestsParamsSchema', () => {
    it('should accept valid userId', () => {
      const result = userSupportRequestsParamsSchema.safeParse({
        userId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid userId', () => {
      const result = userSupportRequestsParamsSchema.safeParse({
        userId: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })
})
