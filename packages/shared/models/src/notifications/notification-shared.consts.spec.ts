import {
  NOTIFICATION_ERRORS,
  NOTIFICATION_LEVELS,
  NOTIFICATION_MOBILE_SOCKET_NS,
  NOTIFICATION_WEB_SOCKET_NS,
} from './notification-shared.consts'

describe('NOTIFICATION_ERRORS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_ERRORS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_ERRORS.MISSING_PARAMS).toEqual('100 Missing Required Params.')
    expect(NOTIFICATION_ERRORS.MISSING_USER_ID).toEqual(
      '101 User ID required to fetch Notifications by User ID.',
    )
    expect(NOTIFICATION_ERRORS.SERVER_ERROR).toEqual('102 Server error in Notifications')
  })
})

describe('NOTIFICATION_LEVELS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_LEVELS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_LEVELS.DANGER).toEqual('DANGER')
    expect(NOTIFICATION_LEVELS.INFO).toEqual('INFO')
    expect(NOTIFICATION_LEVELS.PRIMARY).toEqual('PRIMARY')
    expect(NOTIFICATION_LEVELS.SUCCESS).toEqual('SUCCESS')
    expect(NOTIFICATION_LEVELS.WARNING).toEqual('WARNING')
  })
})

describe('NOTIFICATION_MOBILE_SOCKET_NS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_MOBILE_SOCKET_NS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_MOBILE_SOCKET_NS).toEqual('/notify-mobile')
  })
})

describe('NOTIFICATION_WEB_SOCKET_NS ', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_WEB_SOCKET_NS).toBeDefined()
  })

  it('should have correct value', () => {
    // arrange
    // act
    // assert
    expect(NOTIFICATION_WEB_SOCKET_NS).toEqual('/notify-web')
  })
})
