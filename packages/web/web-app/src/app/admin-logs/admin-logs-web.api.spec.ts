import {
  apiWebAdminLogs,
  useGetAdminLogsQuery,
  useGetAdminLogsRecentErrorsQuery,
  useGetAdminLogsStatsQuery,
  useGetAdminLogsStatusQuery,
  useLazyGetAdminLogsQuery,
  useLazyGetAdminLogsRecentErrorsQuery,
  useLazyGetAdminLogsStatsQuery,
  useLazyGetAdminLogsStatusQuery,
} from './admin-logs-web.api'

describe('admin-logs-web.api', () => {
  describe('apiWebAdminLogs', () => {
    it('should exist when imported', () => {
      expect(apiWebAdminLogs).toBeDefined()
    })

    it('should have all 4 endpoints', () => {
      const endpointNames = Object.keys(apiWebAdminLogs.endpoints)
      expect(endpointNames).toContain('getAdminLogs')
      expect(endpointNames).toContain('getAdminLogsRecentErrors')
      expect(endpointNames).toContain('getAdminLogsStats')
      expect(endpointNames).toContain('getAdminLogsStatus')
    })
  })

  describe('exported hooks', () => {
    it('should export useGetAdminLogsQuery', () => {
      expect(useGetAdminLogsQuery).toBeDefined()
    })

    it('should export useGetAdminLogsRecentErrorsQuery', () => {
      expect(useGetAdminLogsRecentErrorsQuery).toBeDefined()
    })

    it('should export useGetAdminLogsStatsQuery', () => {
      expect(useGetAdminLogsStatsQuery).toBeDefined()
    })

    it('should export useGetAdminLogsStatusQuery', () => {
      expect(useGetAdminLogsStatusQuery).toBeDefined()
    })

    it('should export useLazyGetAdminLogsQuery', () => {
      expect(useLazyGetAdminLogsQuery).toBeDefined()
    })

    it('should export useLazyGetAdminLogsRecentErrorsQuery', () => {
      expect(useLazyGetAdminLogsRecentErrorsQuery).toBeDefined()
    })

    it('should export useLazyGetAdminLogsStatsQuery', () => {
      expect(useLazyGetAdminLogsStatsQuery).toBeDefined()
    })

    it('should export useLazyGetAdminLogsStatusQuery', () => {
      expect(useLazyGetAdminLogsStatusQuery).toBeDefined()
    })
  })
})
