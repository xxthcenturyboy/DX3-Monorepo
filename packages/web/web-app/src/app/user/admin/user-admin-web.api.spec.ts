import { apiWebUserAdmin } from './user-admin-web.api'

jest.mock('../../data/rtk-query')

describe('apiWebUserAdmin', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebUserAdmin).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebUserAdmin.endpoints.getUserAdminList).toBeDefined()
    expect(apiWebUserAdmin.useLazyGetUserAdminListQuery).toBeDefined()

    expect(apiWebUserAdmin.endpoints.getUserAdmin).toBeDefined()
    expect(apiWebUserAdmin.useLazyGetUserAdminQuery).toBeDefined()

    expect(apiWebUserAdmin.endpoints.updateUser).toBeDefined()
    expect(apiWebUserAdmin.useUpdateUserMutation).toBeDefined()

    expect(apiWebUserAdmin.endpoints.updateUserRolesRestrictions).toBeDefined()
    expect(apiWebUserAdmin.useUpdateUserRolesRestrictionsMutation).toBeDefined()
  })
})
