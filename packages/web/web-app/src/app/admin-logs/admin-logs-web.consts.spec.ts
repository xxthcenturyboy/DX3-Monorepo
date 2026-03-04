import { ADMIN_LOGS_ENTITY_NAME, ADMIN_LOGS_ROUTES } from './admin-logs-web.consts'

describe('admin-logs-web.consts', () => {
  describe('ADMIN_LOGS_ENTITY_NAME', () => {
    it('should be defined', () => {
      expect(ADMIN_LOGS_ENTITY_NAME).toBeDefined()
    })

    it('should equal "adminLogs"', () => {
      expect(ADMIN_LOGS_ENTITY_NAME).toBe('adminLogs')
    })
  })

  describe('ADMIN_LOGS_ROUTES', () => {
    it('should be defined', () => {
      expect(ADMIN_LOGS_ROUTES).toBeDefined()
    })

    it('should have a LIST route', () => {
      expect(ADMIN_LOGS_ROUTES.LIST).toBe('/admin-logs')
    })

    it('should have a MAIN route', () => {
      expect(ADMIN_LOGS_ROUTES.MAIN).toBe('/admin-logs')
    })

    it('should have LIST equal to MAIN', () => {
      expect(ADMIN_LOGS_ROUTES.LIST).toBe(ADMIN_LOGS_ROUTES.MAIN)
    })
  })
})
