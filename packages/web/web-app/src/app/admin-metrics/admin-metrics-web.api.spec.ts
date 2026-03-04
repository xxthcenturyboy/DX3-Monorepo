import {
  apiWebAdminMetrics,
  useGetMetricsDAUQuery,
  useGetMetricsFeaturesQuery,
  useGetMetricsGrowthQuery,
  useGetMetricsMAUQuery,
  useGetMetricsSignupsQuery,
  useGetMetricsStatusQuery,
  useGetMetricsWAUQuery,
  useLazyGetMetricsDAUQuery,
  useLazyGetMetricsFeaturesQuery,
  useLazyGetMetricsGrowthQuery,
  useLazyGetMetricsMAUQuery,
  useLazyGetMetricsSignupsQuery,
  useLazyGetMetricsStatusQuery,
  useLazyGetMetricsWAUQuery,
} from './admin-metrics-web.api'


describe('admin-metrics-web.api', () => {
  describe('apiWebAdminMetrics', () => {
    it('should exist when imported', () => {
      expect(apiWebAdminMetrics).toBeDefined()
    })

    it('should have all 7 endpoints', () => {
      const endpointNames = Object.keys(apiWebAdminMetrics.endpoints)
      expect(endpointNames).toContain('getMetricsDAU')
      expect(endpointNames).toContain('getMetricsFeatures')
      expect(endpointNames).toContain('getMetricsGrowth')
      expect(endpointNames).toContain('getMetricsMAU')
      expect(endpointNames).toContain('getMetricsSignups')
      expect(endpointNames).toContain('getMetricsStatus')
      expect(endpointNames).toContain('getMetricsWAU')
    })
  })

  describe('exported query hooks', () => {
    it('should export useGetMetricsDAUQuery', () => {
      expect(useGetMetricsDAUQuery).toBeDefined()
    })

    it('should export useGetMetricsFeaturesQuery', () => {
      expect(useGetMetricsFeaturesQuery).toBeDefined()
    })

    it('should export useGetMetricsGrowthQuery', () => {
      expect(useGetMetricsGrowthQuery).toBeDefined()
    })

    it('should export useGetMetricsMAUQuery', () => {
      expect(useGetMetricsMAUQuery).toBeDefined()
    })

    it('should export useGetMetricsSignupsQuery', () => {
      expect(useGetMetricsSignupsQuery).toBeDefined()
    })

    it('should export useGetMetricsStatusQuery', () => {
      expect(useGetMetricsStatusQuery).toBeDefined()
    })

    it('should export useGetMetricsWAUQuery', () => {
      expect(useGetMetricsWAUQuery).toBeDefined()
    })
  })

  describe('exported lazy query hooks', () => {
    it('should export useLazyGetMetricsDAUQuery', () => {
      expect(useLazyGetMetricsDAUQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsFeaturesQuery', () => {
      expect(useLazyGetMetricsFeaturesQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsGrowthQuery', () => {
      expect(useLazyGetMetricsGrowthQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsMAUQuery', () => {
      expect(useLazyGetMetricsMAUQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsSignupsQuery', () => {
      expect(useLazyGetMetricsSignupsQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsStatusQuery', () => {
      expect(useLazyGetMetricsStatusQuery).toBeDefined()
    })

    it('should export useLazyGetMetricsWAUQuery', () => {
      expect(useLazyGetMetricsWAUQuery).toBeDefined()
    })
  })
})
