import { HEADER_API_VERSION_PROP, HEADER_CLIENT_FINGERPRINT_PROP } from './headers-shared.const'

describe('HEADER_API_VERSION_PROP ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(HEADER_API_VERSION_PROP).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(HEADER_API_VERSION_PROP).toEqual('X-API-Version')
  })
})
