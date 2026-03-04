import { FEATURE_FLAGS_ENTITY_NAME, FEATURE_FLAGS_STALE_TIME } from './feature-flag-web.consts'

describe('feature-flag-web.consts', () => {
  describe('FEATURE_FLAGS_ENTITY_NAME', () => {
    it('should be "featureFlags"', () => {
      expect(FEATURE_FLAGS_ENTITY_NAME).toBe('featureFlags')
    })
  })

  describe('FEATURE_FLAGS_STALE_TIME', () => {
    it('should be a positive number', () => {
      expect(FEATURE_FLAGS_STALE_TIME).toBeGreaterThan(0)
    })

    it('should be 300000ms (5 minutes)', () => {
      expect(FEATURE_FLAGS_STALE_TIME).toBe(300000)
    })
  })
})
