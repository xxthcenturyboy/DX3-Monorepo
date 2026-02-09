/**
 * Support Request Categories
 * Used to categorize support requests for filtering and routing
 */
export const SUPPORT_CATEGORY = {
  ISSUE: 'issue',
  NEW_FEATURE: 'new_feature',
  OTHER: 'other',
  QUESTION: 'question',
} as const

export const SUPPORT_CATEGORY_ARRAY = Object.values(SUPPORT_CATEGORY)

/**
 * Support Request Status Values
 * Tracks the lifecycle of a support request
 */
export const SUPPORT_STATUS = {
  CLOSED: 'closed',
  IN_PROGRESS: 'in_progress',
  OPEN: 'open',
  RESOLVED: 'resolved',
} as const

/**
 * Status array in display order: Open -> In Progress -> Resolved -> Closed
 */
export const SUPPORT_STATUS_ARRAY = [
  SUPPORT_STATUS.OPEN,
  SUPPORT_STATUS.IN_PROGRESS,
  SUPPORT_STATUS.RESOLVED,
  SUPPORT_STATUS.CLOSED,
] as const

/**
 * Open statuses for filtering
 * Requests that are considered "open" (not resolved or closed)
 */
export const SUPPORT_OPEN_STATUSES = [SUPPORT_STATUS.OPEN, SUPPORT_STATUS.IN_PROGRESS] as const

/**
 * WebSocket namespace for support notifications
 */
export const SUPPORT_WEB_SOCKET_NS = '/support-web'

/**
 * Validation limits for support requests
 * Enforced via client/server validation, not database schema
 */
export const SUPPORT_VALIDATION = {
  MAX_OPEN_REQUESTS_PER_DAY: 3,
  MESSAGE_MAX_LENGTH: 2000,
  SUBJECT_MAX_LENGTH: 255,
  SUBJECT_TRUNCATE_LENGTH: 50,
} as const

/**
 * Status chip colors for UI
 */
export const SUPPORT_STATUS_COLORS = {
  [SUPPORT_STATUS.CLOSED]: 'default',
  [SUPPORT_STATUS.IN_PROGRESS]: 'warning',
  [SUPPORT_STATUS.OPEN]: 'info',
  [SUPPORT_STATUS.RESOLVED]: 'success',
} as const
