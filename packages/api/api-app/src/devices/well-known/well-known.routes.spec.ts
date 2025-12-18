import { WellKnownRoutes } from './well-known.routes'

describe('WellKnownRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(WellKnownRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(WellKnownRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = WellKnownRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
