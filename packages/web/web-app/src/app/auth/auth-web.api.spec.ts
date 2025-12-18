import { apiWebAuth } from './auth-web.api'

jest.mock('../data/rtk-query')

describe('apiWebAuth', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebAuth).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebAuth.endpoints.checkPasswordStrength).toBeDefined()
    expect(apiWebAuth.useCheckPasswordStrengthMutation).toBeDefined()

    expect(apiWebAuth.endpoints.login).toBeDefined()
    expect(apiWebAuth.useLoginMutation).toBeDefined()

    expect(apiWebAuth.endpoints.logout).toBeDefined()
    expect(apiWebAuth.useLogoutMutation).toBeDefined()

    expect(apiWebAuth.endpoints.otpRequestEmail).toBeDefined()
    expect(apiWebAuth.useOtpRequestEmailMutation).toBeDefined()

    expect(apiWebAuth.endpoints.otpRequestId).toBeDefined()
    expect(apiWebAuth.useOtpRequestIdMutation).toBeDefined()

    expect(apiWebAuth.endpoints.otpRequestPhone).toBeDefined()
    expect(apiWebAuth.useOtpRequestPhoneMutation).toBeDefined()
  })
})
