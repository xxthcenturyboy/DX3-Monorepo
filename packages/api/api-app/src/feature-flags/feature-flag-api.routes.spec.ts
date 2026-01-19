import { FeatureFlagRoutes } from './feature-flag-api.routes'

jest.mock('@dx3/api-libs/http-response/http-responses.ts')

describe('FeatureFlagRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = FeatureFlagRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
