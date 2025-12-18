import { AUTH_ENTITY_NAME } from './auth-api.consts'

describe('Auth API Consts', () => {
  describe('AUTH_ENTITY_NAME ', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(AUTH_ENTITY_NAME).toBeDefined()
    })

    it('should have correct value', () => {
      // arrange
      // act
      // assert
      expect(AUTH_ENTITY_NAME).toEqual('auth')
    })
  })
})
