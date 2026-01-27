# Metrics Tracking Implementation Plan

## Overview

This document outlines a **hybrid analytics strategy** for the DX3 platform, combining:

1. **Google Analytics 4 (GA4)** - Client-side web traffic analytics
2. **TimescaleDB** - Server-side business metrics (extending the existing [logging infrastructure](./LOGGING-TABLE-IMPLEMENTATION.md))

This approach provides immediate visibility into user traffic while maintaining full control over critical business data.

### Why a Hybrid Approach?

| Concern | GA4 Handles | TimescaleDB Handles |
|---------|-------------|---------------------|
| Unique visitors | ✅ | - |
| Traffic sources | ✅ | - |
| Page views | ✅ | - |
| Signup tracking | Basic | ✅ Detailed |
| User retention | Basic | ✅ Advanced |
| Feature usage | - | ✅ |
| Custom business metrics | - | ✅ |
| Data ownership | ❌ Google | ✅ Full |
| Join with user data | ❌ | ✅ |

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           METRICS ARCHITECTURE                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                              CLIENT LAYER                                   │  │
│  ├────────────────────────────────┬───────────────────────────────────────────┤  │
│  │         Web App (React)        │           Mobile App (React Native)       │  │
│  │  ┌──────────────────────────┐  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Google Tag Manager      │  │  │  Firebase Analytics (future)        │  │  │
│  │  │  └─> GA4 Tag             │  │  │  - Screen views                     │  │  │
│  │  │  └─> Future pixels       │  │  │  - App events                       │  │  │
│  │  │  (dataLayer events)      │  │  │  - User properties                  │  │  │
│  │  └──────────────────────────┘  │  └─────────────────────────────────────┘  │  │
│  └────────────────────────────────┴───────────────────────────────────────────┘  │
│                                      │                                           │
│                                      ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                              API LAYER                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  MetricsService.record({...})                                         │  │  │
│  │  │  - Auth events (signup, login, logout)                                │  │  │
│  │  │  - Feature usage (media uploads, notifications, etc.)                 │  │  │
│  │  │  - Business events (profile completion, verification)                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                           │
│           ┌──────────────────────────┴──────────────────────────┐                │
│           ▼                                                      ▼               │
│  ┌─────────────────────────┐              ┌──────────────────────────────────┐   │
│  │   Google Analytics 4    │              │   TimescaleDB (dx-logs)          │   │
│  │  ┌───────────────────┐  │              │  ┌────────────────────────────┐  │   │
│  │  │  Traffic data     │  │              │  │  logs (from logging plan)  │  │   │
│  │  │  Sessions         │  │              │  │  + METRIC_* event types    │  │   │
│  │  │  Conversions      │  │              │  └────────────────────────────┘  │   │
│  │  │  Audiences        │  │              │  ┌────────────────────────────┐  │   │
│  │  └───────────────────┘  │              │  │  metrics_daily (CAgg)      │  │   │
│  │                         │              │  │  metrics_weekly (CAgg)     │  │   │
│  │  Dashboard: GA4 UI      │              │  │  metrics_monthly (CAgg)    │  │   │
│  └─────────────────────────┘              │  └────────────────────────────┘  │   │
│                                           │                                  │   │
│                                           │  Dashboard: Grafana / Metabase   │   │
│                                           └──────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Data Retention Strategy](#data-retention-strategy)
2. [Google Tag Manager + GA4 (Client-Side)](#google-tag-manager--ga4-client-side)
3. [TimescaleDB Metrics (Server-Side)](#timescaledb-metrics-server-side)
4. [Metrics Catalog](#metrics-catalog)
5. [Implementation Phases](#implementation-phases)
6. [Future Considerations](#future-considerations)
7. [Implementation Checklist](#implementation-checklist)

---

## Data Retention Strategy

Understanding what data is kept and for how long is critical for metrics tracking.

### Retention Overview

| Data Type | Storage | Retention | Rationale |
|-----------|---------|-----------|-----------|
| **Raw logs** (`logs` table) | TimescaleDB | **90 days** | High volume event data; needed for debugging and security audits |
| **Compressed logs** | TimescaleDB | 90 days (compressed after 7 days) | Same data, ~90% smaller storage |
| **metrics_daily** (aggregate) | TimescaleDB | **Indefinite** | Small footprint; needed for historical trends |
| **metrics_weekly** (aggregate) | TimescaleDB | **Indefinite** | Small footprint; needed for WAU trends |
| **metrics_monthly** (aggregate) | TimescaleDB | **Indefinite** | Small footprint; needed for YoY comparisons |
| **GA4 data** | Google | **14 months** (free tier) | Google's default retention |

### Why Different Retention Periods?

**Raw Logs (90 days):**
- Individual event records are high volume
- Primarily needed for recent debugging, security investigation
- The logging plan includes automatic retention policy: `SELECT add_retention_policy('logs', INTERVAL '90 days')`

**Metrics Aggregates (Indefinite):**
- Pre-computed summaries are very small (one row per day/week/month per event type)
- Essential for business questions: "How do signups this January compare to last January?"
- Storage cost is negligible (thousands of rows vs millions)

### Continuous Aggregate Retention

Unlike the raw `logs` table, continuous aggregates do **NOT** inherit the retention policy. They must be managed separately if you ever want to drop old data (not recommended for metrics):

```sql
-- Example: If you ever needed to drop very old aggregate data (not recommended)
-- This would delete metrics older than 5 years
-- DELETE FROM metrics_daily WHERE bucket < NOW() - INTERVAL '5 years';

-- For metrics, we recommend NO retention policy - keep aggregates forever
-- The storage footprint is minimal:
-- ~365 rows/year for daily, ~52 rows/year for weekly, ~12 rows/year for monthly
```

### GA4 Retention Settings

In GA4 Admin > Data Settings > Data Retention:
- **Event data retention**: Set to maximum (14 months for free tier)
- **Reset user data on new activity**: Enable (extends retention for active users)

For longer GA4 retention, consider:
- Exporting to BigQuery (free daily export)
- Upgrading to GA4 360 (paid, longer retention)

---

## Google Tag Manager + GA4 (Client-Side)

Google Tag Manager (GTM) is the recommended approach for managing GA4 and other tracking scripts. It provides flexibility to add/modify tracking without code deploys.

### Why GTM over Direct GA4?

| Aspect | Direct GA4 | Google Tag Manager |
|--------|------------|-------------------|
| Adding new tracking tools | Code deploy required | No code changes |
| Marketing team autonomy | Needs developer | Self-service |
| Multiple pixels (FB, LinkedIn) | Multiple scripts | Single GTM script |
| Debugging | Browser console | GTM Preview mode |
| A/B testing tags | Complex | Built-in |

### What GA4 Tracks (via GTM)

- **Unique visitors** - Daily, weekly, monthly active users
- **Page views** - Which pages users visit
- **Traffic sources** - Where users come from (organic, referral, direct)
- **Session data** - Duration, bounce rate, pages per session
- **Basic conversions** - Signup started, signup completed

### Setup Instructions

#### Step 1: Create GTM Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new **Web** container for DX3
3. Copy the Container ID (format: `GTM-XXXXXXX`)

#### Step 2: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for DX3
3. Copy the Measurement ID (format: `G-XXXXXXXXXX`)
4. You'll configure this inside GTM (not in code)

#### Step 3: Environment Configuration

Add to environment files:

```bash
# .env.development
GTM_CONTAINER_ID=GTM-XXXXXXX

# .env.production
GTM_CONTAINER_ID=GTM-YYYYYYY
```

#### Step 4: Web App Integration

Create `packages/web/web-app/src/lib/analytics/google-tag-manager.ts`:

```typescript
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export const GTM_CONTAINER_ID = process.env.GTM_CONTAINER_ID || ''

/**
 * Initialize Google Tag Manager
 * Call once on app mount
 */
export function initializeGTM(): void {
  if (typeof window === 'undefined' || !GTM_CONTAINER_ID) return

  // Initialize dataLayer before GTM script loads
  window.dataLayer = window.dataLayer || []

  // Push initial consent state (update based on user consent)
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  })

  // Load GTM script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
  document.head.appendChild(script)
}

/**
 * Push event to dataLayer
 * GTM triggers will pick these up and fire appropriate tags
 */
export function pushToDataLayer(data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

/**
 * Track page view (for SPA route changes)
 */
export function trackPageView(url: string, title?: string): void {
  pushToDataLayer({
    event: 'page_view',
    page_location: url,
    page_title: title || document.title,
  })
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, boolean | number | string>
): void {
  pushToDataLayer({
    event: eventName,
    ...params,
  })
}

/**
 * Set user ID for cross-device tracking
 * Call after successful login
 */
export function setUserId(userId: string | null): void {
  pushToDataLayer({
    event: 'user_identified',
    user_id: userId,
  })
}

/**
 * Update consent state
 * Call when user updates cookie preferences
 */
export function updateConsent(hasAnalyticsConsent: boolean): void {
  pushToDataLayer({
    analytics_consent: hasAnalyticsConsent ? 'granted' : 'denied',
    event: 'consent_update',
  })
}
```

#### Step 5: React Hook for Route Tracking

Create `packages/web/web-app/src/hooks/useGoogleTagManager.ts`:

```typescript
import { useEffect } from 'react'
import { useLocation } from 'react-router'

import { initializeGTM, trackPageView } from '../lib/analytics/google-tag-manager'

export function useGoogleTagManager(): void {
  const location = useLocation()

  // Initialize GTM on mount
  useEffect(() => {
    initializeGTM()
  }, [])

  // Track page views on route change
  useEffect(() => {
    trackPageView(window.location.href, document.title)
  }, [location])
}
```

#### Step 6: Add to App Root

In your main App component:

```typescript
import { useGoogleTagManager } from './hooks/useGoogleTagManager'

export function App() {
  useGoogleTagManager()

  return (
    // ... your app
  )
}
```

### GTM Container Configuration

After deploying the code, configure GTM in the web interface:

#### 1. Create GA4 Configuration Tag

- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: Your GA4 Measurement ID (G-XXXXXXXXXX)
- **Trigger**: All Pages (or use custom trigger for consent)

#### 2. Create Page View Trigger

- **Trigger Type**: Custom Event
- **Event Name**: `page_view`
- **This trigger fires on**: All Custom Events

#### 3. Create GA4 Event Tag for Custom Events

- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select your GA4 Configuration tag
- **Event Name**: `{{Event}}`
- **Trigger**: Custom trigger matching your events (signup_started, etc.)

#### 4. Create Variables for Event Parameters

- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `method`, `user_id`, etc.

### Custom Events for DX3

Push these events from your React components:

```typescript
import { trackEvent, setUserId } from '../lib/analytics/google-tag-manager'

// Signup funnel events
trackEvent('signup_started', { method: 'email' })
trackEvent('otp_requested', { method: 'email' })
trackEvent('otp_verified', { method: 'email' })
trackEvent('signup_completed', { method: 'email' })

// Login events
trackEvent('login_started', { method: 'phone' })
trackEvent('login_completed', { method: 'phone' })

// After successful login, set user ID
setUserId(user.id)

// Feature engagement
trackEvent('profile_updated', { field: 'avatar' })
trackEvent('device_added')
trackEvent('notification_enabled')
```

### GDPR/Cookie Consent with GTM

GTM has built-in consent mode support:

```typescript
import { initializeGTM, updateConsent } from '../lib/analytics/google-tag-manager'

// On app load, initialize with default denied state
export function initializeWithConsent(hasConsent: boolean): void {
  // Push consent state BEFORE GTM initializes
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    analytics_consent: hasConsent ? 'granted' : 'denied',
    event: 'default_consent',
  })

  initializeGTM()
}

// When user updates preferences in cookie banner
function handleConsentChange(accepted: boolean): void {
  updateConsent(accepted)
  // Store preference
  localStorage.setItem('analytics_consent', accepted ? 'granted' : 'denied')
}
```

In GTM, configure your GA4 tag to respect consent:
1. Go to Tag > Advanced Settings > Consent Settings
2. Set "Require additional consent for tag to fire": `analytics_storage`

### Mobile Considerations

For React Native mobile app:
- GTM has a mobile SDK, but Firebase Analytics is simpler
- Firebase Analytics data flows into the same GA4 property
- Requires `@react-native-firebase/analytics`
- Can share user ID for cross-platform tracking
- Implementation deferred to mobile app development phase

### Adding Future Marketing Pixels

One key benefit of GTM - adding new tracking requires no code changes:

| Pixel | GTM Setup |
|-------|-----------|
| **Facebook Pixel** | Add FB Pixel tag, trigger on page_view and conversions |
| **LinkedIn Insight** | Add LinkedIn tag, trigger on signup_completed |
| **Twitter Pixel** | Add Twitter tag, trigger on conversions |
| **Google Ads** | Add conversion tracking, link to GA4 |

All managed in GTM interface, deployed instantly.

---

## TimescaleDB Metrics (Server-Side)

This section extends the existing [LOGGING-TABLE-IMPLEMENTATION.md](./LOGGING-TABLE-IMPLEMENTATION.md) with business metrics.

### New Metrics Event Types

Add to `packages/shared/models/src/logging/logging-shared.consts.ts`:

```typescript
export const METRIC_EVENT_TYPE = {
  // User lifecycle
  METRIC_SIGNUP: 'METRIC_SIGNUP',
  METRIC_LOGIN: 'METRIC_LOGIN',
  METRIC_LOGOUT: 'METRIC_LOGOUT',
  METRIC_ACCOUNT_DELETED: 'METRIC_ACCOUNT_DELETED',

  // Verification milestones
  METRIC_EMAIL_VERIFIED: 'METRIC_EMAIL_VERIFIED',
  METRIC_PHONE_VERIFIED: 'METRIC_PHONE_VERIFIED',
  METRIC_PROFILE_COMPLETED: 'METRIC_PROFILE_COMPLETED',

  // Feature usage
  METRIC_MEDIA_UPLOADED: 'METRIC_MEDIA_UPLOADED',
  METRIC_NOTIFICATION_SENT: 'METRIC_NOTIFICATION_SENT',
  METRIC_DEVICE_REGISTERED: 'METRIC_DEVICE_REGISTERED',
  METRIC_SUPPORT_REQUEST: 'METRIC_SUPPORT_REQUEST',

  // Engagement
  METRIC_SESSION_START: 'METRIC_SESSION_START',
  METRIC_FEATURE_USED: 'METRIC_FEATURE_USED',
} as const

export const METRIC_EVENT_TYPE_ARRAY = Object.values(METRIC_EVENT_TYPE)

export type MetricEventType = (typeof METRIC_EVENT_TYPE)[keyof typeof METRIC_EVENT_TYPE]
```

### Metrics Event Metadata Schema

The existing `logs` table's `metadata` JSONB column stores metric-specific data:

```typescript
// Signup metadata
type SignupMetadata = {
  method: 'email' | 'phone'
  hasReferrer: boolean
  referrerUserId?: string
  signupSource?: 'web' | 'mobile' | 'api'
}

// Feature usage metadata
type FeatureUsageMetadata = {
  featureName: string
  context?: Record<string, unknown>
}

// Session metadata
type SessionMetadata = {
  sessionDurationMs?: number
  pagesViewed?: number
  platform: 'web' | 'mobile'
}
```

### Continuous Aggregates for Metrics

Add these to the TimescaleDB schema setup.

> **Important**: These continuous aggregates do NOT have retention policies applied. Unlike the raw `logs` table (90-day retention), metrics aggregates are kept **indefinitely** for historical trend analysis. See [Data Retention Strategy](#data-retention-strategy) for details.

```sql
-- Daily metrics aggregate
CREATE MATERIALIZED VIEW metrics_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  event_type,
  metadata->>'method' AS method,
  metadata->>'signupSource' AS signup_source,
  geo_country,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT fingerprint) AS unique_devices,
  COUNT(DISTINCT ip_address) AS unique_ips
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, event_type, method, signup_source, geo_country
WITH NO DATA;

-- Refresh policy: refresh daily
SELECT add_continuous_aggregate_policy('metrics_daily',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day'
);

-- Weekly metrics aggregate (for WAU)
CREATE MATERIALIZED VIEW metrics_weekly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 week', created_at) AS bucket,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, event_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('metrics_weekly',
  start_offset => INTERVAL '2 weeks',
  end_offset => INTERVAL '1 week',
  schedule_interval => INTERVAL '1 week'
);

-- Monthly metrics aggregate (for MAU)
CREATE MATERIALIZED VIEW metrics_monthly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 month', created_at) AS bucket,
  event_type,
  COUNT(*) AS total_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM logs
WHERE event_type LIKE 'METRIC_%'
GROUP BY bucket, event_type
WITH NO DATA;

SELECT add_continuous_aggregate_policy('metrics_monthly',
  start_offset => INTERVAL '2 months',
  end_offset => INTERVAL '1 month',
  schedule_interval => INTERVAL '1 month'
);
```

### MetricsService Implementation

Create `packages/api/libs/metrics/metrics-api.service.ts`:

```typescript
import type { Request } from 'express'

import { METRIC_EVENT_TYPE, type MetricEventType } from '@dx3/models-shared'

import { LoggingService } from '../logging/logging-api.service'

export class MetricsService {
  private loggingService: LoggingService

  constructor() {
    this.loggingService = new LoggingService()
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

    await this.loggingService.recordFromRequest({
      eventType: METRIC_EVENT_TYPE.METRIC_SIGNUP,
      metadata: {
        hasReferrer: !!referrerUserId,
        method,
        referrerUserId,
        signupSource: signupSource || this.detectSource(req),
      },
      req,
      success: true,
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
    const { method, req } = params

    await this.loggingService.recordFromRequest({
      eventType: METRIC_EVENT_TYPE.METRIC_LOGIN,
      metadata: { method },
      req,
      success: true,
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

    await this.loggingService.recordFromRequest({
      eventSubtype: featureName,
      eventType: METRIC_EVENT_TYPE.METRIC_FEATURE_USED,
      metadata: { context, featureName },
      req,
      success: true,
    })
  }

  /**
   * Detect request source (web vs mobile vs api)
   */
  private detectSource(req: Request): 'api' | 'mobile' | 'web' {
    const userAgent = req.headers['user-agent'] || ''
    const origin = req.headers.origin || ''

    if (userAgent.includes('DX3Mobile') || req.headers['x-device-id']) {
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
   * Get signup count for a date range
   */
  async getSignupCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.loggingService.queryRaw<{ count: string }>(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE event_type = 'METRIC_SIGNUP'
        AND created_at >= $1
        AND created_at < $2
    `, [startDate, endDate])

    return parseInt(result.rows[0]?.count || '0', 10)
  }

  /**
   * Get Daily Active Users (DAU)
   */
  async getDAU(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await this.loggingService.queryRaw<{ count: string }>(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM logs
      WHERE event_type IN ('METRIC_LOGIN', 'METRIC_SESSION_START')
        AND created_at >= $1
        AND created_at < $2
        AND user_id IS NOT NULL
    `, [startOfDay, endOfDay])

    return parseInt(result.rows[0]?.count || '0', 10)
  }

  /**
   * Get Weekly Active Users (WAU)
   */
  async getWAU(weekEndDate: Date): Promise<number> {
    const endDate = new Date(weekEndDate)
    const startDate = new Date(weekEndDate)
    startDate.setDate(startDate.getDate() - 7)

    const result = await this.loggingService.queryRaw<{ count: string }>(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM logs
      WHERE event_type IN ('METRIC_LOGIN', 'METRIC_SESSION_START')
        AND created_at >= $1
        AND created_at < $2
        AND user_id IS NOT NULL
    `, [startDate, endDate])

    return parseInt(result.rows[0]?.count || '0', 10)
  }

  /**
   * Get Monthly Active Users (MAU)
   */
  async getMAU(monthEndDate: Date): Promise<number> {
    const endDate = new Date(monthEndDate)
    const startDate = new Date(monthEndDate)
    startDate.setMonth(startDate.getMonth() - 1)

    const result = await this.loggingService.queryRaw<{ count: string }>(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM logs
      WHERE event_type IN ('METRIC_LOGIN', 'METRIC_SESSION_START')
        AND created_at >= $1
        AND created_at < $2
        AND user_id IS NOT NULL
    `, [startDate, endDate])

    return parseInt(result.rows[0]?.count || '0', 10)
  }

  /**
   * Get signups by method breakdown
   */
  async getSignupsByMethod(startDate: Date, endDate: Date): Promise<{
    email: number
    phone: number
    total: number
  }> {
    const result = await this.loggingService.queryRaw<{
      count: string
      method: string
    }>(`
      SELECT
        metadata->>'method' as method,
        COUNT(*) as count
      FROM logs
      WHERE event_type = 'METRIC_SIGNUP'
        AND created_at >= $1
        AND created_at < $2
      GROUP BY metadata->>'method'
    `, [startDate, endDate])

    const breakdown = { email: 0, phone: 0, total: 0 }
    for (const row of result.rows) {
      const count = parseInt(row.count, 10)
      if (row.method === 'email') breakdown.email = count
      if (row.method === 'phone') breakdown.phone = count
      breakdown.total += count
    }

    return breakdown
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    dau: number
    mau: number
    signupsLast24h: number
    signupsLast7d: number
    signupsLast30d: number
    wau: number
  }> {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(now)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const [dau, wau, mau, signups24h, signups7d, signups30d] = await Promise.all([
      this.getDAU(now),
      this.getWAU(now),
      this.getMAU(now),
      this.getSignupCount(yesterday, now),
      this.getSignupCount(weekAgo, now),
      this.getSignupCount(monthAgo, now),
    ])

    return {
      dau,
      mau,
      signupsLast24h: signups24h,
      signupsLast7d: signups7d,
      signupsLast30d: signups30d,
      wau,
    }
  }
}

export type MetricsServiceType = typeof MetricsService.prototype
```

### Integration with Auth Controller

Update `packages/api/api-app/src/auth/auth-api.controller.ts`:

```typescript
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'

export const AuthController = {
  createAccount: async (req: Request, res: Response) => {
    const metricsService = new MetricsService()

    try {
      const service = new AuthSignupService()
      const profile = await service.signup(req.body, req.timezone)

      // Record signup metric
      await metricsService.recordSignup({
        method: req.body.code ? (req.body.value.includes('@') ? 'email' : 'phone') : 'email',
        referrerUserId: req.body.referrerUserId,
        req,
        userId: profile.id,
      })

      // ... rest of controller
    } catch (err) {
      // ... error handling
    }
  },

  login: async (req: Request, res: Response) => {
    const metricsService = new MetricsService()

    try {
      const service = new AuthLoginService()
      const profile = await service.login(req.body)

      // Record login metric
      await metricsService.recordLogin({
        method: profile.lastLoginMethod || 'email',
        req,
        userId: profile.id,
      })

      // ... rest of controller
    } catch (err) {
      // ... error handling
    }
  },
}
```

---

## Metrics Catalog

### Core Business Metrics

| Metric | Formula | Data Source | Query Frequency |
|--------|---------|-------------|-----------------|
| **Total Users** | COUNT(DISTINCT users.id) | PostgreSQL users table | Real-time |
| **DAU** | COUNT(DISTINCT user_id) WHERE login/session today | TimescaleDB logs | Hourly |
| **WAU** | COUNT(DISTINCT user_id) WHERE login/session last 7 days | TimescaleDB logs | Daily |
| **MAU** | COUNT(DISTINCT user_id) WHERE login/session last 30 days | TimescaleDB logs | Daily |
| **Signups** | COUNT(*) WHERE event_type = METRIC_SIGNUP | TimescaleDB logs | Hourly |
| **Signup Conversion** | Signups / Unique Visitors | GA4 + TimescaleDB | Daily |

### Engagement Metrics

| Metric | Formula | Data Source |
|--------|---------|-------------|
| **Sessions per User** | Total Sessions / DAU | TimescaleDB |
| **Feature Adoption** | Users using feature / Total Users | TimescaleDB |
| **Profile Completion Rate** | Completed Profiles / Total Signups | TimescaleDB |
| **Verification Rate** | Verified Users / Total Signups | TimescaleDB |

### Retention Metrics

| Metric | Formula | Data Source |
|--------|---------|-------------|
| **D1 Retention** | Users active day after signup / Signups | TimescaleDB |
| **D7 Retention** | Users active 7 days after signup / Signups | TimescaleDB |
| **D30 Retention** | Users active 30 days after signup / Signups | TimescaleDB |

### Sample Queries

**Daily Signups Trend (Last 30 Days):**

```sql
SELECT
  bucket::date as date,
  SUM(total_count) as signups
FROM metrics_daily
WHERE event_type = 'METRIC_SIGNUP'
  AND bucket >= NOW() - INTERVAL '30 days'
GROUP BY bucket
ORDER BY bucket;
```

**Signup Method Distribution:**

```sql
SELECT
  method,
  SUM(total_count) as count,
  ROUND(100.0 * SUM(total_count) / SUM(SUM(total_count)) OVER (), 2) as percentage
FROM metrics_daily
WHERE event_type = 'METRIC_SIGNUP'
  AND bucket >= NOW() - INTERVAL '30 days'
GROUP BY method;
```

**DAU/WAU/MAU Trend:**

```sql
WITH daily_active AS (
  SELECT
    bucket::date as date,
    unique_users as dau
  FROM metrics_daily
  WHERE event_type = 'METRIC_LOGIN'
),
weekly_active AS (
  SELECT
    bucket::date as week_end,
    unique_users as wau
  FROM metrics_weekly
  WHERE event_type = 'METRIC_LOGIN'
),
monthly_active AS (
  SELECT
    bucket::date as month_end,
    unique_users as mau
  FROM metrics_monthly
  WHERE event_type = 'METRIC_LOGIN'
)
SELECT
  d.date,
  d.dau,
  w.wau,
  m.mau,
  ROUND(d.dau::numeric / NULLIF(w.wau, 0), 3) as dau_wau_ratio,
  ROUND(w.wau::numeric / NULLIF(m.mau, 0), 3) as wau_mau_ratio
FROM daily_active d
LEFT JOIN weekly_active w ON d.date = w.week_end
LEFT JOIN monthly_active m ON d.date = m.month_end
ORDER BY d.date DESC
LIMIT 30;
```

**D7 Retention Cohort Analysis:**

```sql
WITH signup_cohorts AS (
  SELECT
    DATE_TRUNC('week', created_at) as cohort_week,
    user_id
  FROM logs
  WHERE event_type = 'METRIC_SIGNUP'
),
active_week_later AS (
  SELECT DISTINCT
    s.cohort_week,
    s.user_id
  FROM signup_cohorts s
  JOIN logs l ON s.user_id = l.user_id
  WHERE l.event_type = 'METRIC_LOGIN'
    AND l.created_at BETWEEN s.cohort_week + INTERVAL '7 days'
                         AND s.cohort_week + INTERVAL '14 days'
)
SELECT
  s.cohort_week,
  COUNT(DISTINCT s.user_id) as signups,
  COUNT(DISTINCT a.user_id) as returned,
  ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT s.user_id), 2) as d7_retention_pct
FROM signup_cohorts s
LEFT JOIN active_week_later a USING (cohort_week, user_id)
GROUP BY s.cohort_week
ORDER BY s.cohort_week DESC;
```

---

## Implementation Phases

### Phase 1: GTM + GA4 Basic Setup (Week 1)

**Goal:** Get basic traffic visibility immediately

- [ ] Create GTM container (web)
- [ ] Create GA4 property
- [ ] Add `GTM_CONTAINER_ID` to environment configs
- [ ] Create `google-tag-manager.ts` utility
- [ ] Create `useGoogleTagManager` hook
- [ ] Add to App root component
- [ ] Configure GA4 tag in GTM
- [ ] Configure page_view trigger in GTM
- [ ] Verify page views in GA4 Real-Time dashboard
- [ ] Add conversion event triggers (signup_started, signup_completed)

**Deliverables:**
- GTM container configured with GA4
- GA4 dashboard showing traffic
- Basic conversion tracking

### Phase 2: TimescaleDB Metrics Events (With Logging Implementation)

**Goal:** Server-side business metrics

- [ ] Add METRIC_EVENT_TYPE constants to shared models
- [ ] Create MetricsService class
- [ ] Integrate with AuthController (signup, login)
- [ ] Add continuous aggregates (metrics_daily, metrics_weekly, metrics_monthly)
- [ ] Write unit tests for MetricsService

**Deliverables:**
- Server-side signup/login tracking
- Query-able metrics in TimescaleDB

### Phase 3: Dashboard Integration (Week 3-4)

**Goal:** Visualize metrics

**Option A: Grafana (Recommended)**
- Connect Grafana to TimescaleDB
- Create dashboard panels for key metrics
- Set up alerts for anomalies

**Option B: Metabase**
- Connect Metabase to TimescaleDB
- Create questions and dashboards
- More user-friendly for non-technical team members

**Option C: Custom Admin Dashboard**
- Add `/api/admin/metrics` endpoints
- Build React dashboard in web app
- Most control, most effort

**Deliverables:**
- Visual dashboard for business metrics
- Automated reporting (optional)

### Phase 4: Advanced Analytics (Future)

**Goal:** Deeper product insights when needed

Consider adding:
- [ ] Session replay (PostHog)
- [ ] A/B testing framework
- [ ] Funnel analysis
- [ ] Cohort analysis dashboard
- [ ] Predictive churn modeling

---

## Future Considerations

### When to Add PostHog or Similar

Consider upgrading to PostHog when you need:

1. **Session replay** - See exactly what users do
2. **Feature flags with analytics** - Measure A/B tests
3. **Advanced funnels** - Multi-step conversion analysis
4. **Heatmaps** - Visual click/scroll tracking
5. **User-level debugging** - "What did user X do?"

PostHog can be self-hosted alongside your existing infrastructure or used as a cloud service.

### Scaling Considerations

**TimescaleDB:**
- Compression policy keeps storage manageable
- Continuous aggregates make queries fast
- Consider read replicas for heavy dashboard queries

**GA4:**
- Free tier has sampling at high volumes
- Consider GA4 360 (paid) for unsampled data at scale

### Mobile Analytics

When the mobile app matures:
- Add Firebase Analytics (feeds into GA4)
- Or add PostHog React Native SDK
- Ensure cross-platform user ID linking

---

## Implementation Checklist

### Phase 1: GTM + GA4

- [ ] Create GTM container at [tagmanager.google.com](https://tagmanager.google.com/)
- [ ] Create GA4 property at [analytics.google.com](https://analytics.google.com/)
- [ ] Set GA4 data retention to 14 months (Admin > Data Settings > Data Retention)
- [ ] Add `GTM_CONTAINER_ID` to `.env` files
- [ ] Create `packages/web/web-app/src/lib/analytics/google-tag-manager.ts`
- [ ] Create `packages/web/web-app/src/hooks/useGoogleTagManager.ts`
- [ ] Add `useGoogleTagManager()` to App component
- [ ] **In GTM**: Create GA4 Configuration tag with Measurement ID
- [ ] **In GTM**: Create page_view trigger (Custom Event)
- [ ] **In GTM**: Create GA4 Event tags for conversion events
- [ ] **In GTM**: Publish container
- [ ] Verify data in GA4 Real-Time dashboard
- [ ] (Optional) Implement cookie consent banner with consent mode

### Phase 2: TimescaleDB Metrics

- [ ] Add `METRIC_EVENT_TYPE` to `packages/shared/models/src/logging/logging-shared.consts.ts`
- [ ] Export from shared models index
- [ ] Create `packages/api/libs/metrics/metrics-api.service.ts`
- [ ] Create `packages/api/libs/metrics/metrics-api.service.spec.ts`
- [ ] Create `packages/api/libs/metrics/metrics-api.consts.ts`
- [ ] Create `packages/api/libs/metrics/metrics-api.types.ts`
- [ ] Create `packages/api/libs/metrics/index.ts` (barrel)
- [ ] Add continuous aggregates to TimescaleDB schema
- [ ] Integrate MetricsService with AuthController
- [ ] Add metrics recording to other key features

### Phase 3: Dashboard

- [ ] Choose dashboard tool (Grafana/Metabase/Custom)
- [ ] Connect to TimescaleDB
- [ ] Create core metrics dashboard
- [ ] Set up alerting (optional)
- [ ] Document dashboard access for team

---

*Document Version: 1.1*
*Created: January 27, 2026*
*Updated: January 27, 2026 - Changed to GTM, added data retention strategy*
