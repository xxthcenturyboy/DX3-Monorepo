import { MediaApiV1Routes } from './media-api.routes'

describe('HealthzRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(MediaApiV1Routes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(MediaApiV1Routes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = MediaApiV1Routes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
