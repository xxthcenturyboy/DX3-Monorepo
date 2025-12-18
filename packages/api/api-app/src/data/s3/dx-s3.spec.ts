import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { DxS3Class } from './dx-s3'

jest.mock('@dx3/api-libs/socket-io-api')
jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

describe('dx-s3', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(DxS3Class).toBeDefined()
  })

  it('should have a public static method of initializeS3', () => {
    // arrange
    // act
    // assert
    expect(DxS3Class.initializeS3).toBeDefined()
  })
})
