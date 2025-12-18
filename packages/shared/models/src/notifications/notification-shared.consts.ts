export const NOTIFICATION_LEVELS = {
  DANGER: 'DANGER',
  INFO: 'INFO',
  PRIMARY: 'PRIMARY',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
}

export const NOTIFICATION_ERRORS = {
  MISSING_PARAMS: '100 Missing Required Params.',
  MISSING_USER_ID: '101 User ID required to fetch Notifications by User ID.',
  SERVER_ERROR: '102 Server error in Notifications',
}

export const NOTIFICATION_MOBILE_SOCKET_NS = '/notify-mobile'
export const NOTIFICATION_WEB_SOCKET_NS = '/notify-web'
