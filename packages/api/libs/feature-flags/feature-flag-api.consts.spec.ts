import {
  FEATURE_FLAG_CACHE_PREFIX,
  FEATURE_FLAG_CACHE_TTL,
  FEATURE_FLAG_ENTITY_NAME,
  FEATURE_FLAG_SORT_FIELDS,
} from './feature-flag-api.consts'

describe('feature-flag-api.consts', () => {
  describe('FEATURE_FLAG_ENTITY_NAME', () => {
    it('should exist when imported', () => {
      expect(FEATURE_FLAG_ENTITY_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      expect(FEATURE_FLAG_ENTITY_NAME).toEqual('feature_flags')
    })
  })

  describe('FEATURE_FLAG_CACHE_PREFIX', () => {
    it('should exist when imported', () => {
      expect(FEATURE_FLAG_CACHE_PREFIX).toBeDefined()
    })

    it('should have correct value', () => {
      expect(FEATURE_FLAG_CACHE_PREFIX).toEqual('ff')
    })
  })

  describe('FEATURE_FLAG_CACHE_TTL', () => {
    it('should exist when imported', () => {
      expect(FEATURE_FLAG_CACHE_TTL).toBeDefined()
    })

    it('should be 300 seconds', () => {
      expect(FEATURE_FLAG_CACHE_TTL).toBe(300)
    })
  })

  describe('FEATURE_FLAG_SORT_FIELDS', () => {
    it('should exist when imported', () => {
      expect(FEATURE_FLAG_SORT_FIELDS).toBeDefined()
    })

    it('should contain expected sort fields', () => {
      expect(FEATURE_FLAG_SORT_FIELDS).toEqual([
        'createdAt',
        'description',
        'name',
        'percentage',
        'status',
        'target',
        'updatedAt',
      ])
    })
  })
})
