import { ApiLoggingClass } from '../logger'
import { FeatureFlagModel } from './feature-flag-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('FeatureFlagModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagModel).toBeDefined()
  })
})
