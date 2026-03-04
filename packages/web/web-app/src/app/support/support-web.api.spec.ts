import {
  apiWebSupport,
  fetchSupportUnviewedCount,
  useBulkUpdateSupportStatusMutation,
  useCreateSupportRequestMutation,
  useGetSupportRequestByIdQuery,
  useGetSupportRequestListQuery,
  useGetSupportRequestsByUserIdQuery,
  useGetSupportUnviewedCountQuery,
  useLazyGetSupportRequestByIdQuery,
  useLazyGetSupportRequestListQuery,
  useLazyGetSupportRequestsByUserIdQuery,
  useLazyGetSupportUnviewedCountQuery,
  useMarkAllSupportAsViewedMutation,
  useMarkSupportAsViewedMutation,
  useUpdateSupportRequestStatusMutation,
} from './support-web.api'

describe('support-web.api', () => {
  describe('apiWebSupport', () => {
    it('should exist when imported', () => {
      expect(apiWebSupport).toBeDefined()
    })

    it('should have all 9 endpoints', () => {
      const endpointNames = Object.keys(apiWebSupport.endpoints)
      expect(endpointNames).toContain('bulkUpdateSupportStatus')
      expect(endpointNames).toContain('createSupportRequest')
      expect(endpointNames).toContain('getSupportRequestById')
      expect(endpointNames).toContain('getSupportRequestList')
      expect(endpointNames).toContain('getSupportRequestsByUserId')
      expect(endpointNames).toContain('getSupportUnviewedCount')
      expect(endpointNames).toContain('markAllSupportAsViewed')
      expect(endpointNames).toContain('markSupportAsViewed')
      expect(endpointNames).toContain('updateSupportRequestStatus')
    })
  })

  describe('fetchSupportUnviewedCount', () => {
    it('should be an endpoint reference', () => {
      expect(fetchSupportUnviewedCount).toBeDefined()
    })
  })

  describe('exported mutation hooks', () => {
    it('should export useBulkUpdateSupportStatusMutation', () => {
      expect(useBulkUpdateSupportStatusMutation).toBeDefined()
    })

    it('should export useCreateSupportRequestMutation', () => {
      expect(useCreateSupportRequestMutation).toBeDefined()
    })

    it('should export useMarkAllSupportAsViewedMutation', () => {
      expect(useMarkAllSupportAsViewedMutation).toBeDefined()
    })

    it('should export useMarkSupportAsViewedMutation', () => {
      expect(useMarkSupportAsViewedMutation).toBeDefined()
    })

    it('should export useUpdateSupportRequestStatusMutation', () => {
      expect(useUpdateSupportRequestStatusMutation).toBeDefined()
    })
  })

  describe('exported query hooks', () => {
    it('should export useGetSupportRequestByIdQuery', () => {
      expect(useGetSupportRequestByIdQuery).toBeDefined()
    })

    it('should export useGetSupportRequestListQuery', () => {
      expect(useGetSupportRequestListQuery).toBeDefined()
    })

    it('should export useGetSupportRequestsByUserIdQuery', () => {
      expect(useGetSupportRequestsByUserIdQuery).toBeDefined()
    })

    it('should export useGetSupportUnviewedCountQuery', () => {
      expect(useGetSupportUnviewedCountQuery).toBeDefined()
    })

    it('should export useLazyGetSupportRequestByIdQuery', () => {
      expect(useLazyGetSupportRequestByIdQuery).toBeDefined()
    })

    it('should export useLazyGetSupportRequestListQuery', () => {
      expect(useLazyGetSupportRequestListQuery).toBeDefined()
    })

    it('should export useLazyGetSupportRequestsByUserIdQuery', () => {
      expect(useLazyGetSupportRequestsByUserIdQuery).toBeDefined()
    })

    it('should export useLazyGetSupportUnviewedCountQuery', () => {
      expect(useLazyGetSupportUnviewedCountQuery).toBeDefined()
    })
  })
})
