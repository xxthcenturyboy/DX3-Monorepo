import { ApiLoggingClass } from '../logger'
import { PhoneModel } from './phone-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('PhoneModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('PhoneModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(PhoneModel).toBeDefined()
    })
  })
})
