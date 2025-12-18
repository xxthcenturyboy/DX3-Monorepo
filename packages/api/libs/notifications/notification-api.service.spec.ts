import { ApiLoggingClass } from '../logger'
import { NotificationService } from './notification-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('NotificationService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NotificationService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const notificationService = new NotificationService()
    // assert
    expect(notificationService).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new NotificationService()
    // assert
    expect(service.getAppBadgeCount).toBeDefined()
    expect(service.getNotificationsByUserId).toBeDefined()
    expect(service.createAndSend).toBeDefined()
    expect(service.markAllAsRead).toBeDefined()
    expect(service.markAsDismissed).toBeDefined()
    expect(service.markAsRead).toBeDefined()
    expect(service.markViewed).toBeDefined()
  })
})
