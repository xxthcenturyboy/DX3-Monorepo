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

1. [Implementation Decisions](#implementation-decisions)
2. [Data Retention Strategy](#data-retention-strategy)
3. [Google Tag Manager + GA4 (Client-Side)](#google-tag-manager--ga4-client-side)
4. [TimescaleDB Metrics (Server-Side)](#timescaledb-metrics-server-side)
5. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
6. [Custom Metrics Dashboard](#custom-metrics-dashboard)
7. [Metrics Catalog](#metrics-catalog)
8. [Implementation Phases](#implementation-phases)
9. [Future Considerations](#future-considerations)
10. [Implementation Checklist](#implementation-checklist)

---

## Implementation Decisions

This section documents key decisions made during requirements interview and technical planning.

### Dashboard Approach

**Initial Implementation:**
- ✅ **Custom Dashboard in Web App**: Build native React dashboard at `/admin/metrics/dashboard`
- ✅ Integrated with existing admin UI and RBAC
- ✅ Uses MUI v7 components, matches app design system
- ✅ **Defer Grafana**: Add later when advanced features needed (alerting, complex queries, stakeholder reports)

**Rationale:**
- Get metrics visibility immediately without additional infrastructure
- Learn what metrics matter before investing in Grafana setup
- Easy migration path: Grafana connects to same TimescaleDB later
- Both can coexist: custom dashboard for quick glance, Grafana for deep analysis

### RBAC Decisions

**New Role: METRICS_ADMIN**
- ✅ Separate role from LOGGING_ADMIN (more granular permissions)
- ✅ **Role Hierarchy**: SUPER_ADMIN > LOGGING_ADMIN > METRICS_ADMIN
- ✅ LOGGING_ADMIN automatically includes METRICS_ADMIN permissions
- ✅ Only SUPER_ADMIN can assign METRICS_ADMIN role
- ✅ Grants access to `/admin/metrics/*` routes

**Rationale:**
- Allows business stakeholders to view metrics without log access
- Security team can have LOGGING_ADMIN (logs + metrics)
- Product team can have METRICS_ADMIN only (business metrics, no sensitive logs)

### Custom Dashboard Specifications

**Core Metrics (MVP):**
- ✅ User Growth: DAU/WAU/MAU trend chart (last 30 days)
- ✅ Signup Counts: 24h/7d/30d with % change indicators
- ✅ Signup Method Breakdown: Email vs Phone (pie/bar chart)
- ✅ Geographic Distribution: Top countries by signups

**Features:**
- ✅ **Refresh**: On-demand with manual refresh button (no auto-refresh)
- ✅ **Date Filtering**: Fixed presets (Last 7d, 30d, 90d) - defer custom date picker
- ✅ **Export**: View-only for now (defer CSV/Excel export)
- ✅ **Mobile**: Full responsive design (charts stack, cards resize)
- ✅ **Empty State**: Helpful message when no data available
- ✅ **Historical Data**: Last 90 days raw + unlimited aggregates

**UI/UX:**
- ✅ Separate from logging dashboard (`/admin/metrics/dashboard` vs `/admin/logs/dashboard`)
- ✅ Clean, focused interface showing key business metrics
- ✅ Loading spinner for slow queries (no timeout)

### API Architecture

**Endpoint Structure:**
- ✅ New namespace: `/api/v1/metrics/*`
- ✅ Separate MetricsController (not part of LoggingController)
- ✅ All endpoints protected by `hasMetricsAdminRole` middleware
- ✅ Examples:
  - `GET /api/v1/metrics/summary` - Dashboard summary
  - `GET /api/v1/metrics/dau?date=2026-01-28` - DAU for specific date
  - `GET /api/v1/metrics/signups?range=7d` - Signup counts
  - `GET /api/v1/metrics/growth?range=30d` - DAU/WAU/MAU trend

**Failure Handling:**
- ✅ **Silent Degradation**: Skip metrics recording if TimescaleDB unavailable
- ✅ Application continues normally (same as logging)
- ✅ Acceptable to lose some metrics data during downtime

### GA4 + GTM Decisions

**Implementation Approach:**
- ✅ **Google Tag Manager**: Single GTM container for all tracking pixels
- ✅ **GA4 Integration**: Configure GA4 tag inside GTM (not direct in code)
- ✅ **User ID Tracking**: Set user_id on signup completion (cross-platform tracking)
- ✅ **Cookie Consent**: Implied consent initially (defer banner until EU launch)

**What GA4 Tracks:**
- ✅ Page views (automatic via GTM)
- ✅ Unique visitors, sessions, traffic sources
- ✅ Custom events: signup_started, signup_completed, login_completed
- ✅ User ID for cross-device tracking

**Privacy:**
- ✅ Store real user_id in both GA4 and TimescaleDB (not anonymized)
- ✅ No opt-out for server-side metrics (operational data, like web server logs)
- ✅ GA4 consent mode deferred (add before EU launch)

### Feature Tracking Scope

**Phase 1 (MVP):**
- ✅ Auth events: signup, login, logout (via MetricsService)
- ✅ API route views: which endpoints hit most (from existing logging)
- ✅ Basic feature usage: media upload, notifications, device registration

**Deferred:**
- ❌ Detailed feature interactions (button clicks, form submissions)
- ❌ Session replay
- ❌ Heatmaps
- ❌ Advanced funnel analysis

### Mobile Analytics

**Current Plan:**
- ✅ Web-only metrics for Phase 1
- ✅ Defer Firebase Analytics until mobile app has production users
- ✅ Mobile app calls same API endpoints (metrics recorded in TimescaleDB)
- ✅ Future: Add Firebase when needed (feeds into same GA4 property)

### Data Retention & Privacy

**Server-Side (TimescaleDB):**
- ✅ Raw logs: 90 days (same as logging table)
- ✅ Aggregates: Indefinite (metrics_daily, metrics_weekly, metrics_monthly)
- ✅ Store real user_id for cohort analysis
- ✅ No anonymization or opt-out for operational metrics

**Client-Side (GA4):**
- ✅ Event data: 14 months (free tier default)
- ✅ Can export to BigQuery for longer retention
- ✅ User ID tracking for cross-platform analysis

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

## Role-Based Access Control (RBAC)

### Overview

Access to metrics features is controlled by a new specialized role: **METRICS_ADMIN**. This role grants access to business metrics and analytics without providing log access or general administrative privileges.

### Role Hierarchy

```
SUPER_ADMIN (order: 5)
    ↓ (full system access, can assign all roles)
    ├── LOGGING_ADMIN (order: 4)
    │   ├── System logs access (from logging implementation)
    │   └── Metrics access (inherits METRICS_ADMIN)
    └── METRICS_ADMIN (order: 3)
        └── Business metrics, analytics, dashboards

ADMIN (order: 2)
    └── User management, support requests

USER (order: 1)
    └── Standard application features
```

**Key Points:**
- `SUPER_ADMIN` has access to everything
- `LOGGING_ADMIN` automatically includes `METRICS_ADMIN` permissions
- `METRICS_ADMIN` is independent (can be granted without LOGGING_ADMIN)
- Only `SUPER_ADMIN` can assign specialized roles

### RBAC Implementation Checklist

#### 1. Add METRICS_ADMIN Role Constant

**File:** `packages/shared/models/src/user-privilege/user-privilege-shared.consts.ts`

```typescript
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  LOGGING_ADMIN: 'LOGGING_ADMIN',
  METRICS_ADMIN: 'METRICS_ADMIN',  // NEW
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
} as const

export const USER_ROLE_ARRAY = Object.values(USER_ROLE)
```

#### 2. Add Privilege Set Seed Data

**File:** `packages/api/libs/pg/seed/data/user-privilege-sets.data.ts`

```typescript
export const USER_PRIVILEGE_SETS_SEED: UserPrivilegeSetSeedData[] = [
  {
    description: 'Standard user with basic access permissions',
    name: 'USER',
    order: 1,
  },
  {
    description: 'Administrator with elevated permissions for user management',
    name: 'ADMIN',
    order: 2,
  },
  {
    description: 'Metrics administrator with access to business analytics',  // NEW
    name: 'METRICS_ADMIN',  // NEW
    order: 3,  // NEW
  },  // NEW
  {
    description: 'Logging administrator with access to system logs and analytics',
    name: 'LOGGING_ADMIN',
    order: 4,  // Changed from 3
  },
  {
    description: 'Super administrator with full system access',
    name: 'SUPER_ADMIN',
    order: 5,  // Changed from 4
  },
]
```

**Action:** Run `make db-seed` after updating seed data.

#### 3. Create Metrics Admin Middleware

**File:** `packages/api/libs/auth/middleware/ensure-role.middleware.ts`

```typescript
/**
 * Middleware to ensure user has METRICS_ADMIN, LOGGING_ADMIN, or SUPER_ADMIN role
 * LOGGING_ADMIN includes METRICS_ADMIN permissions
 */
export async function hasMetricsAdminRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = _getUserId(req)

  if (!userId) {
    throw new Error('User is not authorized for this activity.')
  }

  // SUPER_ADMIN always has access
  const hasSuperAdmin = await userHasRole(userId, USER_ROLE.SUPER_ADMIN)
  if (hasSuperAdmin) {
    next()
    return
  }

  // LOGGING_ADMIN includes metrics access
  const hasLoggingAdmin = await userHasRole(userId, USER_ROLE.LOGGING_ADMIN)
  if (hasLoggingAdmin) {
    next()
    return
  }

  // Check for METRICS_ADMIN role
  const hasRole = await userHasRole(userId, USER_ROLE.METRICS_ADMIN)
  if (!hasRole) {
    throw new Error('User does not have metrics admin permissions.')
  }

  next()
}
```

#### 4. Create Protected Metrics Routes

**File:** `packages/api/api-app/src/metrics/metrics-api.routes.ts` (NEW)

```typescript
import { Router } from 'express'
import { hasMetricsAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'
import { MetricsController } from './metrics-api.controller'

const router = Router()

// All metrics endpoints require METRICS_ADMIN role (or LOGGING_ADMIN/SUPER_ADMIN)
router.get('/summary', hasMetricsAdminRole, MetricsController.getSummary)
router.get('/dau', hasMetricsAdminRole, MetricsController.getDAU)
router.get('/wau', hasMetricsAdminRole, MetricsController.getWAU)
router.get('/mau', hasMetricsAdminRole, MetricsController.getMAU)
router.get('/signups', hasMetricsAdminRole, MetricsController.getSignups)
router.get('/growth', hasMetricsAdminRole, MetricsController.getGrowthTrend)
router.get('/geography', hasMetricsAdminRole, MetricsController.getGeography)

export { router as metricsRoutes }
```

**Add to main routes in:** `packages/api/api-app/src/routes/v1.routes.ts`

```typescript
import { metricsRoutes } from '../metrics/metrics-api.routes'

// Add to router setup
router.use('/metrics', metricsRoutes)  // All /api/v1/metrics/* routes
```

#### 5. Create MetricsController

**File:** `packages/api/api-app/src/metrics/metrics-api.controller.ts` (NEW)

```typescript
import type { Request, Response } from 'express'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import { sendOK } from '@dx3/api-libs/response'

export const MetricsController = {
  /**
   * GET /api/v1/metrics/summary
   * Get comprehensive dashboard metrics
   */
  getSummary: async (req: Request, res: Response) => {
    const service = new MetricsService()
    const data = await service.getDashboardMetrics()
    return sendOK(req, res, data)
  },

  /**
   * GET /api/v1/metrics/dau?date=2026-01-28
   * Get Daily Active Users for specific date
   */
  getDAU: async (req: Request, res: Response) => {
    const service = new MetricsService()
    const date = req.query.date ? new Date(req.query.date as string) : new Date()
    const dau = await service.getDAU(date)
    return sendOK(req, res, { dau, date })
  },

  /**
   * GET /api/v1/metrics/growth?range=30d
   * Get DAU/WAU/MAU trend over date range
   */
  getGrowthTrend: async (req: Request, res: Response) => {
    const service = new MetricsService()
    const range = req.query.range as string || '30d'

    // Parse range (7d, 30d, 90d)
    const days = parseInt(range.replace('d', ''), 10)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Query metrics_daily aggregate for trend
    const result = await service.loggingService.queryRaw(`
      SELECT
        bucket::date as date,
        unique_users as users
      FROM metrics_daily
      WHERE event_type = 'METRIC_LOGIN'
        AND bucket >= $1
        AND bucket <= $2
      ORDER BY bucket ASC
    `, [startDate, endDate])

    return sendOK(req, res, { data: result.rows, range })
  },

  /**
   * GET /api/v1/metrics/signups?range=7d
   * Get signup counts by method
   */
  getSignups: async (req: Request, res: Response) => {
    const service = new MetricsService()
    const range = req.query.range as string || '7d'

    const days = parseInt(range.replace('d', ''), 10)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const breakdown = await service.getSignupsByMethod(startDate, endDate)
    return sendOK(req, res, { ...breakdown, range })
  },

  /**
   * GET /api/v1/metrics/geography?range=30d
   * Get top countries by signups
   */
  getGeography: async (req: Request, res: Response) => {
    const service = new MetricsService()
    const range = req.query.range as string || '30d'

    const days = parseInt(range.replace('d', ''), 10)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await service.loggingService.queryRaw<{
      count: string
      country: string
    }>(`
      SELECT
        geo_country as country,
        COUNT(*) as count
      FROM logs
      WHERE event_type = 'METRIC_SIGNUP'
        AND created_at >= $1
        AND created_at < $2
        AND geo_country IS NOT NULL
      GROUP BY geo_country
      ORDER BY count DESC
      LIMIT 10
    `, [startDate, endDate])

    return sendOK(req, res, { data: result.rows, range })
  },

  // Additional endpoints...
}
```

#### 6. Update Admin Menu

**File:** `packages/web/web-app/src/app/ui/menus/admin.menu.ts`

```typescript
import { USER_ROLE } from '@dx3/models-shared'
import { METRICS_ADMIN_ROUTES } from '../../metrics/admin/metrics-admin-web.routes'

export const adminMenu = (): AppMenuType => {
  return {
    items: [
      // ... existing menu items ...
      {
        icon: IconNames.SHOW_CHART,
        id: 'menu-item-admin-metrics',
        restriction: USER_ROLE.METRICS_ADMIN,  // METRICS_ADMIN role
        routeKey: METRICS_ADMIN_ROUTES.DASHBOARD,
        title: strings.METRICS_DASHBOARD,
        type: 'ROUTE',
      },
      {
        icon: IconNames.ASSESSMENT,
        id: 'menu-item-admin-logging',
        restriction: USER_ROLE.LOGGING_ADMIN,  // LOGGING_ADMIN role
        routeKey: LOGGING_ADMIN_ROUTES.DASHBOARD,
        title: strings.SYSTEM_LOGS,
        type: 'ROUTE',
      },
      // ... other menu items ...
    ],
    title: strings.ADMIN,
  }
}
```

#### 7. Add i18n Strings

**File:** `packages/web/web-app/assets/locales/en.json`

```json
{
  "DAILY_ACTIVE_USERS": "Daily Active Users",
  "GEOGRAPHIC_DISTRIBUTION": "Geographic Distribution",
  "METRICS_ADMIN": "Metrics Administrator",
  "METRICS_ADMIN_DESCRIPTION": "Access to business metrics, analytics, and growth dashboards",
  "METRICS_DASHBOARD": "Metrics Dashboard",
  "MONTHLY_ACTIVE_USERS": "Monthly Active Users",
  "SIGNUP_BREAKDOWN": "Signup Breakdown",
  "USER_GROWTH": "User Growth",
  "WEEKLY_ACTIVE_USERS": "Weekly Active Users"
}
```

#### 8. Create Route Constants

**File:** `packages/web/web-app/src/app/metrics/admin/metrics-admin-web.routes.ts` (NEW)

```typescript
export const METRICS_ADMIN_ROUTES = {
  DASHBOARD: '/admin/metrics/dashboard',
  GEOGRAPHY: '/admin/metrics/geography',
  GROWTH: '/admin/metrics/growth',
  SIGNUPS: '/admin/metrics/signups',
} as const
```

### Security Validation Points

1. **Database Level**: `UserModel.roles` setter validates against `USER_ROLE_ARRAY`
2. **API Level**: All `/api/v1/metrics/*` endpoints use `hasMetricsAdminRole` middleware
3. **Frontend Level**: Role update UI checks `currentUser?.sa` before allowing changes
4. **Menu Level**: Menu items filtered by `MenuConfigService` based on user roles
5. **Router Level**: `MetricsAdminRouter` checks roles before rendering routes

---

## Custom Metrics Dashboard

### Overview

The custom metrics dashboard is a native React component integrated into the admin section at `/admin/metrics/dashboard`. It provides quick visibility into key business metrics without requiring external tools.

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Metrics Dashboard                [Last 30d ▼] [Refresh 🔄]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    USER GROWTH                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │    DAU     │  │    WAU     │  │    MAU     │         │  │
│  │  │   1,234    │  │   5,678    │  │   12,345   │         │  │
│  │  │   ↑ 8%     │  │   ↑ 12%    │  │   ↑ 15%    │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │                                                           │  │
│  │  [Line Chart: DAU/WAU/MAU Trend - Last 30 Days]          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    SIGNUPS                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │  Last 24h  │  │  Last 7d   │  │  Last 30d  │         │  │
│  │  │     45     │  │    312     │  │   1,234    │         │  │
│  │  │   ↑ 23%    │  │   ↑ 15%    │  │   ↑ 18%    │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │                                                           │  │
│  │  [Pie Chart: Email vs Phone Signups]                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │             GEOGRAPHIC DISTRIBUTION                      │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  Country        Signups    % of Total           │    │  │
│  │  │  🇺🇸 United States  456      37%                │    │  │
│  │  │  🇬🇧 United Kingdom 234      19%                │    │  │
│  │  │  🇨🇦 Canada          123      10%                │    │  │
│  │  │  🇦🇺 Australia       98       8%                 │    │  │
│  │  │  🇩🇪 Germany         87       7%                 │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Component Structure

**File:** `packages/web/web-app/src/app/metrics/admin/dashboard/metrics-admin-dashboard.component.tsx`

```typescript
import { Box, Button, Card, CardContent, Grid, MenuItem, Select, Typography } from '@mui/material'
import { RefreshIcon } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useGetMetricsSummaryQuery, useGetGrowthTrendQuery } from '../metrics-admin-web.api'
import { MetricCard } from './metric-card.component'
import { GrowthChart } from './growth-chart.component'
import { SignupBreakdownChart } from './signup-breakdown-chart.component'
import { GeographyTable } from './geography-table.component'

export const MetricsAdminDashboard = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch metrics data
  const { data: summary, isLoading: summaryLoading, error: summaryError } =
    useGetMetricsSummaryQuery(refreshKey)

  const { data: growth, isLoading: growthLoading } =
    useGetGrowthTrendQuery({ range: dateRange, refreshKey })

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Empty state
  if (!summaryLoading && !summary?.dau && !summary?.signupsLast24h) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No metrics data available yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start collecting data by recording signup and login events
        </Typography>
      </Box>
    )
  }

  // Error state (TimescaleDB unavailable)
  if (summaryError) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Unable to load metrics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The metrics database is currently unavailable. Please try again later.
        </Typography>
        <Button onClick={handleRefresh} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Metrics Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={summaryLoading || growthLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* User Growth Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>User Growth</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Daily Active Users"
                value={summary?.dau || 0}
                trend={calculateTrend(summary?.dau, summary?.previousDau)}
                loading={summaryLoading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Weekly Active Users"
                value={summary?.wau || 0}
                trend={calculateTrend(summary?.wau, summary?.previousWau)}
                loading={summaryLoading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Monthly Active Users"
                value={summary?.mau || 0}
                trend={calculateTrend(summary?.mau, summary?.previousMau)}
                loading={summaryLoading}
              />
            </Grid>
          </Grid>
          <GrowthChart data={growth?.data} loading={growthLoading} />
        </CardContent>
      </Card>

      {/* Signups Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Signups</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <MetricCard
                    title="Last 24h"
                    value={summary?.signupsLast24h || 0}
                    compact
                    loading={summaryLoading}
                  />
                </Grid>
                <Grid item xs={4}>
                  <MetricCard
                    title="Last 7d"
                    value={summary?.signupsLast7d || 0}
                    compact
                    loading={summaryLoading}
                  />
                </Grid>
                <Grid item xs={4}>
                  <MetricCard
                    title="Last 30d"
                    value={summary?.signupsLast30d || 0}
                    compact
                    loading={summaryLoading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Signup Method</Typography>
              <SignupBreakdownChart range={dateRange} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Geography Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Geographic Distribution</Typography>
          <GeographyTable range={dateRange} />
        </CardContent>
      </Card>
    </Box>
  )
}

function calculateTrend(current?: number, previous?: number): number | undefined {
  if (!current || !previous) return undefined
  return ((current - previous) / previous) * 100
}
```

### RTK Query API Integration

**File:** `packages/web/web-app/src/app/metrics/admin/metrics-admin-web.api.ts`

```typescript
import { apiWeb } from '../../../api/api-web.util'

export const apiWebMetricsAdmin = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getMetricsSummary: build.query<MetricsSummaryType, number>({
      query: (refreshKey) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `metrics/summary?_=${refreshKey}`,  // Cache busting
      }),
    }),

    getGrowthTrend: build.query<GrowthTrendType, { range: string; refreshKey: number }>({
      query: ({ range, refreshKey }) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `metrics/growth?range=${range}&_=${refreshKey}`,
      }),
    }),

    getSignupBreakdown: build.query<SignupBreakdownType, { range: string }>({
      query: ({ range }) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `metrics/signups?range=${range}`,
      }),
    }),

    getGeographyData: build.query<GeographyType[], { range: string }>({
      query: ({ range }) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `metrics/geography?range=${range}`,
      }),
    }),
  }),
})

export const {
  useGetMetricsSummaryQuery,
  useGetGrowthTrendQuery,
  useGetSignupBreakdownQuery,
  useGetGeographyDataQuery,
} = apiWebMetricsAdmin
```

### Mobile Responsive Design

**Key Responsive Patterns:**

```typescript
// Metric cards stack on mobile
<Grid container spacing={2}>
  <Grid item xs={12} sm={4}>  {/* Full width mobile, 1/3 desktop */}
    <MetricCard />
  </Grid>
</Grid>

// Charts resize automatically with responsive container
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* Chart config */}
  </LineChart>
</ResponsiveContainer>

// Tables scroll horizontally on mobile
<TableContainer sx={{ overflowX: 'auto' }}>
  <Table>
    {/* Table content */}
  </Table>
</TableContainer>
```

### Loading and Error States

**Loading:**
- Skeleton loaders for metric cards
- Chart placeholder with loading spinner
- Disabled refresh button during load

**Error:**
- Friendly error message if TimescaleDB unavailable
- Retry button
- Falls back gracefully (no app crash)

**Empty State:**
- Clear message: "No metrics data available yet"
- Instructions: "Start collecting data by recording events"

### Performance Considerations

**Query Optimization:**
- Use continuous aggregates (metrics_daily) for historical trends
- Raw logs table only for last 90 days detailed view
- Date range presets aligned with aggregate boundaries

**Caching:**
- RTK Query caches results (5-minute default)
- Refresh button increments cache key to force refetch
- No auto-refresh (on-demand only)

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

### Phase 1: GTM + GA4 Setup (Week 1)

**Goal:** Get client-side traffic visibility immediately

**Effort:** 2-4 hours

**Tasks:**
- Create GTM container and GA4 property
- Implement GTM integration in web app
- Configure GA4 tag and conversion events in GTM
- Test data flow to GA4 Real-Time dashboard

**Deliverables:**
- ✅ GTM container configured with GA4
- ✅ Page views tracked automatically
- ✅ Conversion events (signup, login) tracked
- ✅ User ID cross-device tracking

**Success Criteria:**
- GA4 Real-Time shows current visitors
- Custom events appear in GA4 within 5 minutes
- User IDs visible in User Explorer

---

### Phase 2: RBAC + TimescaleDB Metrics (Week 2)

**Goal:** Server-side business metrics with role-based access

**Effort:** 1-2 days

**Tasks:**
- Add METRICS_ADMIN role to RBAC system
- Create MetricsService for recording and querying
- Add continuous aggregates to TimescaleDB schema
- Integrate with AuthController (signup, login tracking)
- Create protected API endpoints

**Deliverables:**
- ✅ METRICS_ADMIN role with proper hierarchy
- ✅ Server-side signup/login tracking
- ✅ Continuous aggregates for fast queries
- ✅ Protected `/api/v1/metrics/*` endpoints

**Success Criteria:**
- Signups create METRIC_SIGNUP events in logs table
- Continuous aggregates populate within refresh interval
- API endpoints return data in < 2 seconds
- RBAC permissions work correctly

---

### Phase 3: Custom Metrics Dashboard (Week 3)

**Goal:** Native React dashboard for key business metrics

**Effort:** 3-5 days

**Tasks:**
- Create metrics admin router and routes
- Build RTK Query API layer
- Develop reusable metric components (cards, charts, tables)
- Implement main dashboard with all sections
- Add empty/error/loading states
- Test mobile responsiveness

**Deliverables:**
- ✅ Custom dashboard at `/admin/metrics/dashboard`
- ✅ DAU/WAU/MAU visualization
- ✅ Signup metrics and breakdown
- ✅ Geographic distribution
- ✅ Full mobile responsive design

**Success Criteria:**
- Dashboard loads in < 3 seconds
- All charts/tables render correctly
- Date range filtering works
- Graceful error handling
- Looks professional on mobile and desktop

---

### Phase 4: Integration and Testing (Week 4)

**Goal:** End-to-end validation and polish

**Effort:** 2-3 days

**Tasks:**
- Comprehensive RBAC testing
- API integration tests
- UI E2E tests (Cypress)
- Performance testing
- Documentation updates

**Deliverables:**
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Production-ready deployment

**Success Criteria:**
- 100% of RBAC tests passing
- No console errors in production build
- Dashboard works for all supported roles
- Performance benchmarks met

---

### Future Enhancements (When Needed)

**Phase 5: Advanced Features**

When core metrics prove valuable, consider adding:

**Grafana Integration** (4-8 hours)
- Deploy Grafana container
- Connect to existing TimescaleDB
- Create advanced dashboards
- Set up alerting rules
- Both custom dashboard and Grafana coexist

**Enhanced Tracking** (varies)
- Cookie consent banner for GA4 (EU launch)
- Firebase Analytics for mobile app
- Additional feature usage tracking
- Session replay (PostHog)

**Advanced Analytics** (2-4 weeks)
- A/B testing framework
- Funnel analysis visualization
- Cohort retention dashboard
- Predictive churn modeling
- Custom date range picker
- CSV/Excel export functionality

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

### Phase 1: GTM + GA4 (Client-Side Tracking)

**Goal:** Get basic web traffic visibility immediately

- [ ] Create GTM container at [tagmanager.google.com](https://tagmanager.google.com/)
- [ ] Create GA4 property at [analytics.google.com](https://analytics.google.com/)
- [ ] Set GA4 data retention to 14 months (Admin > Data Settings > Data Retention)
- [ ] Add `GTM_CONTAINER_ID` to `.env.development` and `.env.production`
- [ ] Create `packages/web/web-app/src/lib/analytics/google-tag-manager.ts`
- [ ] Create `packages/web/web-app/src/hooks/useGoogleTagManager.ts`
- [ ] Add `useGoogleTagManager()` to App component
- [ ] Test GTM loads in browser (check dataLayer in console)
- [ ] **In GTM**: Create GA4 Configuration tag with Measurement ID
- [ ] **In GTM**: Create page_view trigger (Custom Event)
- [ ] **In GTM**: Create GA4 Event tags for: signup_started, signup_completed, login_completed
- [ ] **In GTM**: Create variables for event parameters (method, user_id)
- [ ] **In GTM**: Publish container
- [ ] Verify page views in GA4 Real-Time dashboard
- [ ] Verify custom events appear in GA4 Real-Time
- [ ] Test user_id tracking after signup (check GA4 User Explorer)
- [ ] Document GTM container access for team

**Deliverables:**
- ✅ GTM container configured with GA4
- ✅ GA4 dashboard showing page views and traffic
- ✅ Conversion tracking (signup, login)
- ✅ User ID cross-device tracking

---

### Phase 2: RBAC for Metrics

**Goal:** Set up permissions for metrics access

- [ ] Add `METRICS_ADMIN` to `USER_ROLE` in `packages/shared/models/src/user-privilege/user-privilege-shared.consts.ts`
- [ ] Update privilege sets seed data with `METRICS_ADMIN` entry (order: 3)
- [ ] Update `LOGGING_ADMIN` order to 4, `SUPER_ADMIN` to 5
- [ ] Run database seeder: `make db-seed`
- [ ] Verify new role in user_privilege_sets table
- [ ] Create `hasMetricsAdminRole` middleware in `packages/api/libs/auth/middleware/ensure-role.middleware.ts`
  - [ ] Check for METRICS_ADMIN OR LOGGING_ADMIN OR SUPER_ADMIN
  - [ ] Write unit tests for middleware
- [ ] Add i18n strings to `packages/web/web-app/assets/locales/en.json`:
  - [ ] METRICS_DASHBOARD, METRICS_ADMIN, METRICS_ADMIN_DESCRIPTION
  - [ ] USER_GROWTH, SIGNUP_BREAKDOWN, GEOGRAPHIC_DISTRIBUTION
  - [ ] DAILY_ACTIVE_USERS, WEEKLY_ACTIVE_USERS, MONTHLY_ACTIVE_USERS
- [ ] Add metrics menu item to admin menu with `restriction: USER_ROLE.METRICS_ADMIN`
- [ ] Test menu visibility:
  - [ ] USER cannot see metrics menu
  - [ ] ADMIN cannot see metrics menu
  - [ ] METRICS_ADMIN can see metrics menu
  - [ ] LOGGING_ADMIN can see both logs and metrics menus
  - [ ] SUPER_ADMIN can see all menus
- [ ] Test role assignment:
  - [ ] Only SUPER_ADMIN can assign METRICS_ADMIN role in user admin UI
  - [ ] ADMIN cannot assign METRICS_ADMIN role

**Deliverables:**
- ✅ METRICS_ADMIN role created and seeded
- ✅ Role hierarchy working correctly
- ✅ Menu visibility based on roles

---

### Phase 3: TimescaleDB Metrics (Server-Side)

**Goal:** Record business events to TimescaleDB

- [ ] Add `METRIC_EVENT_TYPE` constants to `packages/shared/models/src/logging/logging-shared.consts.ts`
  - [ ] METRIC_SIGNUP, METRIC_LOGIN, METRIC_LOGOUT
  - [ ] METRIC_EMAIL_VERIFIED, METRIC_PHONE_VERIFIED
  - [ ] METRIC_FEATURE_USED, METRIC_SESSION_START
- [ ] Export from shared models index
- [ ] Create `packages/api/libs/metrics/metrics-api.service.ts`
  - [ ] `recordSignup()` method
  - [ ] `recordLogin()` method
  - [ ] `recordFeatureUsage()` method
  - [ ] `getDAU()`, `getWAU()`, `getMAU()` query methods
  - [ ] `getSignupCount()`, `getSignupsByMethod()` query methods
  - [ ] `getDashboardMetrics()` comprehensive method
- [ ] Create `packages/api/libs/metrics/metrics-api.service.spec.ts`
- [ ] Create `packages/api/libs/metrics/index.ts` (barrel export)
- [ ] Add continuous aggregates to TimescaleDB schema:
  - [ ] metrics_daily (bucket, event_type, method, signup_source, geo_country, counts)
  - [ ] metrics_weekly (bucket, event_type, counts)
  - [ ] metrics_monthly (bucket, event_type, counts)
  - [ ] Add refresh policies (daily, weekly, monthly)
- [ ] Integrate MetricsService with AuthController:
  - [ ] Call `recordSignup()` on successful account creation
  - [ ] Call `recordLogin()` on successful login
  - [ ] Include method (email/phone), signup source detection
- [ ] Test metrics recording:
  - [ ] Signup creates METRIC_SIGNUP event
  - [ ] Login creates METRIC_LOGIN event
  - [ ] Events appear in logs table
  - [ ] Continuous aggregates populate correctly
- [ ] Add metrics recording to other features (if applicable):
  - [ ] Media upload
  - [ ] Notification sent
  - [ ] Device registration

**Deliverables:**
- ✅ Server-side signup/login tracking
- ✅ Continuous aggregates for fast queries
- ✅ Query-able metrics in TimescaleDB

---

### Phase 4: Metrics API Endpoints

**Goal:** Expose metrics data via REST API

- [ ] Create `packages/api/api-app/src/metrics/metrics-api.controller.ts`
  - [ ] `GET /api/v1/metrics/summary` - Dashboard summary (DAU/WAU/MAU, signups)
  - [ ] `GET /api/v1/metrics/dau?date=YYYY-MM-DD` - DAU for specific date
  - [ ] `GET /api/v1/metrics/wau?date=YYYY-MM-DD` - WAU ending on date
  - [ ] `GET /api/v1/metrics/mau?date=YYYY-MM-DD` - MAU ending on date
  - [ ] `GET /api/v1/metrics/signups?range=7d` - Signup counts by method
  - [ ] `GET /api/v1/metrics/growth?range=30d` - DAU/WAU/MAU trend
  - [ ] `GET /api/v1/metrics/geography?range=30d` - Top countries
- [ ] Create `packages/api/api-app/src/metrics/metrics-api.routes.ts`
  - [ ] All routes protected by `hasMetricsAdminRole` middleware
- [ ] Add metrics routes to `v1.routes.ts`: `router.use('/metrics', metricsRoutes)`
- [ ] Create `packages/api/api-app/src/metrics/metrics-api.controller.spec.ts`
- [ ] Test API endpoints:
  - [ ] Test with SUPER_ADMIN token (should succeed)
  - [ ] Test with LOGGING_ADMIN token (should succeed)
  - [ ] Test with METRICS_ADMIN token (should succeed)
  - [ ] Test with ADMIN token (should fail with 403)
  - [ ] Test with USER token (should fail with 403)
  - [ ] Test with no token (should fail with 401)
- [ ] Test query performance (all queries < 2 seconds)

**Deliverables:**
- ✅ Protected metrics API endpoints
- ✅ Role-based access control working
- ✅ Fast query responses

---

### Phase 5: Custom Metrics Dashboard (Web App)

**Goal:** Build native React dashboard for key metrics

#### 5.1: Routing and Navigation

- [ ] Create `packages/web/web-app/src/app/metrics/admin/metrics-admin-web.routes.ts`
- [ ] Create `packages/web/web-app/src/app/routers/metrics-admin.router.tsx`
  - [ ] Role check: METRICS_ADMIN, LOGGING_ADMIN, or SUPER_ADMIN
  - [ ] Unauthorized component for other users
  - [ ] Lazy load dashboard components
- [ ] Add metrics router to admin routes config
- [ ] Test route protection (unauthorized redirect)

#### 5.2: RTK Query API Layer

- [ ] Create `packages/web/web-app/src/app/metrics/admin/metrics-admin-web.api.ts`
  - [ ] `useGetMetricsSummaryQuery` hook
  - [ ] `useGetGrowthTrendQuery` hook
  - [ ] `useGetSignupBreakdownQuery` hook
  - [ ] `useGetGeographyDataQuery` hook
- [ ] Create `packages/web/web-app/src/app/metrics/admin/metrics-admin-web.types.ts`
  - [ ] MetricsSummaryType
  - [ ] GrowthTrendType
  - [ ] SignupBreakdownType
  - [ ] GeographyType

#### 5.3: Shared Components

- [ ] Create `metric-card.component.tsx` (stat card with trend indicator)
- [ ] Create `growth-chart.component.tsx` (line chart for DAU/WAU/MAU)
- [ ] Create `signup-breakdown-chart.component.tsx` (pie/bar chart)
- [ ] Create `geography-table.component.tsx` (country list with flags)
- [ ] Add empty state component (no data message)
- [ ] Add error state component (database unavailable)
- [ ] Add loading skeletons for all components

#### 5.4: Main Dashboard Component

- [ ] Create `packages/web/web-app/src/app/metrics/admin/dashboard/metrics-admin-dashboard.component.tsx`
  - [ ] Header with date range selector (7d/30d/90d presets)
  - [ ] Manual refresh button
  - [ ] User Growth section (DAU/WAU/MAU cards + trend chart)
  - [ ] Signups section (24h/7d/30d cards + method breakdown)
  - [ ] Geography section (top countries table)
  - [ ] Responsive grid layout (stacks on mobile)
  - [ ] Empty state when no data
  - [ ] Error state when TimescaleDB unavailable
  - [ ] Loading states with spinners

#### 5.5: Testing and Polish

- [ ] Test empty state (no data scenario)
- [ ] Test error state (API returns 500)
- [ ] Test loading states
- [ ] Test mobile responsiveness (iPhone, iPad sizes)
- [ ] Test date range filtering
- [ ] Test manual refresh
- [ ] Verify charts resize on window resize
- [ ] Test with real data (create test signups/logins)

**Deliverables:**
- ✅ Custom metrics dashboard at `/admin/metrics/dashboard`
- ✅ Fully responsive design
- ✅ Graceful error and empty states
- ✅ Real-time data from TimescaleDB

---

### Phase 6: GA4 Custom Events Integration

**Goal:** Track key user actions in GA4

- [ ] Add `trackEvent('signup_started')` call to signup form component
- [ ] Add `trackEvent('signup_completed', { method })` call after successful signup
- [ ] Add `setUserId(user.id)` call on signup completion
- [ ] Add `trackEvent('login_started')` call to login form
- [ ] Add `trackEvent('login_completed', { method })` call after successful login
- [ ] Add `setUserId(user.id)` call on login if not already set
- [ ] Test events appear in GA4 Real-Time (Events section)
- [ ] Test events flow to Reports (wait 24-48 hours for processing)
- [ ] Test user_id tracking (check User Explorer in GA4)

**Deliverables:**
- ✅ Conversion events tracked in GA4
- ✅ User ID for cross-device tracking
- ✅ Funnel analysis possible (signup started → completed)

---

### Phase 7: Testing and Validation

**Goal:** Comprehensive testing of metrics system

#### API Tests

- [ ] Unit tests for MetricsService (all methods)
- [ ] Unit tests for hasMetricsAdminRole middleware
- [ ] Unit tests for MetricsController
- [ ] Integration tests for metrics recording (signup, login)
- [ ] Integration tests for metrics API endpoints
- [ ] Test continuous aggregates populate correctly

#### RBAC Tests

- [ ] Test USER cannot access `/api/v1/metrics/*`
- [ ] Test ADMIN cannot access metrics (no role)
- [ ] Test METRICS_ADMIN can access all metrics endpoints
- [ ] Test LOGGING_ADMIN can access metrics (includes METRICS_ADMIN)
- [ ] Test SUPER_ADMIN can access all endpoints
- [ ] Test only SUPER_ADMIN can assign METRICS_ADMIN role

#### UI Tests

- [ ] E2E test: Login as METRICS_ADMIN, verify dashboard visible
- [ ] E2E test: Login as USER, verify metrics menu not visible
- [ ] E2E test: Dashboard loads with real data
- [ ] E2E test: Date range filter works
- [ ] E2E test: Refresh button reloads data
- [ ] Test mobile responsive layout
- [ ] Test empty state display
- [ ] Test error state display

#### Performance Tests

- [ ] Verify metrics queries complete in < 2 seconds
- [ ] Load test: 100 concurrent signups recorded correctly
- [ ] Verify continuous aggregates reduce query time
- [ ] Check TimescaleDB compression working after 7 days

**Deliverables:**
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ RBAC validated

---

### Phase 8: Documentation and Deployment

**Goal:** Prepare for production deployment

- [ ] Update API documentation with new `/api/v1/metrics/*` endpoints
- [ ] Document METRICS_ADMIN role assignment process
- [ ] Create metrics dashboard user guide for admins
- [ ] Document GA4 setup and configuration
- [ ] Document GTM container configuration
- [ ] Add troubleshooting guide (common issues)
- [ ] Update deployment checklist with:
  - [ ] `GTM_CONTAINER_ID` environment variable
  - [ ] GA4 Measurement ID
  - [ ] Continuous aggregates verified
- [ ] Create monitoring alerts for:
  - [ ] TimescaleDB connection failures
  - [ ] Metrics recording failures
  - [ ] API endpoint slow response times
- [ ] Document how to add Grafana later (migration path)

**Deliverables:**
- ✅ Complete documentation
- ✅ Production deployment checklist
- ✅ Monitoring and alerting set up

---

### Phase 9: Optional Enhancements (Future)

**Defer until core metrics proven valuable:**

- [ ] Add custom date picker (beyond presets)
- [ ] Add CSV/Excel export for metrics
- [ ] Add email reports (weekly/monthly summaries)
- [ ] Implement cookie consent banner for GA4
- [ ] Add Firebase Analytics for mobile app
- [ ] Deploy Grafana for advanced analytics
- [ ] Add session replay (PostHog)
- [ ] Add A/B testing framework
- [ ] Add cohort retention analysis dashboard
- [ ] Add funnel visualization
- [ ] Add predictive churn modeling

---

*Document Version: 2.0*
*Created: January 27, 2026*
*Updated: January 28, 2026 - Added comprehensive implementation decisions, RBAC, custom dashboard, and detailed checklist*
