import { ApiLoggingClass } from '../logger'
import { DevicesService } from './devices-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('DevicesService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DevicesService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const devicesService = new DevicesService()
    // assert
    expect(devicesService).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new DevicesService()
    // assert
    expect(service.handleDevice).toBeDefined()
    expect(service.disconnectDevice).toBeDefined()
    expect(service.rejectDevice).toBeDefined()
    expect(service.updateFcmToken).toBeDefined()
    expect(service.updatePublicKey).toBeDefined()
  })
})
