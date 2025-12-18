import { ApiLoggingClass } from '../logger'
import { ShortlinkService } from './shortlink-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('ShortlinkService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(ShortlinkService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const shortlinkService = new ShortlinkService()
    // assert
    expect(shortlinkService).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new ShortlinkService()
    // assert
    expect(service.getShortlinkTarget).toBeDefined()
  })
})
