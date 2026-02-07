/**
 * MetricsService
 *
 * Business analytics tracking service that extends LoggingService.
 * Tracks signup, login, feature usage, and other business metrics.
 *
 * All metrics are stored in the existing `logs` table using METRIC_* event types,
 * which are then aggregated by continuous aggregates (metrics_daily, metrics_weekly, etc.)
 */

import type { Request } from 'express'

import {
  APP_ID,
  HEADER_DEVICE_ID_PROP,
  IS_PARENT_DASHBOARD_APP,
  METRIC_EVENT_TYPE,
  type MetricEventType,
  MOBILE_USER_AGENT_IDENTIFIER,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { LoggingService, type LoggingServiceType } from '../timescale/timescale.logging.service'

// ============================================================================
// Types
// ============================================================================

export type MetricRecordType = {
  eventSubtype?: string
  eventType: MetricEventType
  metadata?: Record<string, unknown>
  req?: Request
  success?: boolean
  userId?: string
}

export type SignupMetadata = {
  hasReferrer: boolean
  method: 'email' | 'phone'
  referrerUserId?: string
  signupSource?: 'api' | 'mobile' | 'web'
}

export type LoginMetadata = {
  method: 'biometric' | 'email' | 'phone'
}

export type FeatureUsageMetadata = {
  context?: Record<string, unknown>
  featureName: string
}

// ============================================================================
// MetricsService
// ============================================================================

export class MetricsService {
  static #instance: MetricsServiceType | null = null

  private logger: ApiLoggingClassType
  private loggingService: LoggingServiceType | null

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.loggingService = LoggingService.instance

    MetricsService.#instance = this
  }

  public static get instance(): MetricsServiceType | null {
    return MetricsService.#instance
  }

  /**
   * Check if metrics service is available (TimescaleDB connected)
   */
  public isAvailable(): boolean {
    return this.loggingService?.isAvailable() ?? false
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECORDING METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Record a generic metric
   */
  async record(metric: MetricRecordType): Promise<void> {
    if (!this.loggingService) {
      this.logger.logWarn('MetricsService: LoggingService not available, skipping metric')
      return
    }

    await this.loggingService.log({
      eventSubtype: metric.eventSubtype,
      eventType: metric.eventType,
      fingerprint: metric.req?.headers[HEADER_DEVICE_ID_PROP] as string | undefined,
      ipAddress: metric.req?.ip,
      metadata: metric.metadata,
      requestMethod: metric.req?.method,
      requestPath: metric.req?.path,
      success: metric.success ?? true,
      userAgent: metric.req?.headers['user-agent'],
      userId: metric.userId ?? metric.req?.user?.id,
    })
  }

  /**
   * Record a signup event
   */
  async recordSignup(params: {
    method: 'email' | 'phone'
    referrerUserId?: string
    req: Request
    signupSource?: 'api' | 'mobile' | 'web'
    userId: string
  }): Promise<void> {
    const { method, referrerUserId, req, signupSource, userId } = params

    await this.record({
      eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
      metadata: {
        hasReferrer: !!referrerUserId,
        method,
        referrerUserId,
        signupSource: signupSource ?? this.detectSource(req),
      },
      req,
      success: true,
      userId,
    })
  }

  /**
   * Record a login event
   */
  async recordLogin(params: {
    method: 'biometric' | 'email' | 'phone'
    req: Request
    userId: string
  }): Promise<void> {
    const { method, req, userId } = params

    await this.record({
      eventType: METRIC_EVENT_TYPE.METRIC_LOGIN,
      metadata: { method },
      req,
      success: true,
      userId,
    })
  }

  /**
   * Record a logout event
   */
  async recordLogout(params: { req: Request; userId?: string }): Promise<void> {
    const { req, userId } = params

    await this.record({
      eventType: METRIC_EVENT_TYPE.METRIC_LOGOUT,
      req,
      success: true,
      userId: userId ?? req.user?.id,
    })
  }

  /**
   * Record feature usage
   */
  async recordFeatureUsage(params: {
    context?: Record<string, unknown>
    featureName: string
    req: Request
  }): Promise<void> {
    const { context, featureName, req } = params

    await this.record({
      eventSubtype: featureName,
      eventType: METRIC_EVENT_TYPE.METRIC_FEATURE_USED,
      metadata: { context, featureName },
      req,
      success: true,
    })
  }

  /**
   * Record session start
   */
  async recordSessionStart(params: {
    platform?: 'api' | 'mobile' | 'web'
    req: Request
    userId: string
  }): Promise<void> {
    const { platform, req, userId } = params
    const detectedPlatform = platform ?? this.detectSource(req)

    await this.record({
      eventType: METRIC_EVENT_TYPE.METRIC_SESSION_START,
      metadata: { platform: detectedPlatform },
      req,
      success: true,
      userId,
    })
  }

  /**
   * Record session end
   */
  async recordSessionEnd(params: {
    pagesViewed?: number
    platform?: 'api' | 'mobile' | 'web'
    reason?: string
    req: Request
    sessionDurationMs?: number
    userId?: string
  }): Promise<void> {
    const { pagesViewed, platform, reason, req, sessionDurationMs, userId } = params
    const detectedPlatform = platform ?? this.detectSource(req)

    await this.record({
      eventType: METRIC_EVENT_TYPE.METRIC_SESSION_END,
      metadata: { pagesViewed, platform: detectedPlatform, reason, sessionDurationMs },
      req,
      success: true,
      userId: userId ?? req.user?.id,
    })
  }

  /**
   * Detect request source (web vs mobile vs api)
   */
  private detectSource(req: Request): 'api' | 'mobile' | 'web' {
    const userAgent = req.headers['user-agent'] || ''
    const origin = req.headers.origin || ''

    if (userAgent.includes(MOBILE_USER_AGENT_IDENTIFIER) || req.headers[HEADER_DEVICE_ID_PROP]) {
      return 'mobile'
    }
    if (origin.includes('localhost') || origin.includes('dx3')) {
      return 'web'
    }
    return 'api'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Execute a raw SQL query (delegates to LoggingService)
   * Used by MetricsController for custom aggregate queries
   */
  async queryRaw<T>(
    sql: string,
    params: unknown[],
  ): Promise<{ rowCount: number; rows: T[] }> {
    if (!this.loggingService) {
      return { rowCount: 0, rows: [] }
    }
    return this.loggingService.queryRaw<T>(sql, params)
  }

  /**
   * Get real-time unique active users for a date range
   * Queries the raw logs table directly for immediate visibility (no continuous aggregate delay)
   *
   * Multi-App Behavior:
   * - Regular apps: Count for own APP_ID only
   * - Parent dashboard (ax-admin): Count across all apps (or filter by specific appId)
   */
  async getRealTimeActiveUsers(startDate: Date, endDate: Date, appId?: string): Promise<number> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ count: string }>(
      `
      SELECT COUNT(DISTINCT user_id) as count
      FROM logs
      WHERE event_type = 'METRIC_LOGIN'
        AND created_at >= $1
        AND created_at < $2
        AND user_id IS NOT NULL
        ${appFilter}
    `,
      params,
    )

    return Number.parseInt(result.rows[0]?.count ?? '0', 10)
  }

  /**
   * Get signup count for a date range
   *
   * Multi-App Behavior:
   * - Regular apps: Count for own APP_ID only
   * - Parent dashboard (ax-admin): Count across all apps (or filter by specific appId)
   */
  async getSignupCount(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<number> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
      // If no appId filter, counts ALL apps
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ count: string }>(
      `
      SELECT COUNT(*) as count
      FROM logs
      WHERE event_type = 'METRIC_SIGNUP'
        AND created_at >= $1
        AND created_at < $2
        ${appFilter}
    `,
      params,
    )

    return Number.parseInt(result.rows[0]?.count ?? '0', 10)
  }

  /**
   * Get daily active users (DAU) for a date range
   */
  async getDailyActiveUsers(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<Array<{ date: string; dau: number }>> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ date: string; dau: string }>(
      `
      SELECT
        bucket::date as date,
        unique_users as dau
      FROM metrics_daily
      WHERE event_type = 'METRIC_LOGIN'
        AND bucket >= $1
        AND bucket < $2
        ${appFilter}
      ORDER BY bucket ASC
    `,
      params,
    )

    return result.rows.map((row) => ({
      date: row.date,
      dau: Number.parseInt(row.dau, 10),
    }))
  }

  /**
   * Get weekly active users (WAU) for a date range
   */
  async getWeeklyActiveUsers(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<Array<{ wau: number; weekEnd: string }>> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ wau: string; week_end: string }>(
      `
      SELECT
        bucket::date as week_end,
        unique_users as wau
      FROM metrics_weekly
      WHERE event_type = 'METRIC_LOGIN'
        AND bucket >= $1
        AND bucket < $2
        ${appFilter}
      ORDER BY bucket ASC
    `,
      params,
    )

    return result.rows.map((row) => ({
      wau: Number.parseInt(row.wau, 10),
      weekEnd: row.week_end,
    }))
  }

  /**
   * Get monthly active users (MAU) for a date range
   */
  async getMonthlyActiveUsers(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<Array<{ mau: number; monthEnd: string }>> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ mau: string; month_end: string }>(
      `
      SELECT
        bucket::date as month_end,
        unique_users as mau
      FROM metrics_monthly
      WHERE event_type = 'METRIC_LOGIN'
        AND bucket >= $1
        AND bucket < $2
        ${appFilter}
      ORDER BY bucket ASC
    `,
      params,
    )

    return result.rows.map((row) => ({
      mau: Number.parseInt(row.mau, 10),
      monthEnd: row.month_end,
    }))
  }

  /**
   * Get signup breakdown by method (email vs phone)
   */
  async getSignupsByMethod(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<Array<{ count: number; method: string }>> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ count: string; method: string }>(
      `
      SELECT
        method,
        SUM(total_count) as count
      FROM metrics_daily
      WHERE event_type = 'METRIC_SIGNUP'
        AND bucket >= $1
        AND bucket < $2
        ${appFilter}
      GROUP BY method
      ORDER BY count DESC
    `,
      params,
    )

    return result.rows.map((row) => ({
      count: Number.parseInt(row.count, 10),
      method: row.method,
    }))
  }

  /**
   * Get feature usage counts
   */
  async getFeatureUsage(
    startDate: Date,
    endDate: Date,
    appId?: string,
  ): Promise<Array<{ count: number; featureName: string }>> {
    let appFilter = ''
    const params: unknown[] = [startDate, endDate]

    if (IS_PARENT_DASHBOARD_APP) {
      if (appId) {
        appFilter = 'AND app_id = $3'
        params.push(appId)
      }
    } else {
      appFilter = 'AND app_id = $3'
      params.push(APP_ID)
    }

    const result = await this.queryRaw<{ count: string; feature_name: string }>(
      `
      SELECT
        metadata->>'featureName' as feature_name,
        COUNT(*) as count
      FROM logs
      WHERE event_type = 'METRIC_FEATURE_USED'
        AND created_at >= $1
        AND created_at < $2
        ${appFilter}
      GROUP BY metadata->>'featureName'
      ORDER BY count DESC
    `,
      params,
    )

    return result.rows.map((row) => ({
      count: Number.parseInt(row.count, 10),
      featureName: row.feature_name,
    }))
  }

  /**
   * Get list of apps with metrics (for parent dashboard)
   */
  async getAppsWithMetrics(): Promise<string[]> {
    if (!IS_PARENT_DASHBOARD_APP) {
      return [APP_ID]
    }

    const result = await this.queryRaw<{ app_id: string }>(
      `
      SELECT DISTINCT app_id
      FROM logs
      WHERE event_type LIKE 'METRIC_%'
      ORDER BY app_id
    `,
      [],
    )

    return result.rows.map((row) => row.app_id)
  }
}

export type MetricsServiceType = typeof MetricsService.prototype
