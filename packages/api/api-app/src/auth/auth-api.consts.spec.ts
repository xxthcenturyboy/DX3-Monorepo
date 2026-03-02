import { AUTH_ROUTES_V1_RATE_LIMIT } from './auth-api.consts'

describe('Auth API Consts', () => {
  describe('AUTH_ROUTES_V1_RATE_LIMIT ', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(AUTH_ROUTES_V1_RATE_LIMIT).toBeDefined()
    })

    it('should have correct values', () => {
      // arrange
      // act
      // assert
      expect(AUTH_ROUTES_V1_RATE_LIMIT).toHaveLength(6)
      expect(AUTH_ROUTES_V1_RATE_LIMIT).toEqual([
        'api/auth/login',
        'api/auth/lookup',
        'api/auth/otp-code/send/email',
        'api/auth/otp-code/send/phone',
        'api/auth/refresh-token',
        'api/auth/validate/email',
      ])
    })
  })
})
