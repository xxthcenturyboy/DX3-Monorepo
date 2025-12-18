import { PhoneRoutes } from './phone-api.routes'

describe('PhoneRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(PhoneRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(PhoneRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = PhoneRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
