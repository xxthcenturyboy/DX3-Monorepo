/**
 * Logging Shared Constants
 * Constants for centralized logging infrastructure (TimescaleDB)
 */

// ============================================================================
// Log Event Types
// ============================================================================

export const LOG_EVENT_TYPE = {
  // API Events
  API_ERROR: 'API_ERROR',
  API_REQUEST: 'API_REQUEST',

  // Auth Events
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_OTP_SENT: 'AUTH_OTP_SENT',
  AUTH_OTP_VERIFIED: 'AUTH_OTP_VERIFIED',
  AUTH_SUCCESS: 'AUTH_SUCCESS',

  // Cache Events
  CACHE_HIT: 'CACHE_HIT',
  CACHE_MISS: 'CACHE_MISS',

  // Database Events
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_QUERY: 'DATABASE_QUERY',

  // Email Events
  EMAIL_BOUNCED: 'EMAIL_BOUNCED',
  EMAIL_DELIVERED: 'EMAIL_DELIVERED',
  EMAIL_SENT: 'EMAIL_SENT',

  // Feature Flag Events
  FEATURE_FLAG_EVALUATED: 'FEATURE_FLAG_EVALUATED',
  FEATURE_FLAG_UPDATED: 'FEATURE_FLAG_UPDATED',

  // Media Events
  MEDIA_DELETED: 'MEDIA_DELETED',
  MEDIA_PROCESSED: 'MEDIA_PROCESSED',
  MEDIA_UPLOADED: 'MEDIA_UPLOADED',

  // Metric Events (business analytics - used by MetricsService)
  METRIC_FEATURE_USED: 'METRIC_FEATURE_USED',
  METRIC_LOGIN: 'METRIC_LOGIN',
  METRIC_LOGOUT: 'METRIC_LOGOUT',
  METRIC_PAGE_VIEW: 'METRIC_PAGE_VIEW',
  METRIC_SESSION_END: 'METRIC_SESSION_END',
  METRIC_SESSION_START: 'METRIC_SESSION_START',
  METRIC_SIGNUP: 'METRIC_SIGNUP',

  // Notification Events
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',

  // Rate Limit Events
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Security Events
  SECURITY_BLOCKED_IP: 'SECURITY_BLOCKED_IP',
  SECURITY_SUSPICIOUS_ACTIVITY: 'SECURITY_SUSPICIOUS_ACTIVITY',

  // Support Events
  SUPPORT_REQUEST_CLOSED: 'SUPPORT_REQUEST_CLOSED',
  SUPPORT_REQUEST_CREATED: 'SUPPORT_REQUEST_CREATED',
  SUPPORT_REQUEST_UPDATED: 'SUPPORT_REQUEST_UPDATED',

  // System Events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_STARTUP: 'SYSTEM_STARTUP',

  // User Events
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_SIGNUP: 'USER_SIGNUP',
} as const

export const LOG_EVENT_TYPE_ARRAY = Object.values(LOG_EVENT_TYPE)

// ============================================================================
// Metric Event Types (subset of LOG_EVENT_TYPE for MetricsService)
// ============================================================================

export const METRIC_EVENT_TYPE = {
  METRIC_FEATURE_USED: 'METRIC_FEATURE_USED',
  METRIC_LOGIN: 'METRIC_LOGIN',
  METRIC_LOGOUT: 'METRIC_LOGOUT',
  METRIC_PAGE_VIEW: 'METRIC_PAGE_VIEW',
  METRIC_SESSION_END: 'METRIC_SESSION_END',
  METRIC_SESSION_START: 'METRIC_SESSION_START',
  METRIC_SIGNUP: 'METRIC_SIGNUP',
} as const

export const METRIC_EVENT_TYPE_ARRAY = Object.values(METRIC_EVENT_TYPE)

// ============================================================================
// Socket.IO Namespace
// ============================================================================

export const ADMIN_LOGS_SOCKET_NS = '/admin-logs'

// ============================================================================
// Pagination Defaults
// ============================================================================

export const DEFAULT_LOG_LIMIT = 100
export const MAX_LOG_LIMIT = 1000

// ============================================================================
// Redaction
// ============================================================================

export const REDACTED_VALUE = '[REDACTED]'

// ============================================================================
// Log Retention
// ============================================================================

export const LOG_RETENTION_DAYS = 90
