import {
  NOTIFICATION_API_ENTITY_NAME,
  NOTIFICATION_POSTGRES_DB_NAME,
} from './notification-api.consts'

describe('notification-api.consts', () => {
  it('should be defined', () => {
    expect(NOTIFICATION_API_ENTITY_NAME).toBeDefined()
    expect(NOTIFICATION_API_ENTITY_NAME).toEqual('notifications')
    expect(NOTIFICATION_POSTGRES_DB_NAME).toBeDefined()
    expect(NOTIFICATION_POSTGRES_DB_NAME).toEqual('notifications')
  })
})
