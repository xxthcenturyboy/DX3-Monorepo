import {
  CATEGORY_LABEL_KEYS,
  STATUS_LABEL_KEYS,
  SUPPORT_ADMIN_ROUTES,
  SUPPORT_ROUTES,
} from './support.consts'

describe('support.consts', () => {
  describe('CATEGORY_LABEL_KEYS', () => {
    it('should be a non-empty object', () => {
      expect(Object.keys(CATEGORY_LABEL_KEYS).length).toBeGreaterThan(0)
    })

    it('should map ISSUE category', () => {
      expect(CATEGORY_LABEL_KEYS['issue']).toBe('SUPPORT_CATEGORY_ISSUE')
    })

    it('should map OTHER category', () => {
      expect(CATEGORY_LABEL_KEYS['other']).toBe('SUPPORT_CATEGORY_OTHER')
    })

    it('should have all values as string keys', () => {
      for (const value of Object.values(CATEGORY_LABEL_KEYS)) {
        expect(typeof value).toBe('string')
      }
    })
  })

  describe('STATUS_LABEL_KEYS', () => {
    it('should be a non-empty object', () => {
      expect(Object.keys(STATUS_LABEL_KEYS).length).toBeGreaterThan(0)
    })

    it('should map open status', () => {
      expect(STATUS_LABEL_KEYS['open']).toBe('SUPPORT_STATUS_OPEN')
    })

    it('should map closed status', () => {
      expect(STATUS_LABEL_KEYS['closed']).toBe('SUPPORT_STATUS_CLOSED')
    })
  })

  describe('SUPPORT_ROUTES', () => {
    it('should have MAIN route', () => {
      expect(SUPPORT_ROUTES.MAIN).toBe('/support')
    })
  })

  describe('SUPPORT_ADMIN_ROUTES', () => {
    it('should have MAIN route', () => {
      expect(SUPPORT_ADMIN_ROUTES.MAIN).toBe('/admin/support')
    })

    it('should have LIST route', () => {
      expect(SUPPORT_ADMIN_ROUTES.LIST).toBe('/admin/support/list')
    })

    it('should have DETAIL route', () => {
      expect(SUPPORT_ADMIN_ROUTES.DETAIL).toBe('/admin/support')
    })
  })
})
