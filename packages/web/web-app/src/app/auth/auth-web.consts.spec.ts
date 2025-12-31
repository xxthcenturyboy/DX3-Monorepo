import { AUTH_ENTITY_NAME, AUTH_ROUTES } from './auth-web.consts'

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

describe('AUTH_ROUTES ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(AUTH_ROUTES).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(AUTH_ROUTES.CONFIRM).toEqual('/auth/confirm')
    expect(AUTH_ROUTES.EMAIL_VALIDATED).toEqual('/auth/email-validated')
    expect(AUTH_ROUTES.LOGIN).toEqual('/login')
    expect(AUTH_ROUTES.MAIN).toEqual('/auth')
    expect(AUTH_ROUTES.SIGNUP).toEqual('/signup')
    expect(AUTH_ROUTES.Z).toEqual('/auth/z')
  })
})
