import { DevicesRoutes } from './devices-api.routes'

jest.mock('../rate-limiters/rate-limiters.dx')
jest.mock('@dx3/api-libs/http-response/http-responses')

describe('DevicesRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DevicesRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(DevicesRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = DevicesRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
