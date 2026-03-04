import {
  featureFlagAdminApi,
  useCreateFeatureFlagMutation,
  useGetAdminFeatureFlagsQuery,
  useLazyGetAdminFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} from './feature-flag-admin-web.api'

describe('feature-flag-admin-web.api', () => {
  describe('featureFlagAdminApi', () => {
    it('should exist when imported', () => {
      expect(featureFlagAdminApi).toBeDefined()
    })

    it('should have all 3 endpoints', () => {
      const endpointNames = Object.keys(featureFlagAdminApi.endpoints)
      expect(endpointNames).toContain('createFeatureFlag')
      expect(endpointNames).toContain('getAdminFeatureFlags')
      expect(endpointNames).toContain('updateFeatureFlag')
    })
  })

  describe('exported hooks', () => {
    it('should export useCreateFeatureFlagMutation', () => {
      expect(useCreateFeatureFlagMutation).toBeDefined()
    })

    it('should export useGetAdminFeatureFlagsQuery', () => {
      expect(useGetAdminFeatureFlagsQuery).toBeDefined()
    })

    it('should export useLazyGetAdminFeatureFlagsQuery', () => {
      expect(useLazyGetAdminFeatureFlagsQuery).toBeDefined()
    })

    it('should export useUpdateFeatureFlagMutation', () => {
      expect(useUpdateFeatureFlagMutation).toBeDefined()
    })
  })
})
