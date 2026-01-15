# Feature Flag Implementation Strategy

## Overview

This document outlines the feature flag implementation strategy for the DX3 monorepo, designed to integrate seamlessly with existing patterns and conventions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Usage Examples](#usage-examples)
4. [Testing Considerations](#testing-considerations)

---

## Architecture Overview

### Three-Tier Feature Flag System

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FEATURE FLAG LAYERS                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │
│  │  ENVIRONMENT    │  │   USER-BASED    │  │  PERCENTAGE-BASED   │   │
│  │     FLAGS       │  │     FLAGS       │  │       FLAGS         │   │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────────┤   │
│  │ • Dev-only      │  │ • Beta opt-in   │  │ • Gradual rollout   │   │
│  │ • Staging-only  │  │ • Role-based    │  │ • A/B testing       │   │
│  │ • Production    │  │ • User segments │  │ • Canary releases   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │
│                                                                      │
│                    ┌───────────────────────┐                         │
│                    │    REDIS CACHE        │                         │
│                    │   (Hot Flag Store)    │                         │
│                    └───────────────────────┘                         │
│                              ▲                                       │
│                              │                                       │
│                    ┌───────────────────────┐                         │
│                    │   POSTGRES DB         │                         │
│                    │  (Persistent Store)   │                         │
│                    └───────────────────────┘                         │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. Feature flags are stored in PostgreSQL as the source of truth
2. Redis caches flag configurations for fast evaluation (TTL: 5 minutes)
3. API evaluates flags based on user context (role, beta opt-in, percentage)
4. Web app receives evaluated flags and stores in Redux (persisted)
5. Components use hooks/wrappers to conditionally render features

---

## File Structure

```
packages/
├── shared/
│   └── models/
│       └── src/
│           ├── feature-flags/
│           │   ├── feature-flag-shared.consts.ts
│           │   ├── feature-flag-shared.consts.spec.ts
│           │   ├── feature-flag-shared.types.ts
│           │   └── index.ts
│           └── index.ts  (add exports)
│
├── api/
│   ├── libs/
│   │   └── feature-flags/
│   │       ├── feature-flag-api.consts.ts
│   │       ├── feature-flag-api.consts.spec.ts
│   │       ├── feature-flag-api.middleware.ts
│   │       ├── feature-flag-api.middleware.spec.ts
│   │       ├── feature-flag-api.postgres-model.ts
│   │       ├── feature-flag-api.postgres-model.spec.ts
│   │       ├── feature-flag-api.service.ts
│   │       ├── feature-flag-api.service.spec.ts
│   │       ├── feature-flag-api.socket.ts
│   │       ├── feature-flag-api.socket.spec.ts
│   │       ├── feature-flag-api.types.ts
│   │       └── index.ts
│   └── api-app/
│       └── src/
│           └── feature-flags/
│               ├── feature-flag-api.controller.ts
│               ├── feature-flag-api.controller.spec.ts
│               ├── feature-flag-api.routes.ts
│               └── feature-flag-api.routes.spec.ts
│
└── web/
    └── web-app/
        └── src/
            └── app/
                └── feature-flags/
                    ├── feature-flag-web.api.ts
                    ├── feature-flag-web.api.spec.ts
                    ├── feature-flag-web.component.tsx
                    ├── feature-flag-web.component.spec.tsx
                    ├── feature-flag-web.consts.ts
                    ├── feature-flag-web.consts.spec.ts
                    ├── feature-flag-web.hooks.ts
                    ├── feature-flag-web.hooks.spec.ts
                    ├── feature-flag-web.reducer.ts
                    ├── feature-flag-web.reducer.spec.ts
                    ├── feature-flag-web.selectors.ts
                    ├── feature-flag-web.selectors.spec.ts
                    └── feature-flag-web.types.ts
```


## Usage Examples

### 1. Protecting API Routes

```typescript
// Example: Protect a blog endpoint
import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { requireFeatureFlag } from '@dx3/api-libs/feature-flags'
import { FEATURE_FLAG_NAMES } from '@dx3/models-shared'

import { BlogController } from './blog-api.controller'

export class BlogRoutes {
  static configure() {
    const router = Router()

    router.all('/*', [ensureLoggedIn])

    router.get(
      '/',
      requireFeatureFlag(FEATURE_FLAG_NAMES.BLOG),
      BlogController.getAllPosts,
    )

    return router
  }
}

export type BlogRoutesType = typeof BlogRoutes.prototype
```

### 2. Conditional Component Rendering

```tsx
// Example: Conditionally render a blog section
import { FEATURE_FLAG_NAMES } from '@dx3/models-shared'

import { FeatureFlag } from '../feature-flags/feature-flag-web.component'
import { useFeatureFlag } from '../feature-flags/feature-flag-web.hooks'

export const Dashboard: React.FC = () => {
  // Method 1: Using the component wrapper
  return (
    <div>
      <h1>Dashboard</h1>

      <FeatureFlag flagName={FEATURE_FLAG_NAMES.BLOG} showPlaceholder>
        <BlogSection />
      </FeatureFlag>

      <FeatureFlag flagName={FEATURE_FLAG_NAMES.FAQ_APP} fallback={<LegacyFAQ />}>
        <NewFAQComponent />
      </FeatureFlag>
    </div>
  )
}

// Method 2: Using the hook directly
export const MarketingPage: React.FC = () => {
  const showFaqMarketing = useFeatureFlag(FEATURE_FLAG_NAMES.FAQ_MARKETING)

  return (
    <div>
      <h1>Marketing</h1>
      {showFaqMarketing && <MarketingFAQ />}
    </div>
  )
}
```

### 3. Router-Level Gating

```tsx
// Example: Gate entire routes
import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router'

import { FEATURE_FLAG_NAMES } from '@dx3/models-shared'

import { FeatureFlag } from '../feature-flags/feature-flag-web.component'

const LazyBlogComponent = lazy(async () => ({
  default: (await import('../blog/blog-web.component')).BlogMain,
}))

export class PrivateWebRouterConfig {
  public static getRouter() {
    const config: RouteObject[] = [
      {
        element: (
          <FeatureFlag flagName={FEATURE_FLAG_NAMES.BLOG} showPlaceholder>
            <Suspense fallback={<Loading />}>
              <LazyBlogComponent />
            </Suspense>
          </FeatureFlag>
        ),
        path: '/blog',
      },
    ]

    return config
  }
}
```

---

## Testing Considerations

### Mocking Feature Flags in Tests

```typescript
// packages/web/web-app/src/app/feature-flags/__mocks__/index.ts

import { FEATURE_FLAG_NAMES } from '@dx3/models-shared'

export const mockFeatureFlags: Record<string, boolean> = {
  [FEATURE_FLAG_NAMES.BLOG]: true,
  [FEATURE_FLAG_NAMES.FAQ_APP]: true,
  [FEATURE_FLAG_NAMES.FAQ_MARKETING]: false,
}

export const useFeatureFlag = jest.fn((flagName: string) => mockFeatureFlags[flagName] ?? false)

export const useFeatureFlags = jest.fn(() => ({
  isEnabled: (flagName: string) => mockFeatureFlags[flagName] ?? false,
  isLoading: false,
}))
```

### Test Store Setup

```typescript
// In test setup, provide initial feature flags state
const testStore = configureStore({
  preloadedState: {
    featureFlags: {
      flags: {
        [FEATURE_FLAG_NAMES.BLOG]: true,
        [FEATURE_FLAG_NAMES.FAQ_APP]: false,
        [FEATURE_FLAG_NAMES.FAQ_MARKETING]: true,
      },
      isLoading: false,
      lastFetched: Date.now(),
    },
  },
  reducer: combinedPersistReducers,
})
```

---

## Implementation Checklist

### Phase 6: Testing
- [ ] Write unit tests for all new modules
- [ ] Add mock utilities for testing

---

## Future Enhancements

1. **Flag Scheduling** - Add start/end dates for automatic flag activation
2. **Environment Overrides** - Allow per-environment flag configurations
3. **Analytics Integration** - Track flag evaluations for A/B testing analysis
4. **User Segment Targeting** - More granular targeting rules (see documentation below)
5. **Flag Dependencies** - Allow flags to depend on other flags
6. **Audit Logging** - Track who changed flags and when

---

## Appendix A: Percentage-Based Rollout Explained

The percentage-based evaluation uses **consistent hashing** to ensure stable user assignment:

```typescript
private evaluatePercentage(percentage: number, userId?: string): boolean {
  if (!userId) return false
  const hash = this.hashUserId(userId)
  return hash % 100 < percentage
}

private hashUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
```

**How it works:**
1. Each user's UUID is hashed to a deterministic number
2. The hash is reduced to a value between 0-99 using modulo
3. If the user's hash value is less than the percentage, they get the feature

**Example:** With `percentage: 25`:
- User A (hash = 12) → 12 < 25 → ✅ Feature enabled
- User B (hash = 67) → 67 < 25 → ❌ Feature disabled
- User C (hash = 24) → 24 < 25 → ✅ Feature enabled

**Key benefits:**
- **Consistent**: Same user always gets same result (no flipping)
- **Gradual**: Increase percentage to roll out to more users
- **Predictable**: User A stays in the rollout as percentage increases

---

## Appendix B: User Segment Targeting (Future Enhancement)

For more granular targeting beyond roles, implement a segment system:

### Database Schema Addition

```typescript
// Additional columns for FeatureFlagModel
@Column(DataType.JSONB)
segmentRules: SegmentRulesType | null

// Segment rules type
type SegmentRulesType = {
  rules: SegmentRule[]
  operator: 'AND' | 'OR'
}

type SegmentRule = {
  field: 'createdAt' | 'hasVerifiedEmail' | 'hasVerifiedPhone' | 'optInBeta' | 'roles'
  operator: 'contains' | 'equals' | 'greaterThan' | 'lessThan' | 'notEquals'
  value: string | number | boolean | string[]
}
```

### Example Segment Rules

```json
{
  "operator": "AND",
  "rules": [
    { "field": "hasVerifiedEmail", "operator": "equals", "value": true },
    { "field": "createdAt", "operator": "greaterThan", "value": "2025-01-01" },
    { "field": "roles", "operator": "contains", "value": "BETA_TESTER" }
  ]
}
```

### Evaluation Logic

```typescript
private static evaluateSegment(
  rules: SegmentRulesType,
  user: UserSessionType,
): boolean {
  const results = rules.rules.map((rule) => this.evaluateRule(rule, user))

  return rules.operator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean)
}

private static evaluateRule(rule: SegmentRule, user: UserSessionType): boolean {
  const userValue = user[rule.field as keyof UserSessionType]

  switch (rule.operator) {
    case 'equals':
      return userValue === rule.value
    case 'notEquals':
      return userValue !== rule.value
    case 'contains':
      return Array.isArray(userValue) && userValue.includes(rule.value as string)
    case 'greaterThan':
      return userValue > rule.value
    case 'lessThan':
      return userValue < rule.value
    default:
      return false
  }
}
```

This allows targeting users like:
- Users who signed up after a certain date
- Users with verified emails AND phones
- Users in specific roles
- Any combination with AND/OR logic

---

*Document Version: 1.4*
*Last Updated: January 13, 2026*
