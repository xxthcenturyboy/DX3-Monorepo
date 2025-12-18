import { HealthzRoutes } from './healthz-api.routes'

describe('HealthzRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(HealthzRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(HealthzRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = HealthzRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
