import type {
  AuthFailureAlertPayload,
  GetLogsQueryType,
  GetLogsResponseType,
  LogEntryType,
  LogRecordType,
  LogsDailyAggregateType,
  LogsHourlyAggregateType,
  LogsStatsResponseType,
} from '@dx3/models-shared'
import { APP_ID, DEFAULT_LOG_LIMIT, LOG_EVENT_TYPE, MAX_LOG_LIMIT } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { AuthFailureTracker, type AuthFailureTrackerType } from './auth-failure-tracker'
import { TimescaleConnection, type TimescaleConnectionType } from './timescale.connection'
import { AdminLogsSocketService } from './timescale.logging.socket'

/**
 * LoggingService for centralized TimescaleDB logging.
 *
 * Features:
 * - Graceful degradation: logging failures never crash the main application
 * - Automatic app_id injection from environment
 * - Query methods for log retrieval and statistics
 * - Support for real-time streaming via Socket.IO (in separate handler)
 */
export class LoggingService {
  static #instance: LoggingServiceType | null = null

  authFailureTracker: AuthFailureTrackerType | null = null
  connection: TimescaleConnectionType | null = null
  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.connection = TimescaleConnection.instance
    LoggingService.#instance = this

    // Initialize auth failure tracker with alert callback
    this.authFailureTracker = new AuthFailureTracker()
    this.authFailureTracker.setAlertCallback(this.handleAuthFailureAlert.bind(this))
  }

  /**
   * Handle auth failure alerts from the tracker
   */
  private handleAuthFailureAlert(
    level: 'critical' | 'warning',
    payload: AuthFailureAlertPayload,
  ): void {
    const socketService = AdminLogsSocketService.instance
    if (!socketService) {
      return
    }

    if (level === 'critical') {
      socketService.emitAuthFailureCritical(payload)
    } else {
      socketService.emitAuthFailureWarning(payload)
    }
  }

  public static get instance(): LoggingServiceType | null {
    return LoggingService.#instance
  }

  /**
   * Check if logging service is available (TimescaleDB connected)
   */
  public isAvailable(): boolean {
    return TimescaleConnection.isConnected
  }

  /**
   * Log an event to TimescaleDB.
   * Gracefully degrades - logging failures don't throw exceptions.
   *
   * @param record The log record to insert
   * @returns The inserted log entry, or null if logging failed
   */
  public async log(record: LogRecordType): Promise<LogEntryType | null> {
    if (!this.isAvailable()) {
      return null
    }

    const pool = this.connection?.getPool()
    if (!pool) {
      return null
    }

    // Inject app_id from environment if not provided
    const logRecord: LogRecordType = {
      ...record,
      appId: record.appId || APP_ID,
    }

    try {
      const result = await pool.query<LogEntryType>(
        `INSERT INTO logs (
          app_id,
          duration_ms,
          event_subtype,
          event_type,
          fingerprint,
          ip_address,
          message,
          metadata,
          request_method,
          request_path,
          status_code,
          success,
          user_agent,
          user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING
          id,
          app_id as "appId",
          created_at as "createdAt",
          duration_ms as "durationMs",
          event_subtype as "eventSubtype",
          event_type as "eventType",
          fingerprint,
          ip_address as "ipAddress",
          message,
          metadata,
          request_method as "requestMethod",
          request_path as "requestPath",
          status_code as "statusCode",
          success,
          user_agent as "userAgent",
          user_id as "userId"`,
        [
          logRecord.appId,
          logRecord.durationMs ?? null,
          logRecord.eventSubtype ?? null,
          logRecord.eventType,
          logRecord.fingerprint ?? null,
          logRecord.ipAddress ?? null,
          logRecord.message ?? null,
          logRecord.metadata ? JSON.stringify(logRecord.metadata) : null,
          logRecord.requestMethod ?? null,
          logRecord.requestPath ?? null,
          logRecord.statusCode ?? null,
          logRecord.success ?? true,
          logRecord.userAgent ?? null,
          logRecord.userId ?? null,
        ],
      )

      const logEntry = result.rows[0] ?? null

      // Broadcast to connected admin clients via Socket.IO
      if (logEntry) {
        AdminLogsSocketService.instance?.broadcastNewLog(logEntry)

        // Track auth failures for threshold-based alerts
        if (logEntry.eventType === LOG_EVENT_TYPE.AUTH_FAILED && logEntry.success === false) {
          this.authFailureTracker?.trackFailure(
            logEntry.ipAddress ?? 'unknown',
            logEntry.fingerprint ?? undefined,
          )
        }
      }

      return logEntry
    } catch (error) {
      // Graceful degradation - log to console but don't throw
      this.logger.logError('Failed to write to TimescaleDB', {
        error: (error as Error).message,
        eventType: logRecord.eventType,
      })
      return null
    }
  }

  /**
   * Query logs with filtering and pagination.
   *
   * @param query Query parameters
   * @returns Paginated log results
   */
  public async getLogs(query: GetLogsQueryType): Promise<GetLogsResponseType> {
    const emptyResult: GetLogsResponseType = { count: 0, rows: [] }

    if (!this.isAvailable()) {
      return emptyResult
    }

    const pool = this.connection?.getPool()
    if (!pool) {
      return emptyResult
    }

    const {
      appId,
      endDate,
      eventType,
      limit = DEFAULT_LOG_LIMIT,
      offset = 0,
      orderBy = 'created_at',
      sortDir = 'DESC',
      startDate,
      success,
      userId,
    } = query

    // Build WHERE clause dynamically
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (appId) {
      conditions.push(`app_id = $${paramIndex++}`)
      params.push(appId)
    }

    if (eventType) {
      conditions.push(`event_type = $${paramIndex++}`)
      params.push(eventType)
    }

    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`)
      params.push(userId)
    }

    if (typeof success === 'boolean') {
      conditions.push(`success = $${paramIndex++}`)
      params.push(success)
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex++}`)
      params.push(startDate)
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex++}`)
      params.push(endDate)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Validate and sanitize orderBy to prevent SQL injection
    const allowedOrderColumns = ['created_at', 'event_type', 'app_id', 'success', 'status_code']
    const safeOrderBy = allowedOrderColumns.includes(orderBy) ? orderBy : 'created_at'
    const safeSortDir = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const safeLimit = Math.min(Math.max(1, limit), MAX_LOG_LIMIT)
    const safeOffset = Math.max(0, offset)

    try {
      // Get count
      const countResult = await pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM logs ${whereClause}`,
        params,
      )
      const count = Number.parseInt(countResult.rows[0]?.count ?? '0', 10)

      // Get rows
      const rowsResult = await pool.query<LogEntryType>(
        `SELECT
          id,
          app_id as "appId",
          created_at as "createdAt",
          duration_ms as "durationMs",
          event_subtype as "eventSubtype",
          event_type as "eventType",
          fingerprint,
          ip_address as "ipAddress",
          message,
          metadata,
          request_method as "requestMethod",
          request_path as "requestPath",
          status_code as "statusCode",
          success,
          user_agent as "userAgent",
          user_id as "userId"
        FROM logs
        ${whereClause}
        ORDER BY ${safeOrderBy} ${safeSortDir}
        LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        params,
      )

      return {
        count,
        rows: rowsResult.rows,
      }
    } catch (error) {
      this.logger.logError('Failed to query logs from TimescaleDB', {
        error: (error as Error).message,
        query,
      })
      return emptyResult
    }
  }

  /**
   * Get aggregated statistics for logs.
   *
   * @param options Query options
   * @returns Hourly and daily aggregates
   */
  public async getStats(options?: {
    appId?: string
    daysBack?: number
  }): Promise<LogsStatsResponseType> {
    const emptyResult: LogsStatsResponseType = { daily: [], hourly: [] }

    if (!this.isAvailable()) {
      return emptyResult
    }

    const pool = this.connection?.getPool()
    if (!pool) {
      return emptyResult
    }

    const { appId, daysBack = 7 } = options ?? {}

    try {
      // Build WHERE clause for app filtering
      const whereClause = appId ? 'WHERE app_id = $1' : ''
      const params = appId ? [appId] : []

      // Get hourly aggregates (last 24 hours)
      const hourlyResult = await pool.query<LogsHourlyAggregateType>(
        `SELECT
          bucket,
          app_id as "appId",
          event_type as "eventType",
          total_count as "totalCount",
          success_count as "successCount",
          error_count as "errorCount",
          unique_users as "uniqueUsers",
          avg_duration_ms as "avgDurationMs",
          max_duration_ms as "maxDurationMs"
        FROM logs_hourly
        ${whereClause}
        ${whereClause ? 'AND' : 'WHERE'} bucket >= NOW() - INTERVAL '24 hours'
        ORDER BY bucket DESC`,
        params,
      )

      // Get daily aggregates
      const dailyResult = await pool.query<LogsDailyAggregateType>(
        `SELECT
          bucket,
          app_id as "appId",
          event_type as "eventType",
          total_count as "totalCount",
          success_count as "successCount",
          error_count as "errorCount",
          unique_users as "uniqueUsers",
          avg_duration_ms as "avgDurationMs"
        FROM logs_daily
        ${whereClause}
        ${whereClause ? 'AND' : 'WHERE'} bucket >= NOW() - INTERVAL '${daysBack} days'
        ORDER BY bucket DESC`,
        params,
      )

      return {
        daily: dailyResult.rows,
        hourly: hourlyResult.rows,
      }
    } catch (error) {
      this.logger.logError('Failed to query stats from TimescaleDB', {
        error: (error as Error).message,
        options,
      })
      return emptyResult
    }
  }

  /**
   * Get recent error logs (for real-time error monitoring)
   *
   * @param options Query options
   * @returns Recent error log entries
   */
  public async getRecentErrors(options?: {
    appId?: string
    limit?: number
    minutesBack?: number
  }): Promise<LogEntryType[]> {
    if (!this.isAvailable()) {
      return []
    }

    const pool = this.connection?.getPool()
    if (!pool) {
      return []
    }

    const { appId, limit = 50, minutesBack = 60 } = options ?? {}

    try {
      const conditions = ['success = false', `created_at >= NOW() - INTERVAL '${minutesBack} minutes'`]
      const params: unknown[] = []

      if (appId) {
        conditions.push(`app_id = $1`)
        params.push(appId)
      }

      const result = await pool.query<LogEntryType>(
        `SELECT
          id,
          app_id as "appId",
          created_at as "createdAt",
          duration_ms as "durationMs",
          event_subtype as "eventSubtype",
          event_type as "eventType",
          fingerprint,
          ip_address as "ipAddress",
          message,
          metadata,
          request_method as "requestMethod",
          request_path as "requestPath",
          status_code as "statusCode",
          success,
          user_agent as "userAgent",
          user_id as "userId"
        FROM logs
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT ${Math.min(limit, MAX_LOG_LIMIT)}`,
        params,
      )

      return result.rows
    } catch (error) {
      this.logger.logError('Failed to query recent errors from TimescaleDB', {
        error: (error as Error).message,
      })
      return []
    }
  }

  /**
   * Execute a raw SQL query against TimescaleDB.
   * Used by MetricsService for custom aggregate queries.
   *
   * SECURITY: All user-provided values MUST be passed via the params array.
   * - Use parameterized placeholders ($1, $2, etc.) in the SQL string
   * - NEVER interpolate user input directly into the SQL string
   *
   * @param sql The SQL query with parameterized placeholders
   * @param params Values for the placeholders
   * @returns Query result with rows and rowCount
   */
  public async queryRaw<T>(
    sql: string,
    params: unknown[],
  ): Promise<{ rowCount: number; rows: T[] }> {
    if (!this.isAvailable()) {
      return { rowCount: 0, rows: [] }
    }

    const pool = this.connection?.getPool()
    if (!pool) {
      return { rowCount: 0, rows: [] }
    }

    try {
      const result = await pool.query<T>(sql, params)
      return {
        rowCount: result.rowCount ?? 0,
        rows: result.rows,
      }
    } catch (error) {
      this.logger.logError('Failed to execute raw query on TimescaleDB', {
        error: (error as Error).message,
      })
      return { rowCount: 0, rows: [] }
    }
  }
}

export type LoggingServiceType = typeof LoggingService.prototype
