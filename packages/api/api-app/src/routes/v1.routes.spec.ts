import { RoutesV1 } from './v1.routes'

jest.mock('../rate-limiters/rate-limiters.dx.ts')
// jest.mock('@dx/data-access-redis');

describe('RoutesV1', () => {
  it('should exist when imported', () => {
    expect(RoutesV1).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(RoutesV1.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = RoutesV1.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
