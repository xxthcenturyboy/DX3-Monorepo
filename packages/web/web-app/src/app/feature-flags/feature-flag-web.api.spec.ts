import {
  featureFlagsApi,
  fetchFeatureFlags,
  useGetFeatureFlagsQuery,
  useLazyGetFeatureFlagsQuery,
} from './feature-flag-web.api'

describe('feature-flag-web.api', () => {
  describe('featureFlagsApi', () => {
    it('should exist when imported', () => {
      expect(featureFlagsApi).toBeDefined()
    })

    it('should have the getFeatureFlags endpoint', () => {
      expect(featureFlagsApi.endpoints.getFeatureFlags).toBeDefined()
    })
  })

  describe('fetchFeatureFlags', () => {
    it('should be exported as a standalone endpoint reference', () => {
      expect(fetchFeatureFlags).toBeDefined()
    })
  })

  describe('exported hooks', () => {
    it('should export useGetFeatureFlagsQuery', () => {
      expect(useGetFeatureFlagsQuery).toBeDefined()
    })

    it('should export useLazyGetFeatureFlagsQuery', () => {
      expect(useLazyGetFeatureFlagsQuery).toBeDefined()
    })
  })
})
