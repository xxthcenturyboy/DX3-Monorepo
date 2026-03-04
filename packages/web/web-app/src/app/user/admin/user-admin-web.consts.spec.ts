import { USER_ADMIN_ENTITY_NAME, USER_ADMIN_ROUTES } from './user-admin-web.consts'

describe('user-admin-web.consts', () => {
  describe('USER_ADMIN_ENTITY_NAME', () => {
    it('should be "userAdmin"', () => {
      expect(USER_ADMIN_ENTITY_NAME).toBe('userAdmin')
    })
  })

  describe('USER_ADMIN_ROUTES', () => {
    it('should have MAIN route', () => {
      expect(USER_ADMIN_ROUTES.MAIN).toBe('/admin/user')
    })

    it('should have LIST route', () => {
      expect(USER_ADMIN_ROUTES.LIST).toBe('/admin/user/list')
    })

    it('should have DETAIL route', () => {
      expect(USER_ADMIN_ROUTES.DETAIL).toBe('/admin/user/detail')
    })
  })
})
