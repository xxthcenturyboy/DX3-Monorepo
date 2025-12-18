import { apiWebNotifications } from './notification-web.api'

jest.mock('../data/rtk-query')

describe('apiWebNotifications', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebNotifications).toBeDefined()
  })

  it('should should have added specific properties to the main api object when imported', () => {
    // arrange
    // act
    // assert
    expect(apiWebNotifications.endpoints.getNotifications).toBeDefined()
    expect(apiWebNotifications.useLazyGetNotificationsQuery).toBeDefined()

    expect(apiWebNotifications.endpoints.markAllAsDismissed).toBeDefined()
    expect(apiWebNotifications.useMarkAllAsDismissedMutation).toBeDefined()

    expect(apiWebNotifications.endpoints.markAsDismissed).toBeDefined()
    expect(apiWebNotifications.useMarkAsDismissedMutation).toBeDefined()

    expect(apiWebNotifications.endpoints.sendNotificationAppUpdate).toBeDefined()
    expect(apiWebNotifications.useSendNotificationAppUpdateMutation).toBeDefined()

    expect(apiWebNotifications.endpoints.sendNotificationToAll).toBeDefined()
    expect(apiWebNotifications.useSendNotificationToAllMutation).toBeDefined()

    expect(apiWebNotifications.endpoints.sendNotificationToUser).toBeDefined()
    expect(apiWebNotifications.useSendNotificationToUserMutation).toBeDefined()

    expect(apiWebNotifications.endpoints.testSockets).toBeDefined()
    expect(apiWebNotifications.useTestSocketsMutation).toBeDefined()
  })
})
