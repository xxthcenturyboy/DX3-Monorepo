import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { DxPostgresDb } from './dx-postgres.db'

jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

describe('dx-postgres.db', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(DxPostgresDb).toBeDefined()
  })

  it('should have a public static method of getPostgresConnection', () => {
    // arrange
    // act
    // assert
    expect(DxPostgresDb.getPostgresConnection).toBeDefined()
  })
})
