import { ApiLoggingClass } from '../logger'
import { EmailModel } from './email-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('EmailModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('EmailModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(EmailModel).toBeDefined()
    })
  })
})
