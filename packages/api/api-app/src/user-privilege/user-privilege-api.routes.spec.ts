import { UserPrivilegeRoutes } from './user-privilege-api.routes'

describe('UserPrivilegeRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserPrivilegeRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(UserPrivilegeRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = UserPrivilegeRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
