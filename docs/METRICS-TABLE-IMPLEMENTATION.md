# Metrics Table Implementation Plan

## Overview

This document outlines the implementation strategy for a comprehensive metrics logging system in the DX3 monorepo. The system will capture request metrics, authentication attempts, and other trackable events to a dedicated PostgreSQL table for analytics, security auditing, and debugging purposes.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [File Structure](#file-structure)
4. [Implementation Details](#implementation-details)
5. [Integration Points](#integration-points)
6. [Usage Examples](#usage-examples)
7. [Testing Considerations](#testing-considerations)
8. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

### System Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        METRICS LOGGING ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         ENTRY POINTS                                 │     │
│  ├─────────────────┬─────────────────┬─────────────────┬───────────────┤     │
│  │  logRequest()   │  Auth Attempts  │  Rate Limiter   │  Custom Events│     │
│  │  (existing)     │  (login/signup) │  Triggers       │  (extensible) │     │
│  └────────┬────────┴────────┬────────┴────────┬────────┴───────┬───────┘     │
│           │                 │                 │                │             │
│           ▼                 ▼                 ▼                ▼             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                    METRICS SERVICE                                   │     │
│  │  ┌─────────────────────────────────────────────────────────────┐    │     │
│  │  │  MetricsService.record({...})                                │    │     │
│  │  │  - Validates data                                            │    │     │
│  │  │  - Extracts request context (IP, geo, user agent, etc.)      │    │     │
│  │  │  - Queues for async write (optional batch mode)              │    │     │
│  │  └─────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                      POSTGRESQL                                      │     │
│  │  ┌─────────────────────────────────────────────────────────────┐    │     │
│  │  │  metrics (Table)                                             │    │     │
│  │  │  - Indexed by: event_type, user_id, fingerprint, created_at  │    │     │
│  │  │  - Partitioned by created_at (future enhancement)            │    │     │
│  │  └─────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request Entry**: API requests trigger `logRequest()` or auth controllers
2. **Context Extraction**: MetricsService extracts all available context from the Express Request
3. **Async Write**: Metrics are written to PostgreSQL (optionally batched for performance)
4. **Queryable Data**: Data available for admin dashboards, security audits, analytics

---

## Database Schema Design

### Core Schema: `metrics` Table

```sql
CREATE TABLE metrics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event Classification
  event_type VARCHAR(64) NOT NULL,          -- e.g., 'REQUEST', 'AUTH_LOGIN', 'AUTH_SIGNUP', 'AUTH_FAILURE', 'RATE_LIMIT'
  event_subtype VARCHAR(64),                -- e.g., 'success', 'failure', 'otp_sent', 'biometric'

  -- User Context (nullable for anonymous requests)
  user_id UUID REFERENCES users(id),
  fingerprint VARCHAR(64),                  -- Browser/device fingerprint
  device_id VARCHAR(128),                   -- Mobile device ID (from headers/body)

  -- Request Context
  ip_address INET,                          -- PostgreSQL INET type for proper IP handling
  user_agent TEXT,
  http_method VARCHAR(10),                  -- GET, POST, PUT, DELETE, PATCH
  request_path VARCHAR(512),                -- The endpoint path
  request_params JSONB,                     -- Sanitized params/query (no sensitive data)
  request_body_summary JSONB,               -- Sanitized summary of body (no passwords, etc.)

  -- Response Info (optional, for complete request logging)
  response_status_code SMALLINT,
  response_time_ms INTEGER,                 -- Time to process request in milliseconds

  -- Geolocation (from MaxMind GeoIP)
  geo_country VARCHAR(3),                   -- ISO country code (e.g., 'US')
  geo_region VARCHAR(10),                   -- State/province code
  geo_city VARCHAR(128),
  geo_timezone VARCHAR(64),

  -- Additional Context
  session_id VARCHAR(128),                  -- Session identifier if available
  referrer VARCHAR(512),                    -- HTTP Referrer header
  origin VARCHAR(256),                      -- Request origin

  -- Outcome/Message
  success BOOLEAN DEFAULT true,
  message TEXT,                             -- Error message, info, etc.
  error_code VARCHAR(32),                   -- Our error codes (from ERROR_CODES)

  -- Metadata
  metadata JSONB,                           -- Extensible field for additional data

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_metrics_event_type ON metrics(event_type);
CREATE INDEX idx_metrics_user_id ON metrics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_metrics_fingerprint ON metrics(fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX idx_metrics_ip_address ON metrics(ip_address);
CREATE INDEX idx_metrics_created_at ON metrics(created_at);
CREATE INDEX idx_metrics_success ON metrics(success) WHERE success = false;

-- Composite index for common admin queries
CREATE INDEX idx_metrics_type_date ON metrics(event_type, created_at DESC);
CREATE INDEX idx_metrics_user_date ON metrics(user_id, created_at DESC) WHERE user_id IS NOT NULL;
```

### Event Types (Constants)

```typescript
export const METRIC_EVENT_TYPE = {
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_SIGNUP: 'AUTH_SIGNUP',
  DEVICE_REJECTED: 'DEVICE_REJECTED',
  DEVICE_VERIFIED: 'DEVICE_VERIFIED',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  RATE_LIMIT: 'RATE_LIMIT',
  REQUEST: 'REQUEST',
  SECURITY_ALERT: 'SECURITY_ALERT',
} as const

export type MetricEventType = (typeof METRIC_EVENT_TYPE)[keyof typeof METRIC_EVENT_TYPE]

export const METRIC_EVENT_SUBTYPE = {
  BIOMETRIC: 'biometric',
  EMAIL: 'email',
  FAILURE: 'failure',
  PASSWORD: 'password',
  PHONE: 'phone',
  SUCCESS: 'success',
  USERNAME: 'username',
} as const

export type MetricEventSubtype = (typeof METRIC_EVENT_SUBTYPE)[keyof typeof METRIC_EVENT_SUBTYPE]
```

---

## File Structure

```
packages/
├── shared/
│   └── models/
│       └── src/
│           └── metrics/
│               ├── metrics-shared.consts.ts      # METRIC_EVENT_TYPE, METRIC_EVENT_SUBTYPE
│               ├── metrics-shared.consts.spec.ts
│               ├── metrics-shared.types.ts       # MetricEventType, MetricRecordType
│               └── index.ts
│
├── api/
│   ├── libs/
│   │   └── metrics/
│   │       ├── metrics-api.consts.ts             # METRICS_POSTGRES_DB_NAME
│   │       ├── metrics-api.consts.spec.ts
│   │       ├── metrics-api.postgres-model.ts     # MetricsModel (Sequelize)
│   │       ├── metrics-api.postgres-model.spec.ts
│   │       ├── metrics-api.service.ts            # MetricsService class
│   │       ├── metrics-api.service.spec.ts
│   │       ├── metrics-api.types.ts              # Service-specific types
│   │       └── index.ts
│   │
│   │   └── logger/
│   │       └── log-request.util.ts               # Modified to call MetricsService
│   │
│   └── api-app/
│       └── src/
│           └── metrics/                          # Optional: Admin routes for viewing metrics
│               ├── metrics-api.controller.ts
│               ├── metrics-api.controller.spec.ts
│               ├── metrics-api.routes.ts
│               └── metrics-api.routes.spec.ts
```

---

## Implementation Details

### 1. Shared Constants and Types

**`packages/shared/models/src/metrics/metrics-shared.consts.ts`**

```typescript
export const METRIC_EVENT_TYPE = {
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_SIGNUP: 'AUTH_SIGNUP',
  DEVICE_REJECTED: 'DEVICE_REJECTED',
  DEVICE_VERIFIED: 'DEVICE_VERIFIED',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  RATE_LIMIT: 'RATE_LIMIT',
  REQUEST: 'REQUEST',
  SECURITY_ALERT: 'SECURITY_ALERT',
} as const

export const METRIC_EVENT_TYPE_ARRAY = Object.values(METRIC_EVENT_TYPE)

export const METRIC_EVENT_SUBTYPE = {
  BIOMETRIC: 'biometric',
  EMAIL: 'email',
  FAILURE: 'failure',
  PASSWORD: 'password',
  PHONE: 'phone',
  SUCCESS: 'success',
  USERNAME: 'username',
} as const

export const METRIC_EVENT_SUBTYPE_ARRAY = Object.values(METRIC_EVENT_SUBTYPE)
```

**`packages/shared/models/src/metrics/metrics-shared.types.ts`**

```typescript
import type { METRIC_EVENT_SUBTYPE, METRIC_EVENT_TYPE } from './metrics-shared.consts'

export type MetricEventSubtype = (typeof METRIC_EVENT_SUBTYPE)[keyof typeof METRIC_EVENT_SUBTYPE]

export type MetricEventType = (typeof METRIC_EVENT_TYPE)[keyof typeof METRIC_EVENT_TYPE]

export type MetricRecordType = {
  createdAt?: Date
  deviceId?: string
  errorCode?: string
  eventSubtype?: MetricEventSubtype | string
  eventType: MetricEventType
  fingerprint?: string
  geoCity?: string
  geoCountry?: string
  geoRegion?: string
  geoTimezone?: string
  httpMethod?: string
  id?: string
  ipAddress?: string
  message?: string
  metadata?: Record<string, unknown>
  origin?: string
  referrer?: string
  requestBodySummary?: Record<string, unknown>
  requestParams?: Record<string, unknown>
  requestPath?: string
  responseStatusCode?: number
  responseTimeMs?: number
  sessionId?: string
  success?: boolean
  userAgent?: string
  userId?: string
}

export type GetMetricsListQueryType = {
  eventType?: MetricEventType
  filterValue?: string
  fingerprint?: string
  ipAddress?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'eventType' | 'ipAddress'
  sortDir?: 'ASC' | 'DESC'
  success?: boolean
  userId?: string
}
```

### 2. API Model Implementation

**`packages/api/libs/metrics/metrics-api.postgres-model.ts`**

```typescript
import { fn, Op } from 'sequelize'
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'

import {
  type GetMetricsListQueryType,
  METRIC_EVENT_SUBTYPE_ARRAY,
  METRIC_EVENT_TYPE_ARRAY,
  type MetricRecordType,
} from '@dx3/models-shared'

import { UserModel } from '../user/user-api.postgres-model'
import { METRICS_POSTGRES_DB_NAME } from './metrics-api.consts'

@Table({
  indexes: [
    { fields: ['event_type'], name: 'idx_metrics_event_type' },
    { fields: ['user_id'], name: 'idx_metrics_user_id', where: { user_id: { [Op.ne]: null } } },
    { fields: ['fingerprint'], name: 'idx_metrics_fingerprint', where: { fingerprint: { [Op.ne]: null } } },
    { fields: ['ip_address'], name: 'idx_metrics_ip_address' },
    { fields: ['created_at'], name: 'idx_metrics_created_at' },
    { fields: ['success'], name: 'idx_metrics_success', where: { success: false } },
    { fields: ['event_type', 'created_at'], name: 'idx_metrics_type_date' },
  ],
  modelName: METRICS_POSTGRES_DB_NAME,
  timestamps: false,
  underscored: true,
})
export class MetricsModel extends Model<MetricsModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  // Event Classification
  @AllowNull(false)
  @Column({
    field: 'event_type',
    type: DataType.ENUM(...METRIC_EVENT_TYPE_ARRAY),
  })
  eventType: string

  @Column({
    field: 'event_subtype',
    type: DataType.STRING(64),
  })
  eventSubtype: string | null

  // User Context
  @ForeignKey(() => UserModel)
  @Column({ field: 'user_id', type: DataType.UUID })
  userId: string | null

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel

  @Column({ field: 'fingerprint', type: DataType.STRING(64) })
  fingerprint: string | null

  @Column({ field: 'device_id', type: DataType.STRING(128) })
  deviceId: string | null

  // Request Context
  @Column({ field: 'ip_address', type: DataType.INET })
  ipAddress: string | null

  @Column({ field: 'user_agent', type: DataType.TEXT })
  userAgent: string | null

  @Column({ field: 'http_method', type: DataType.STRING(10) })
  httpMethod: string | null

  @Column({ field: 'request_path', type: DataType.STRING(512) })
  requestPath: string | null

  @Column({ field: 'request_params', type: DataType.JSONB })
  requestParams: Record<string, unknown> | null

  @Column({ field: 'request_body_summary', type: DataType.JSONB })
  requestBodySummary: Record<string, unknown> | null

  // Response Info
  @Column({ field: 'response_status_code', type: DataType.SMALLINT })
  responseStatusCode: number | null

  @Column({ field: 'response_time_ms', type: DataType.INTEGER })
  responseTimeMs: number | null

  // Geolocation
  @Column({ field: 'geo_country', type: DataType.STRING(3) })
  geoCountry: string | null

  @Column({ field: 'geo_region', type: DataType.STRING(10) })
  geoRegion: string | null

  @Column({ field: 'geo_city', type: DataType.STRING(128) })
  geoCity: string | null

  @Column({ field: 'geo_timezone', type: DataType.STRING(64) })
  geoTimezone: string | null

  // Additional Context
  @Column({ field: 'session_id', type: DataType.STRING(128) })
  sessionId: string | null

  @Column({ field: 'referrer', type: DataType.STRING(512) })
  referrer: string | null

  @Column({ field: 'origin', type: DataType.STRING(256) })
  origin: string | null

  // Outcome
  @Default(true)
  @Column({ field: 'success', type: DataType.BOOLEAN })
  success: boolean

  @Column({ field: 'message', type: DataType.TEXT })
  message: string | null

  @Column({ field: 'error_code', type: DataType.STRING(32) })
  errorCode: string | null

  // Metadata
  @Column({ field: 'metadata', type: DataType.JSONB })
  metadata: Record<string, unknown> | null

  // Timestamps
  @CreatedAt
  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  //////////////// Static Methods //////////////////

  /**
   * Record a new metric event
   */
  static async record(data: MetricRecordType): Promise<MetricsModel> {
    return MetricsModel.create({
      deviceId: data.deviceId,
      errorCode: data.errorCode,
      eventSubtype: data.eventSubtype,
      eventType: data.eventType,
      fingerprint: data.fingerprint,
      geoCity: data.geoCity,
      geoCountry: data.geoCountry,
      geoRegion: data.geoRegion,
      geoTimezone: data.geoTimezone,
      httpMethod: data.httpMethod,
      ipAddress: data.ipAddress,
      message: data.message,
      metadata: data.metadata,
      origin: data.origin,
      referrer: data.referrer,
      requestBodySummary: data.requestBodySummary,
      requestParams: data.requestParams,
      requestPath: data.requestPath,
      responseStatusCode: data.responseStatusCode,
      responseTimeMs: data.responseTimeMs,
      sessionId: data.sessionId,
      success: data.success ?? true,
      userAgent: data.userAgent,
      userId: data.userId,
    } as MetricsModel)
  }

  /**
   * Batch record multiple metrics (for performance)
   */
  static async recordBatch(records: MetricRecordType[]): Promise<MetricsModel[]> {
    return MetricsModel.bulkCreate(records as MetricsModel[])
  }

  /**
   * Get metrics with pagination and filtering
   */
  static async getList(params: GetMetricsListQueryType): Promise<{ count: number; rows: MetricsModel[] }> {
    const limit = params.limit ?? 50
    const offset = params.offset ?? 0
    const orderBy = params.orderBy ?? 'createdAt'
    const sortDir = params.sortDir ?? 'DESC'

    const where: Record<string, unknown> = {}

    if (params.eventType) where.eventType = params.eventType
    if (params.userId) where.userId = params.userId
    if (params.fingerprint) where.fingerprint = params.fingerprint
    if (params.ipAddress) where.ipAddress = params.ipAddress
    if (params.success !== undefined) where.success = params.success

    return MetricsModel.findAndCountAll({
      limit,
      offset: offset * limit,
      order: [[orderBy, sortDir]],
      where,
    })
  }

  /**
   * Get failed auth attempts for a user/IP in last N minutes
   */
  static async getFailedAuthAttempts(
    identifier: { fingerprint?: string; ipAddress?: string; userId?: string },
    minutesAgo: number = 15,
  ): Promise<number> {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000)
    const where: Record<string, unknown> = {
      createdAt: { [Op.gte]: since },
      eventType: { [Op.in]: ['AUTH_LOGIN', 'AUTH_FAILURE'] },
      success: false,
    }

    if (identifier.userId) where.userId = identifier.userId
    if (identifier.ipAddress) where.ipAddress = identifier.ipAddress
    if (identifier.fingerprint) where.fingerprint = identifier.fingerprint

    return MetricsModel.count({ where })
  }

  /**
   * Get metrics summary for dashboard
   */
  static async getSummary(hoursAgo: number = 24): Promise<{
    authFailures: number
    rateLimitHits: number
    successfulLogins: number
    totalRequests: number
    uniqueUsers: number
  }> {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

    const [totalRequests, successfulLogins, authFailures, rateLimitHits, uniqueUsersResult] = await Promise.all([
      MetricsModel.count({ where: { createdAt: { [Op.gte]: since }, eventType: 'REQUEST' } }),
      MetricsModel.count({ where: { createdAt: { [Op.gte]: since }, eventType: 'AUTH_LOGIN', success: true } }),
      MetricsModel.count({ where: { createdAt: { [Op.gte]: since }, eventType: { [Op.in]: ['AUTH_LOGIN', 'AUTH_FAILURE'] }, success: false } }),
      MetricsModel.count({ where: { createdAt: { [Op.gte]: since }, eventType: 'RATE_LIMIT' } }),
      MetricsModel.count({ distinct: true, col: 'user_id', where: { createdAt: { [Op.gte]: since }, userId: { [Op.ne]: null } } }),
    ])

    return {
      authFailures,
      rateLimitHits,
      successfulLogins,
      totalRequests,
      uniqueUsers: uniqueUsersResult,
    }
  }
}

export type MetricsModelType = typeof MetricsModel.prototype
```

### 3. Metrics Service

**`packages/api/libs/metrics/metrics-api.service.ts`**

```typescript
import type { Request } from 'express'

import { METRIC_EVENT_TYPE, type MetricEventSubtype, type MetricEventType, type MetricRecordType } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { sanitizeForLogging } from '../logger/sanitize-log.util'
import { MetricsModel } from './metrics-api.postgres-model'

export class MetricsService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  /**
   * Extract context from Express Request object
   */
  private extractRequestContext(req: Request): Partial<MetricRecordType> {
    return {
      deviceId: req.headers['x-device-id'] as string || undefined,
      fingerprint: req.fingerprint,
      geoCity: req.geo?.city?.names?.en,
      geoCountry: req.geo?.country?.iso_code,
      geoRegion: req.geo?.subdivisions?.[0]?.iso_code,
      geoTimezone: req.geo?.location?.time_zone,
      httpMethod: req.method,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      origin: req.headers.origin as string,
      referrer: req.headers.referer as string,
      requestParams: Object.keys(req.params || {}).length ? req.params : undefined,
      requestPath: req.path,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    }
  }

  /**
   * Sanitize request body for storage (remove sensitive fields)
   */
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body || !Object.keys(body).length) return undefined
    return sanitizeForLogging(body)
  }

  /**
   * Record a metric from an Express request
   */
  async recordFromRequest(params: {
    errorCode?: string
    eventSubtype?: MetricEventSubtype | string
    eventType: MetricEventType
    message?: string
    metadata?: Record<string, unknown>
    req: Request
    responseStatusCode?: number
    responseTimeMs?: number
    success?: boolean
  }): Promise<void> {
    try {
      const { req, ...rest } = params
      const context = this.extractRequestContext(req)
      const bodyData = this.sanitizeBody(req.body)

      await MetricsModel.record({
        ...context,
        ...rest,
        requestBodySummary: bodyData,
      })
    } catch (err) {
      // Don't let metrics failures break the main flow
      this.logger.logError(`MetricsService.recordFromRequest failed: ${(err as Error).message}`)
    }
  }

  /**
   * Record a standalone metric (not tied to a request)
   */
  async record(data: MetricRecordType): Promise<void> {
    try {
      await MetricsModel.record(data)
    } catch (err) {
      this.logger.logError(`MetricsService.record failed: ${(err as Error).message}`)
    }
  }

  /**
   * Convenience method for logging auth success
   */
  async recordAuthSuccess(req: Request, subtype: MetricEventSubtype | string): Promise<void> {
    await this.recordFromRequest({
      eventSubtype: subtype,
      eventType: METRIC_EVENT_TYPE.AUTH_LOGIN,
      req,
      success: true,
    })
  }

  /**
   * Convenience method for logging auth failure
   */
  async recordAuthFailure(req: Request, subtype: MetricEventSubtype | string, errorCode?: string, message?: string): Promise<void> {
    await this.recordFromRequest({
      errorCode,
      eventSubtype: subtype,
      eventType: METRIC_EVENT_TYPE.AUTH_FAILURE,
      message,
      req,
      success: false,
    })
  }

  /**
   * Convenience method for logging rate limit hits
   */
  async recordRateLimitHit(req: Request, message?: string): Promise<void> {
    await this.recordFromRequest({
      eventType: METRIC_EVENT_TYPE.RATE_LIMIT,
      message,
      req,
      success: false,
    })
  }

  /**
   * Get failed auth attempts count for security checks
   */
  async getFailedAuthAttempts(
    identifier: { fingerprint?: string; ipAddress?: string; userId?: string },
    minutesAgo?: number,
  ): Promise<number> {
    return MetricsModel.getFailedAuthAttempts(identifier, minutesAgo)
  }
}

export type MetricsServiceType = typeof MetricsService.prototype
```

---

## Integration Points

### 1. Modified `logRequest` Utility

**`packages/api/libs/logger/log-request.util.ts`** (Updated)

```typescript
import type { Request } from 'express'

import { METRIC_EVENT_TYPE } from '@dx3/models-shared'

import { MetricsService } from '../metrics/metrics-api.service'
import { ApiLoggingClass } from './logger-api.class'
import { safeStringify } from './sanitize-log.util'

// ... existing helper functions ...

export function logRequest(data: { message?: string; req: Request; type: string }) {
  const { message, req, type } = data

  // Existing console logging logic
  const fingerprint = _getFingerprint(req)
  const geoSummary = _getGeoSummary(req)
  const userId = _getUserId(req)
  const requestData = _getRequestData(req)

  const segments = [
    `method: ${req.method}`,
    `ip: ${req.headers['X-Forwarded-For'] || req.ip}`,
    userId,
    requestData,
  ]

  if (fingerprint) segments.push(fingerprint)
  if (geoSummary) segments.push(geoSummary)
  if (message) segments.push(`msg: ${message}`)

  const isFailed = type.toLowerCase().startsWith('fail')

  if (isFailed) {
    ApiLoggingClass?.instance?.logError(`${type}: ${segments.join(' | ')}`)
  } else {
    ApiLoggingClass?.instance?.logInfo(`${type}: ${segments.join(' | ')}`)
  }

  // NEW: Record to metrics table
  const metricsService = new MetricsService()
  metricsService.recordFromRequest({
    eventSubtype: type,
    eventType: METRIC_EVENT_TYPE.REQUEST,
    message,
    req,
    success: !isFailed,
  }).catch(() => {
    // Silently fail - metrics should not break main flow
  })
}
```

### 2. Auth Controller Integration

**`packages/api/api-app/src/auth/auth-api.controller.ts`** (Updated login method)

```typescript
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { METRIC_EVENT_SUBTYPE, METRIC_EVENT_TYPE } from '@dx3/models-shared'

export const AuthController = {
  // ...

  login: async (req: Request, res: Response) => {
    logRequest({ req, type: 'login' })
    const metricsService = new MetricsService()

    try {
      const service = new AuthLoginService()
      const profile = (await service.login(req.body as LoginPayloadType)) as UserProfileStateType

      // Record successful login
      await metricsService.recordAuthSuccess(req, METRIC_EVENT_SUBTYPE.SUCCESS)

      const tokens = TokenService.generateTokens(profile.id)
      // ... rest of success logic

    } catch (err) {
      // Record failed login
      await metricsService.recordAuthFailure(
        req,
        METRIC_EVENT_SUBTYPE.FAILURE,
        undefined,
        (err as Error)?.message,
      )

      logRequest({ message: (err as Error)?.message, req, type: 'Failed login' })
      sendBadRequest(req, res, err.message)
    }
  },

  // Similar pattern for createAccount, logout, etc.
}
```

### 3. Rate Limiter Integration (Example)

```typescript
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // ... existing rate limit logic ...

  if (isRateLimited) {
    const metricsService = new MetricsService()
    metricsService.recordRateLimitHit(req, 'Rate limit exceeded')

    return sendTooManyRequests(req, res, 'Too many requests')
  }

  next()
}
```

---

## Usage Examples

### Recording Custom Events

```typescript
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { METRIC_EVENT_TYPE } from '@dx3/models-shared'

// In a controller or service
const metricsService = new MetricsService()

// Record a security alert
await metricsService.recordFromRequest({
  eventSubtype: 'suspicious_ip',
  eventType: METRIC_EVENT_TYPE.SECURITY_ALERT,
  message: 'Multiple failed attempts from new location',
  metadata: {
    attemptCount: 5,
    previousCountry: 'US',
    newCountry: 'RU',
  },
  req,
  success: false,
})

// Record device verification
await metricsService.recordFromRequest({
  eventType: METRIC_EVENT_TYPE.DEVICE_VERIFIED,
  metadata: {
    deviceName: device.name,
  },
  req,
  success: true,
})
```

### Querying Metrics (Admin)

```typescript
// Get failed auth attempts for an IP
const failedAttempts = await MetricsModel.getFailedAuthAttempts(
  { ipAddress: '192.168.1.1' },
  30, // last 30 minutes
)

// Get metrics summary
const summary = await MetricsModel.getSummary(24) // last 24 hours
// Returns: { totalRequests, successfulLogins, authFailures, rateLimitHits, uniqueUsers }

// Get detailed metrics list
const { count, rows } = await MetricsModel.getList({
  eventType: METRIC_EVENT_TYPE.AUTH_FAILURE,
  limit: 50,
  offset: 0,
  orderBy: 'createdAt',
  sortDir: 'DESC',
})
```

---

## Testing Considerations

### Unit Tests

```typescript
// packages/api/libs/metrics/metrics-api.service.spec.ts

import { MetricsService } from './metrics-api.service'
import { MetricsModel } from './metrics-api.postgres-model'

jest.mock('./metrics-api.postgres-model')

describe('MetricsService', () => {
  let service: MetricsService

  beforeEach(() => {
    service = new MetricsService()
    jest.clearAllMocks()
  })

  describe('recordFromRequest', () => {
    it('should extract context from request and record metric', async () => {
      const mockReq = {
        body: { email: 'test@example.com' },
        fingerprint: 'fp123',
        geo: { city: { names: { en: 'NYC' } }, country: { iso_code: 'US' } },
        headers: { 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '192.168.1.1' },
        ip: '127.0.0.1',
        method: 'POST',
        params: {},
        path: '/api/auth/login',
        user: { id: 'user123' },
      } as unknown as Request

      await service.recordFromRequest({
        eventType: METRIC_EVENT_TYPE.AUTH_LOGIN,
        req: mockReq,
        success: true,
      })

      expect(MetricsModel.record).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_LOGIN',
          fingerprint: 'fp123',
          geoCity: 'NYC',
          geoCountry: 'US',
          httpMethod: 'POST',
          ipAddress: '192.168.1.1',
          requestPath: '/api/auth/login',
          success: true,
          userId: 'user123',
        }),
      )
    })

    it('should not throw if recording fails', async () => {
      (MetricsModel.record as jest.Mock).mockRejectedValue(new Error('DB Error'))

      // Should not throw
      await expect(
        service.recordFromRequest({
          eventType: METRIC_EVENT_TYPE.REQUEST,
          req: {} as Request,
        }),
      ).resolves.not.toThrow()
    })
  })
})
```

### Integration Tests

```typescript
// packages/api/api-app-e2e/src/metrics/metrics.e2e.spec.ts

describe('Metrics Integration', () => {
  it('should record login attempt metrics', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrong', value: 'test@example.com' })
      .expect(400)

    // Verify metric was recorded
    const metrics = await MetricsModel.findAll({
      order: [['created_at', 'DESC']],
      where: { eventType: METRIC_EVENT_TYPE.AUTH_FAILURE },
    })

    expect(metrics.length).toBeGreaterThan(0)
    expect(metrics[0].requestPath).toBe('/api/auth/login')
    expect(metrics[0].success).toBe(false)
  })
})
```

---

## Future Enhancements

### 1. Table Partitioning (High Volume)

```sql
-- Partition by month for better performance at scale
CREATE TABLE metrics (
  -- ... columns ...
) PARTITION BY RANGE (created_at);

CREATE TABLE metrics_2026_01 PARTITION OF metrics
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Auto-create partitions via cron job or migration
```

### 2. Async Queue for High Throughput

```typescript
// Use Bull or similar for async recording
import Queue from 'bull'

const metricsQueue = new Queue('metrics', redisConfig)

metricsQueue.process(async (job) => {
  await MetricsModel.record(job.data)
})

// In MetricsService
async recordAsync(data: MetricRecordType): Promise<void> {
  await metricsQueue.add(data)
}
```

### 3. Admin Dashboard API

```typescript
// GET /api/admin/metrics/summary
// GET /api/admin/metrics/list
// GET /api/admin/metrics/failed-auth
// GET /api/admin/metrics/by-user/:userId
// GET /api/admin/metrics/by-ip/:ip
```

### 4. Data Retention Policy

```typescript
// Cleanup job to remove old metrics
static async cleanupOldMetrics(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = dayjs().subtract(daysToKeep, 'days').toDate()

  const deleted = await MetricsModel.destroy({
    where: {
      createdAt: { [Op.lt]: cutoffDate },
    },
  })

  return deleted
}
```

### 5. Real-time Alerting

- Integrate with security alert service for suspicious patterns
- Trigger alerts on N failed auth attempts from same IP
- Alert on unusual geographic access patterns

---

## Implementation Checklist

### Phase 1: Core Implementation
- [ ] Create shared types and constants (`packages/shared/models/src/metrics/`)
- [ ] Export from shared models index
- [ ] Create MetricsModel (`packages/api/libs/metrics/`)
- [ ] Create MetricsService
- [ ] Add MetricsModel to PostgresDbConnection model list
- [ ] Write unit tests for MetricsService

### Phase 2: Integration
- [ ] Update `logRequest` utility to record metrics
- [ ] Update AuthController to record auth events
- [ ] Update rate limiter to record rate limit hits
- [ ] Test integrations

### Phase 3: Admin Features (Optional)
- [ ] Create admin routes for metrics queries
- [ ] Add metrics summary endpoint
- [ ] Add failed auth lookup endpoint

### Phase 4: Testing & Validation
- [ ] Unit tests for all new modules
- [ ] Integration tests for metric recording
- [ ] Verify no performance regression

---

*Document Version: 1.0*
*Created: January 26, 2026*
