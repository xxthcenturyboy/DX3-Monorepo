import {
  HEADER_API_VERSION_PROP,
  HEADER_CLIENT_FINGERPRINT_PROP,
  HEADER_DEVICE_ID_PROP,
  MOBILE_USER_AGENT_IDENTIFIER,
} from './headers-shared.const'

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

describe('HEADER_CLIENT_FINGERPRINT_PROP', () => {
  it('should exist when imported', () => {
    expect(HEADER_CLIENT_FINGERPRINT_PROP).toBeDefined()
  })

  it('should have correct value', () => {
    expect(HEADER_CLIENT_FINGERPRINT_PROP).toEqual('X-Client-Fingerprint')
  })
})

describe('HEADER_DEVICE_ID_PROP', () => {
  it('should exist when imported', () => {
    expect(HEADER_DEVICE_ID_PROP).toBeDefined()
  })

  it('should have correct value', () => {
    expect(HEADER_DEVICE_ID_PROP).toEqual('x-device-id')
  })
})

describe('MOBILE_USER_AGENT_IDENTIFIER', () => {
  it('should exist when imported', () => {
    expect(MOBILE_USER_AGENT_IDENTIFIER).toBeDefined()
  })

  it('should have correct value', () => {
    expect(MOBILE_USER_AGENT_IDENTIFIER).toEqual('DX3Mobile')
  })
})
