import { UserRoutes } from './user-api.routes'

describe('UserRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(UserRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = UserRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
