import { FEATURE_FLAG_ADMIN_ROUTES } from './feature-flag-admin-web.consts'

describe('feature-flag-admin-web.consts', () => {
  describe('FEATURE_FLAG_ADMIN_ROUTES', () => {
    it('should have LIST route', () => {
      expect(FEATURE_FLAG_ADMIN_ROUTES.LIST).toBe('/sudo/feature-flags')
    })

    it('should have MAIN route', () => {
      expect(FEATURE_FLAG_ADMIN_ROUTES.MAIN).toBe('/sudo/feature-flags')
    })

    it('should have LIST equal to MAIN', () => {
      expect(FEATURE_FLAG_ADMIN_ROUTES.LIST).toBe(FEATURE_FLAG_ADMIN_ROUTES.MAIN)
    })
  })
})
