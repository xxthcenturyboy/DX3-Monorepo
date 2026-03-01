import {
  createFeatureFlagBodySchema,
  getFeatureFlagsListQuerySchema,
  updateFeatureFlagBodySchema,
} from './feature-flag-api.validation'

describe('feature-flag-api.validation', () => {
  describe('createFeatureFlagBodySchema', () => {
    it('should accept valid payload with required fields', () => {
      const result = createFeatureFlagBodySchema.safeParse({
        description: 'Test flag',
        name: 'BLOG',
        status: 'ACTIVE',
        target: 'ALL',
      })
      expect(result.success).toBe(true)
    })

    it('should accept payload with optional percentage', () => {
      const result = createFeatureFlagBodySchema.safeParse({
        description: 'Rollout flag',
        name: 'BLOG',
        percentage: 50,
        status: 'ROLLOUT',
        target: 'PERCENTAGE',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid name', () => {
      const result = createFeatureFlagBodySchema.safeParse({
        description: 'Test',
        name: 'INVALID_FLAG',
        status: 'ACTIVE',
        target: 'ALL',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const result = createFeatureFlagBodySchema.safeParse({
        description: 'Test',
        name: 'BLOG',
        status: 'INVALID',
        target: 'ALL',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid target', () => {
      const result = createFeatureFlagBodySchema.safeParse({
        description: 'Test',
        name: 'BLOG',
        status: 'ACTIVE',
        target: 'INVALID',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateFeatureFlagBodySchema', () => {
    it('should accept valid payload with id', () => {
      const result = updateFeatureFlagBodySchema.safeParse({
        id: 'flag-123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept partial payload', () => {
      const result = updateFeatureFlagBodySchema.safeParse({
        description: 'Updated',
        id: 'flag-123',
        status: 'DISABLED',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = updateFeatureFlagBodySchema.safeParse({
        id: '',
        status: 'ACTIVE',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('getFeatureFlagsListQuerySchema', () => {
    it('should accept empty query', () => {
      const result = getFeatureFlagsListQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept full query', () => {
      const result = getFeatureFlagsListQuerySchema.safeParse({
        filterValue: 'search',
        limit: 10,
        offset: 0,
        orderBy: 'name',
        sortDir: 'ASC',
      })
      expect(result.success).toBe(true)
    })
  })
})
