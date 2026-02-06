import { AdminLogsRoutes } from './admin-logs-api.routes'

describe('AdminLogsRoutes', () => {
  describe('configure', () => {
    it('should exist', () => {
      expect(AdminLogsRoutes.configure).toBeDefined()
    })

    it('should return a router', () => {
      const router = AdminLogsRoutes.configure()
      expect(router).toBeDefined()
      expect(typeof router).toBe('function')
    })
  })
})
