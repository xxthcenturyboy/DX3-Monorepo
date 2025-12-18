import { ShortlinkRoutes } from './shortlink-api.routes'

describe('ShortlinkRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ShortlinkRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(ShortlinkRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = ShortlinkRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
