import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { DxSocketClass } from './dx-socket.class'

jest.mock('@dx3/api-libs/socket-io-api')
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

describe('dx-sockets', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(DxSocketClass).toBeDefined()
  })

  it('should have a public static method of startSockets', () => {
    // arrange
    // act
    // assert
    expect(DxSocketClass.startSockets).toBeDefined()
  })
})
