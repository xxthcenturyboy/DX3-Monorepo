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
        'api/v1/auth/login',
        'api/v1/auth/lookup',
        'api/v1/auth/otp-code/send/email',
        'api/v1/auth/otp-code/send/phone',
        'api/v1/auth/refresh-token',
        'api/v1/auth/validate/email',
      ])
    })
  })
})
