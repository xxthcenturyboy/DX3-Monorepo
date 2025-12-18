import { ApiLoggingClass } from '../logger'
import { DeviceModel } from './device-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('Device Model', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('DeviceModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(DeviceModel).toBeDefined()
    })
  })
})
