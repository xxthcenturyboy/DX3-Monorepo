import { ApiLoggingClass } from '../logger'
import { NotificationModel } from './notification-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('Notifications Model', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('NotificationModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(NotificationModel).toBeDefined()
    })
  })
})
