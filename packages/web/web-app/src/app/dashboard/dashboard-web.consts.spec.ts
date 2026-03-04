import { DASHBOARD_ENTITY_NAME, DASHBOARD_ROUTES } from './dashboard-web.consts'

describe('dashboard-web.consts', () => {
  describe('DASHBOARD_ENTITY_NAME', () => {
    it('should be "dashboard"', () => {
      expect(DASHBOARD_ENTITY_NAME).toBe('dashboard')
    })
  })

  describe('DASHBOARD_ROUTES', () => {
    it('should have a MAIN route', () => {
      expect(DASHBOARD_ROUTES.MAIN).toBe('/dashboard')
    })
  })
})
