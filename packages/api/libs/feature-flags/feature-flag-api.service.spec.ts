import { ApiLoggingClass } from '../logger'
import { FeatureFlagService } from './feature-flag-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('FeatureFlagService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(FeatureFlagService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const service = new FeatureFlagService()
    // assert
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new FeatureFlagService()
    // assert
    expect(service.createFlag).toBeDefined()
    expect(service.evaluateAllFlags).toBeDefined()
    expect(service.evaluateFlag).toBeDefined()
    expect(service.getAllFlags).toBeDefined()
    expect(service.invalidateCache).toBeDefined()
    expect(service.updateFlag).toBeDefined()
  })
})
