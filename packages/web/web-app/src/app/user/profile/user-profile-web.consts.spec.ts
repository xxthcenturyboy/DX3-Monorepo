import { USER_PROFILE_ENTITY_NAME, USER_PROFILE_ROUTES } from './user-profile-web.consts'

describe('user-profile-web.consts', () => {
  describe('USER_PROFILE_ENTITY_NAME', () => {
    it('should be "userProfile"', () => {
      expect(USER_PROFILE_ENTITY_NAME).toBe('userProfile')
    })
  })

  describe('USER_PROFILE_ROUTES', () => {
    it('should have MAIN route', () => {
      expect(USER_PROFILE_ROUTES.MAIN).toBe('/profile')
    })
  })
})
