import { apiWebEmail } from './email-web.api'

jest.mock('../data/rtk-query/index.ts')

describe('apiWebEmail', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebEmail).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebEmail.endpoints.addEmail).toBeDefined()
    expect(apiWebEmail.useAddEmailMutation).toBeDefined()

    expect(apiWebEmail.endpoints.checkEmailAvailability).toBeDefined()
    expect(apiWebEmail.useCheckEmailAvailabilityMutation).toBeDefined()

    expect(apiWebEmail.endpoints.deleteEmail).toBeDefined()
    expect(apiWebEmail.useDeleteEmailMutation).toBeDefined()

    expect(apiWebEmail.endpoints.deleteEmailProfile).toBeDefined()
    expect(apiWebEmail.useDeleteEmailProfileMutation).toBeDefined()

    expect(apiWebEmail.endpoints.updateEmail).toBeDefined()
    expect(apiWebEmail.useUpdateEmailMutation).toBeDefined()
  })
})
