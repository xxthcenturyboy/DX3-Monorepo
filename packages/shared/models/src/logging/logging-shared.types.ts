/**
 * Logging Shared Types
 * Types for centralized logging infrastructure (TimescaleDB)
 */

import type { LOG_EVENT_TYPE, METRIC_EVENT_TYPE } from './logging-shared.consts'

// ============================================================================
// Core Log Types
// ============================================================================

export type LogEventType = (typeof LOG_EVENT_TYPE)[keyof typeof LOG_EVENT_TYPE]
export type MetricEventType = (typeof METRIC_EVENT_TYPE)[keyof typeof METRIC_EVENT_TYPE]

export type LogRecordType = {
  appId?: string // Injected by LoggingService from APP_ID env
  durationMs?: number
  eventSubtype?: string
  eventType: LogEventType
  fingerprint?: string
  ipAddress?: string
  message?: string
  metadata?: Record<string, unknown>
  requestMethod?: string
  requestPath?: string
  statusCode?: number
  success?: boolean
  userAgent?: string
  userId?: string
}

export type LogEntryType = LogRecordType & {
  createdAt: string
  id: string
}

// ============================================================================
// Query Types
// ============================================================================

export type LogFiltersType = {
  appId?: string
  endDate?: string
  eventType?: LogEventType
  limit?: number
  offset?: number
  orderBy?: string
  sortDir?: 'ASC' | 'DESC'
  startDate?: string
  success?: boolean
  userId?: string
}

export type GetLogsQueryType = LogFiltersType

export type GetLogsResponseType = {
  count: number
  rows: LogEntryType[]
}

// ============================================================================
// Aggregate Types (for dashboard stats)
// ============================================================================

export type LogsHourlyAggregateType = {
  appId: string
  avgDurationMs: number | null
  bucket: string
  errorCount: number
  eventType: string
  maxDurationMs: number | null
  successCount: number
  totalCount: number
  uniqueUsers: number
}

export type LogsDailyAggregateType = {
  appId: string
  avgDurationMs: number | null
  bucket: string
  errorCount: number
  eventType: string
  successCount: number
  totalCount: number
  uniqueUsers: number
}

export type LogsStatsResponseType = {
  daily: LogsDailyAggregateType[]
  hourly: LogsHourlyAggregateType[]
}

// ============================================================================
// Socket.IO Types (for real-time log streaming and alerts)
// ============================================================================

/**
 * Alert payload for auth failure threshold alerts
 */
export type AuthFailureAlertPayload = {
  count: number
  fingerprint?: string
  ipAddress: string
  timestamp: string
}

/**
 * Alert payload for rate limit alerts
 */
export type RateLimitAlertPayload = {
  endpoint: string
  ipAddress: string
  message?: string
  timestamp: string
  userId?: string
}

/**
 * Alert payload for custom security alerts
 */
export type SecurityAlertPayload = {
  alertType: string
  details: Record<string, unknown>
  timestamp: string
}

export type AdminLogsSocketServerToClientEvents = {
  // Real-time log streaming (optional, for future use)
  'error-log': (log: LogEntryType) => void
  'new-log': (log: LogEntryType) => void
  // Threshold-based alerts
  auth_failure_critical: (payload: AuthFailureAlertPayload) => void
  auth_failure_warning: (payload: AuthFailureAlertPayload) => void
  rate_limit_alert: (payload: RateLimitAlertPayload) => void
  security_alert: (payload: SecurityAlertPayload) => void
}

export type AdminLogsSocketClientToServerEvents = {
  'subscribe-errors': () => void
  'unsubscribe-errors': () => void
}

export type AdminLogsSocketInterServerEvents = {
  ping: () => void
}

export type AdminLogsSocketData = {
  userId: string
}
