import { ERROR_CODES } from '../errors/error-shared.consts'
import { buildApiError } from '../errors/error-shared.utils'

export const NOTIFICATION_ERRORS = {
  CREATE_FAILED: buildApiError(
    ERROR_CODES.NOTIFICATION_CREATE_FAILED,
    'Failed to create notification.',
  ),
  MISSING_PARAMS: buildApiError(
    ERROR_CODES.NOTIFICATION_MISSING_PARAMS,
    'Missing required notification parameters.',
  ),
  MISSING_USER_ID: buildApiError(
    ERROR_CODES.NOTIFICATION_MISSING_USER_ID,
    'User ID required for this notification.',
  ),
  SERVER_ERROR: buildApiError(ERROR_CODES.NOTIFICATION_SERVER_ERROR, 'Notification service error.'),
}

export const NOTIFICATION_LEVELS = {
  DANGER: 'DANGER',
  INFO: 'INFO',
  PRIMARY: 'PRIMARY',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
}

export const NOTIFICATION_MOBILE_SOCKET_NS = '/notify-mobile'
export const NOTIFICATION_WEB_SOCKET_NS = '/notify-web'
