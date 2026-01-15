# Feature Flag Implementation Strategy

## Overview

This document outlines the feature flag implementation strategy for the DX3 monorepo, designed to integrate seamlessly with existing patterns and conventions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Error Codes](#error-codes)
4. [Shared Package Implementation](#shared-package-implementation)
5. [API Implementation](#api-implementation)
6. [Web Implementation](#web-implementation)
7. [Integration with Redux Store](#integration-with-redux-store)
8. [Real-Time Flag Updates via WebSockets](#real-time-flag-updates-via-websockets)
9. [Admin UI (SUPER_ADMIN Only)](#admin-ui-super_admin-only)
10. [Usage Examples](#usage-examples)
11. [Testing Considerations](#testing-considerations)

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

---

## Error Codes

Add feature flag error codes to `packages/shared/models/src/errors/error-shared.consts.ts`:

```typescript
// packages/shared/models/src/errors/error-shared.consts.ts

// Add to ERROR_CODES (700-799 range for Feature Flags)
export const ERROR_CODES = {
  // ... existing codes ...

  // Feature Flags (700-799)
  FEATURE_FLAG_DISABLED: '700',
  FEATURE_FLAG_EVALUATION_ERROR: '701',
  FEATURE_FLAG_NOT_FOUND: '702',
  FEATURE_FLAG_CREATE_FAILED: '703',
  FEATURE_FLAG_UPDATE_FAILED: '704',

  // ... existing codes ...
} as const

// Add to ERROR_CODE_TO_I18N_KEY mapping
export const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  // ... existing mappings ...

  [ERROR_CODES.FEATURE_FLAG_CREATE_FAILED]: 'FEATURE_FLAG_CREATE_FAILED',
  [ERROR_CODES.FEATURE_FLAG_DISABLED]: 'FEATURE_FLAG_DISABLED',
  [ERROR_CODES.FEATURE_FLAG_EVALUATION_ERROR]: 'FEATURE_FLAG_EVALUATION_ERROR',
  [ERROR_CODES.FEATURE_FLAG_NOT_FOUND]: 'FEATURE_FLAG_NOT_FOUND',
  [ERROR_CODES.FEATURE_FLAG_UPDATE_FAILED]: 'FEATURE_FLAG_UPDATE_FAILED',

  // ... existing mappings ...
}
```

---

## Shared Package Implementation

### Constants

```typescript
// packages/shared/models/src/feature-flags/feature-flag-shared.consts.ts

/**
 * Feature flag names - centralized enumeration of all feature flags
 * Add new flags here as they are created
 */
export const FEATURE_FLAG_NAMES = {
  BLOG: 'BLOG',
  FAQ_APP: 'FAQ_APP',
  FAQ_MARKETING: 'FAQ_MARKETING',
} as const

export const FEATURE_FLAG_NAMES_ARRAY = Object.values(FEATURE_FLAG_NAMES)

/**
 * Feature flag status - determines if flag is active, disabled, or in rollout
 */
export const FEATURE_FLAG_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  ROLLOUT: 'ROLLOUT',
} as const

export const FEATURE_FLAG_STATUS_ARRAY = Object.values(FEATURE_FLAG_STATUS)

/**
 * Feature flag target - determines which users see the feature
 */
export const FEATURE_FLAG_TARGET = {
  ADMIN: 'ADMIN',
  ALL: 'ALL',
  BETA_USERS: 'BETA_USERS',
  PERCENTAGE: 'PERCENTAGE',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export const FEATURE_FLAG_TARGET_ARRAY = Object.values(FEATURE_FLAG_TARGET)
```

### Types

```typescript
// packages/shared/models/src/feature-flags/feature-flag-shared.types.ts

import type {
  FEATURE_FLAG_NAMES,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_TARGET,
} from './feature-flag-shared.consts'

export type FeatureFlagNameType = keyof typeof FEATURE_FLAG_NAMES

export type FeatureFlagStatusType = keyof typeof FEATURE_FLAG_STATUS

export type FeatureFlagTargetType = keyof typeof FEATURE_FLAG_TARGET

export type FeatureFlagType = {
  createdAt: Date
  description: string
  id: string
  name: FeatureFlagNameType
  percentage: number | null
  status: FeatureFlagStatusType
  target: FeatureFlagTargetType
  updatedAt: Date
}

export type FeatureFlagEvaluatedType = {
  enabled: boolean
  name: FeatureFlagNameType
}

export type FeatureFlagsResponseType = {
  flags: FeatureFlagEvaluatedType[]
}

export type FeatureFlagsStateType = {
  flags: Record<string, boolean>
  isLoading: boolean
  lastFetched: number | null
}

export type GetFeatureFlagsListQueryType = {
  filterValue?: string
  limit?: number | string
  offset?: number | string
  orderBy?: string
  sortDir?: string
}

export type GetFeatureFlagsListResponseType = {
  count: number
  flags: FeatureFlagType[]
}
```

### Barrel Export

```typescript
// packages/shared/models/src/feature-flags/index.ts

export {
  FEATURE_FLAG_NAMES,
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
} from './feature-flag-shared.consts'

export type {
  FeatureFlagEvaluatedType,
  FeatureFlagNameType,
  FeatureFlagsResponseType,
  FeatureFlagsStateType,
  FeatureFlagSocketClientToServerEvents,
  FeatureFlagSocketServerToClientEvents,
  FeatureFlagStatusType,
  FeatureFlagTargetType,
  FeatureFlagType,
  GetFeatureFlagsListQueryType,
  GetFeatureFlagsListResponseType,
} from './feature-flag-shared.types'
```

### Add to Main Index

```typescript
// packages/shared/models/src/index.ts (additions)

// FEATURE FLAG Types
export {
  FEATURE_FLAG_NAMES,
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
} from './feature-flags/feature-flag-shared.consts'
export type {
  FeatureFlagEvaluatedType,
  FeatureFlagNameType,
  FeatureFlagsResponseType,
  FeatureFlagsStateType,
  FeatureFlagSocketClientToServerEvents,
  FeatureFlagSocketServerToClientEvents,
  FeatureFlagStatusType,
  FeatureFlagTargetType,
  FeatureFlagType,
  GetFeatureFlagsListQueryType,
  GetFeatureFlagsListResponseType,
} from './feature-flags/feature-flag-shared.types'
```

---

## API Implementation

### Constants

```typescript
// packages/api/libs/feature-flags/feature-flag-api.consts.ts

export const FEATURE_FLAG_ENTITY_NAME = 'feature_flags'

export const FEATURE_FLAG_CACHE_PREFIX = 'ff'

export const FEATURE_FLAG_CACHE_TTL = 300 // 5 minutes in seconds

export const FEATURE_FLAG_SORT_FIELDS = [
  'name',
  'description',
  'percentage',
  'status',
  'target',
  'createdAt',
  'updatedAt',
]
```

### Database Model

```typescript
// packages/api/libs/feature-flags/feature-flag-api.postgres-model.ts

import { fn, Op } from 'sequelize'
import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript'

import {
  FEATURE_FLAG_NAMES_ARRAY,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
  type FeatureFlagNameType,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
} from '@dx3/models-shared'

import { FEATURE_FLAG_ENTITY_NAME } from './feature-flag-api.consts'

@Table({
  indexes: [
    {
      fields: ['name'],
      unique: true,
    },
  ],
  modelName: FEATURE_FLAG_ENTITY_NAME,
  underscored: true,
})
export class FeatureFlagModel extends Model<FeatureFlagModel> {
  @PrimaryKey
  @Default(fn('uuid_generate_v4'))
  @AllowNull(false)
  @Column(DataType.UUID)
  id: string

  @Unique
  @AllowNull(false)
  @Column({
    set(name: string): void {
      if (!FEATURE_FLAG_NAMES_ARRAY.includes(name)) {
        throw new Error(
          `Invalid feature flag name: ${name}. ` +
            `Allowed names are: ${FEATURE_FLAG_NAMES_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('name', name)
    },
    type: DataType.STRING,
  })
  name: FeatureFlagNameType

  @AllowNull(true)
  @Column(DataType.STRING(512))
  description: string

  @Default(FEATURE_FLAG_STATUS.DISABLED)
  @AllowNull(false)
  @Column({
    set(status: string): void {
      if (!FEATURE_FLAG_STATUS_ARRAY.includes(status)) {
        throw new Error(
          `Invalid feature flag status: ${status}. ` +
            `Allowed statuses are: ${FEATURE_FLAG_STATUS_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('status', status)
    },
    type: DataType.STRING,
  })
  status: FeatureFlagStatusType

  @Default(FEATURE_FLAG_TARGET.ALL)
  @AllowNull(false)
  @Column({
    set(target: string): void {
      if (!FEATURE_FLAG_TARGET_ARRAY.includes(target)) {
        throw new Error(
          `Invalid feature flag target: ${target}. ` +
            `Allowed targets are: ${FEATURE_FLAG_TARGET_ARRAY.join(', ')}`,
        )
      }
      this.setDataValue('target', target)
    },
    type: DataType.STRING,
  })
  target: FeatureFlagTargetType

  @AllowNull(true)
  @Column(DataType.INTEGER)
  percentage: number | null

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'created_at', type: DataType.DATE })
  createdAt: Date

  @Default(fn('now'))
  @AllowNull(false)
  @Column({ field: 'updated_at', type: DataType.DATE })
  updatedAt: Date

  static async getAllFlags(): Promise<FeatureFlagModel[]> {
    return await FeatureFlagModel.findAll({
      order: [['name', 'ASC']],
    })
  }

  static async getFlagByName(name: FeatureFlagNameType): Promise<FeatureFlagModel | null> {
    return await FeatureFlagModel.findOne({
      where: { name },
    })
  }

  static async createFlag(
    name: FeatureFlagNameType,
    description: string,
    status: FeatureFlagStatusType = FEATURE_FLAG_STATUS.DISABLED,
    target: FeatureFlagTargetType = FEATURE_FLAG_TARGET.ALL,
    percentage?: number,
  ): Promise<FeatureFlagModel> {
    return await FeatureFlagModel.create({
      description,
      name,
      percentage: percentage ?? null,
      status,
      target,
    })
  }

  static async updateFlag(
    id: string,
    updates: Partial<{
      description: string
      percentage: number | null
      status: FeatureFlagStatusType
      target: FeatureFlagTargetType
    }>,
  ): Promise<[affectedCount: number]> {
    return await FeatureFlagModel.update(
      { ...updates, updatedAt: new Date() },
      { where: { id } },
    )
  }
}

export type FeatureFlagModelType = typeof FeatureFlagModel.prototype
```

### Service Layer

```typescript
// packages/api/libs/feature-flags/feature-flag-api.service.ts

import type { FindOptions } from 'sequelize'
import { Op } from 'sequelize'

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT,
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_TARGET,
  type FeatureFlagEvaluatedType,
  type FeatureFlagNameType,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
  type FeatureFlagType,
  type GetFeatureFlagsListQueryType,
  type GetFeatureFlagsListResponseType,
} from '@dx3/models-shared'
import { parseJson } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { RedisService } from '../redis'
import type { UserSessionType } from '../user/user-api.types'
import {
  FEATURE_FLAG_CACHE_PREFIX,
  FEATURE_FLAG_CACHE_TTL,
  FEATURE_FLAG_SORT_FIELDS,
} from './feature-flag-api.consts'
import { FeatureFlagModel, type FeatureFlagModelType } from './feature-flag-api.postgres-model'

export class FeatureFlagService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private getCacheKey(flagName: string): string {
    return `${FEATURE_FLAG_CACHE_PREFIX}:${flagName}`
  }

  private getSortListOptions(orderBy?: string, sortDir?: string): FindOptions['order'] {
    if (orderBy && FEATURE_FLAG_SORT_FIELDS.includes(orderBy)) {
      return [[orderBy, sortDir || DEFAULT_SORT]]
    }

    return [[FEATURE_FLAG_SORT_FIELDS[0], DEFAULT_SORT]]
  }

  private getLikeFilter(filterValue: string): { [Op.iLike]: string } {
    return {
      [Op.iLike]: `%${filterValue}%`,
    }
  }

  private getListSearchQuery(filterValue?: string) {
    if (filterValue) {
      const likeFilter = this.getLikeFilter(filterValue)

      return {
        where: {
          [Op.or]: {
            description: likeFilter,
            name: likeFilter,
          },
        },
      }
    }

    return {}
  }

  async createFlag(
    name: FeatureFlagNameType,
    description: string,
    status: FeatureFlagStatusType = FEATURE_FLAG_STATUS.DISABLED,
    target: FeatureFlagTargetType = FEATURE_FLAG_TARGET.ALL,
    percentage?: number,
  ): Promise<{ flag: FeatureFlagType }> {
    const flag = await FeatureFlagModel.createFlag(name, description, status, target, percentage)
    await this.invalidateCache(name)
    return { flag: flag.toJSON() as FeatureFlagType }
  }

  async evaluateFlag(
    flagName: FeatureFlagNameType,
    user: UserSessionType | null,
  ): Promise<boolean> {
    try {
      // Check Redis cache first
      const cached = await RedisService.instance.getCacheItemSimple(
        this.getCacheKey(flagName),
      )

      let flag: FeatureFlagType | null = null

      if (cached) {
        flag = parseJson<FeatureFlagType>(cached)
      } else {
        const dbFlag = await FeatureFlagModel.getFlagByName(flagName)
        if (dbFlag) {
          flag = dbFlag.toJSON() as FeatureFlagType
          await RedisService.instance.setCacheItemWithExpiration(
            this.getCacheKey(flagName),
            JSON.stringify(flag),
            { time: FEATURE_FLAG_CACHE_TTL, token: 'EX' },
          )
        }
      }

      if (!flag || flag.status === FEATURE_FLAG_STATUS.DISABLED) {
        return false
      }

      if (flag.status === FEATURE_FLAG_STATUS.ACTIVE) {
        return this.evaluateTarget(flag, user)
      }

      if (flag.status === FEATURE_FLAG_STATUS.ROLLOUT && flag.percentage) {
        return this.evaluatePercentage(flag.percentage, user?.id)
      }

      return false
    } catch (error) {
      this.logger.logError(`Error evaluating feature flag: ${flagName}`, error as Error)
      return false
    }
  }

  private evaluateTarget(
    flag: FeatureFlagType,
    user: UserSessionType | null,
  ): boolean {
    switch (flag.target) {
      case FEATURE_FLAG_TARGET.ALL:
        return true
      case FEATURE_FLAG_TARGET.ADMIN:
        return user?.isAdmin || user?.isSuperAdmin || false
      case FEATURE_FLAG_TARGET.SUPER_ADMIN:
        return user?.isSuperAdmin || false
      case FEATURE_FLAG_TARGET.BETA_USERS:
        return user?.optInBeta || false
      case FEATURE_FLAG_TARGET.PERCENTAGE:
        return this.evaluatePercentage(flag.percentage || 0, user?.id)
      default:
        return false
    }
  }

  private evaluatePercentage(percentage: number, userId?: string): boolean {
    if (!userId) return false
    // Consistent hashing based on userId for stable assignment
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

  async evaluateAllFlags(
    user: UserSessionType | null,
  ): Promise<{ flags: FeatureFlagEvaluatedType[] }> {
    const flags = await FeatureFlagModel.getAllFlags()
    const evaluated: FeatureFlagEvaluatedType[] = []

    for (const flag of flags) {
      evaluated.push({
        enabled: await this.evaluateFlag(flag.name, user),
        name: flag.name,
      })
    }

    return { flags: evaluated }
  }

  async getAllFlags(
    query: GetFeatureFlagsListQueryType,
  ): Promise<GetFeatureFlagsListResponseType> {
    const { filterValue, limit, offset, orderBy, sortDir } = query

    const orderArgs = this.getSortListOptions(orderBy, sortDir)
    const search = this.getListSearchQuery(filterValue)

    let result: { rows: FeatureFlagModelType[]; count: number } = { count: 0, rows: [] }

    try {
      result = await FeatureFlagModel.findAndCountAll({
        ...search,
        limit: limit ? Number(limit) : DEFAULT_LIMIT,
        offset: offset ? Number(offset) : DEFAULT_OFFSET,
        order: orderArgs,
      })
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(msg)
    }

    const flags: FeatureFlagType[] = result.rows.map((f) => f.toJSON() as FeatureFlagType)

    return {
      count: result.count,
      flags,
    }
  }

  async updateFlag(
    id: string,
    updates: Partial<{
      description: string
      percentage: number | null
      status: FeatureFlagStatusType
      target: FeatureFlagTargetType
    }>,
  ): Promise<{ updated: boolean }> {
    await FeatureFlagModel.updateFlag(id, updates)
    // Invalidate all caches since we don't know the flag name from id
    await this.invalidateCache()
    return { updated: true }
  }

  async invalidateCache(flagName?: string): Promise<void> {
    if (flagName) {
      await RedisService.instance.deleteCacheItem(this.getCacheKey(flagName))
    } else {
      const keys = await RedisService.instance.getKeys(FEATURE_FLAG_CACHE_PREFIX)
      for (const key of keys || []) {
        await RedisService.instance.deleteCacheItem(key)
      }
    }
  }
}

export type FeatureFlagServiceType = typeof FeatureFlagService.prototype
```

### Middleware

```typescript
// packages/api/libs/feature-flags/feature-flag-api.middleware.ts

import type { NextFunction, Request, Response } from 'express'

import { ERROR_CODES, type FeatureFlagNameType } from '@dx3/models-shared'

import { sendForbiddenWithCode } from '../http-response/http-responses'
import { ApiLoggingClass } from '../logger'
import { FeatureFlagService } from './feature-flag-api.service'

export function requireFeatureFlag(flagName: FeatureFlagNameType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user || null
      const service = new FeatureFlagService()
      const isEnabled = await service.evaluateFlag(flagName, user)

      if (!isEnabled) {
        sendForbiddenWithCode(
          req,
          res,
          ERROR_CODES.FEATURE_FLAG_DISABLED,
          `Feature "${flagName}" is not available.`,
        )
        return
      }

      next()
    } catch (error) {
      ApiLoggingClass.instance.logError(
        `Feature flag middleware error: ${flagName}`,
        error as Error,
      )
      sendForbiddenWithCode(
        req,
        res,
        ERROR_CODES.FEATURE_FLAG_EVALUATION_ERROR,
        'Feature unavailable.',
      )
    }
  }
}
```

### API Types

```typescript
// packages/api/libs/feature-flags/feature-flag-api.types.ts

import type {
  FeatureFlagStatusType,
  FeatureFlagTargetType,
} from '@dx3/models-shared'

export type CreateFeatureFlagPayloadType = {
  description: string
  name: string
  percentage?: number
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

export type UpdateFeatureFlagPayloadType = {
  description?: string
  id: string
  percentage?: number | null
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}
```

### Barrel Export

```typescript
// packages/api/libs/feature-flags/index.ts

export {
  FEATURE_FLAG_CACHE_PREFIX,
  FEATURE_FLAG_CACHE_TTL,
  FEATURE_FLAG_ENTITY_NAME,
  FEATURE_FLAG_SORT_FIELDS,
} from './feature-flag-api.consts'
export { requireFeatureFlag } from './feature-flag-api.middleware'
export {
  FeatureFlagModel,
  type FeatureFlagModelType,
} from './feature-flag-api.postgres-model'
export {
  FeatureFlagService,
  type FeatureFlagServiceType,
} from './feature-flag-api.service'
export type {
  CreateFeatureFlagPayloadType,
  UpdateFeatureFlagPayloadType,
} from './feature-flag-api.types'
```

### Controller

```typescript
// packages/api/api-app/src/feature-flags/feature-flag-api.controller.ts

import type { Request, Response } from 'express'

import {
  FeatureFlagService,
  type CreateFeatureFlagPayloadType,
  type UpdateFeatureFlagPayloadType,
} from '@dx3/api-libs/feature-flags'
import { sendBadRequest, sendCreated, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import type {
  FeatureFlagNameType,
  FeatureFlagStatusType,
  FeatureFlagTargetType,
  GetFeatureFlagsListQueryType,
} from '@dx3/models-shared'

export const FeatureFlagController = {
  createFlag: async (req: Request, res: Response) => {
    logRequest({ req, type: 'createFeatureFlag' })
    try {
      const service = new FeatureFlagService()
      const { description, name, percentage, status, target } =
        req.body as CreateFeatureFlagPayloadType

      const result = await service.createFlag(
        name as FeatureFlagNameType,
        description,
        status as FeatureFlagStatusType,
        target as FeatureFlagTargetType,
        percentage,
      )

      return sendCreated(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed createFeatureFlag' })
      sendBadRequest(req, res, err.message)
    }
  },

  getAdminFlags: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getAdminFeatureFlags' })
    try {
      const service = new FeatureFlagService()
      const result = await service.getAllFlags(req.query as GetFeatureFlagsListQueryType)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getAdminFeatureFlags' })
      sendBadRequest(req, res, err.message)
    }
  },

  getAllFlags: async (req: Request, res: Response) => {
    logRequest({ req, type: 'getFeatureFlags' })
    try {
      const user = req.user || null
      const service = new FeatureFlagService()
      const result = await service.evaluateAllFlags(user)
      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getFeatureFlags' })
      sendBadRequest(req, res, err.message)
    }
  },

  updateFlag: async (req: Request, res: Response) => {
    logRequest({ req, type: 'updateFeatureFlag' })
    try {
      const service = new FeatureFlagService()
      const { description, id, percentage, status, target } =
        req.body as UpdateFeatureFlagPayloadType

      const result = await service.updateFlag(id, {
        description,
        percentage,
        status,
        target,
      })

      return sendOK(req, res, result)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed updateFeatureFlag' })
      sendBadRequest(req, res, err.message)
    }
  },
}

export type FeatureFlagControllerType = typeof FeatureFlagController
```

### Routes

```typescript
// packages/api/api-app/src/feature-flags/feature-flag-api.routes.ts

import { Router } from 'express'

import { ensureLoggedIn } from '@dx3/api-libs/auth/middleware/ensure-logged-in.middleware'
import { hasSuperAdminRole } from '@dx3/api-libs/auth/middleware/ensure-role.middleware'

import { FeatureFlagController } from './feature-flag-api.controller'

export class FeatureFlagRoutes {
  static configure() {
    const router = Router()

    // All routes require authentication
    router.all('/*', [ensureLoggedIn])

    // Public endpoint - returns evaluated flags for current user
    router.get('/', FeatureFlagController.getAllFlags)

    // Admin endpoints - requires SUPER_ADMIN role
    router.get('/admin', hasSuperAdminRole, FeatureFlagController.getAdminFlags)
    router.post('/admin', hasSuperAdminRole, FeatureFlagController.createFlag)
    router.put('/admin', hasSuperAdminRole, FeatureFlagController.updateFlag)

    return router
  }
}

export type FeatureFlagRoutesType = typeof FeatureFlagRoutes.prototype
```

### Add to V1 Routes

```typescript
// packages/api/api-app/src/routes/v1.routes.ts (addition)

import { FeatureFlagRoutes } from '../feature-flags/feature-flag-api.routes'

// In RoutesV1.configure():
router.use('/feature-flag', FeatureFlagRoutes.configure())
```

### Register Model with Sequelize

```typescript
// packages/api/libs/pg/postgres-database-api.service.ts (addition)

import { FeatureFlagModel } from '../feature-flags/feature-flag-api.postgres-model'

// Add to the models array in initializeModels():
const models = [
  // ... existing models ...
  FeatureFlagModel,
]
```

---

## Web Implementation

### Constants

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.consts.ts

export const FEATURE_FLAGS_ENTITY_NAME = 'featureFlags'

export const FEATURE_FLAGS_STALE_TIME = 300000 // 5 minutes in milliseconds
```

### Types

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.types.ts

import type { FeatureFlagsStateType } from '@dx3/models-shared'

// Re-export shared type for convenience
export type { FeatureFlagsStateType }
```

### Redux Reducer

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.reducer.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import {
  APP_PREFIX,
  type FeatureFlagEvaluatedType,
  type FeatureFlagsStateType,
} from '@dx3/models-shared'

import { FEATURE_FLAGS_ENTITY_NAME } from './feature-flag-web.consts'

export const featureFlagsInitialState: FeatureFlagsStateType = {
  flags: {},
  isLoading: false,
  lastFetched: null,
}

export const featureFlagsPersistConfig: PersistConfig<FeatureFlagsStateType> = {
  blacklist: ['isLoading'],
  key: `${APP_PREFIX}:${FEATURE_FLAGS_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const featureFlagsSlice = createSlice({
  initialState: featureFlagsInitialState,
  name: FEATURE_FLAGS_ENTITY_NAME,
  reducers: {
    featureFlagsFetched(state, action: PayloadAction<FeatureFlagEvaluatedType[]>) {
      state.flags = action.payload.reduce(
        (acc, flag) => {
          acc[flag.name] = flag.enabled
          return acc
        },
        {} as Record<string, boolean>,
      )
      state.lastFetched = Date.now()
      state.isLoading = false
    },
    featureFlagsInvalidated(state, _action: PayloadAction<undefined>) {
      state.flags = {}
      state.lastFetched = null
      state.isLoading = false
    },
    featureFlagsLoading(state, _action: PayloadAction<undefined>) {
      state.isLoading = true
    },
  },
})

export const featureFlagsActions = featureFlagsSlice.actions

export const featureFlagsReducer = featureFlagsSlice.reducer
```

### Selectors

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.selectors.ts

import { createSelector } from 'reselect'

import type { FeatureFlagNameType, FeatureFlagsStateType } from '@dx3/models-shared'

import type { RootState } from '../store/store-web.redux'
import { FEATURE_FLAGS_STALE_TIME } from './feature-flag-web.consts'

const selectFeatureFlagsState = (state: RootState): FeatureFlagsStateType =>
  state.featureFlags

export const selectFeatureFlags = (state: RootState): Record<string, boolean> =>
  state.featureFlags.flags

export const selectFeatureFlagsLoading = (state: RootState): boolean =>
  state.featureFlags.isLoading

export const selectFeatureFlagsLastFetched = (state: RootState): number | null =>
  state.featureFlags.lastFetched

export const selectFeatureFlag = (
  state: RootState,
  flagName: FeatureFlagNameType,
): boolean => state.featureFlags.flags[flagName] ?? false

export const selectFeatureFlagsStale = createSelector(
  [selectFeatureFlagsLastFetched],
  (lastFetched): boolean => {
    if (!lastFetched) return true
    return Date.now() - lastFetched > FEATURE_FLAGS_STALE_TIME
  },
)
```

### Hooks

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.hooks.ts

import { useCallback, useMemo } from 'react'

import type { FeatureFlagNameType } from '@dx3/models-shared'

import { useAppSelector } from '../store/store-web-redux.hooks'
import {
  selectFeatureFlag,
  selectFeatureFlags,
  selectFeatureFlagsLoading,
} from './feature-flag-web.selectors'

/**
 * Hook to check if a specific feature flag is enabled
 * @param flagName - The name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(flagName: FeatureFlagNameType): boolean {
  return useAppSelector((state) => selectFeatureFlag(state, flagName))
}

/**
 * Hook to access all feature flags with utility methods
 * @returns Object with isEnabled function and loading state
 */
export function useFeatureFlags(): {
  isEnabled: (flagName: FeatureFlagNameType) => boolean
  isLoading: boolean
} {
  const flags = useAppSelector(selectFeatureFlags)
  const isLoading = useAppSelector(selectFeatureFlagsLoading)

  const isEnabled = useCallback(
    (flagName: FeatureFlagNameType) => flags[flagName] ?? false,
    [flags],
  )

  return useMemo(() => ({ isEnabled, isLoading }), [isEnabled, isLoading])
}
```

### Component Wrapper

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.component.tsx

import type * as React from 'react'

import type { FeatureFlagNameType } from '@dx3/models-shared'
import { BetaFeatureComponent } from '@dx3/web-libs/ui/global/beta-feature-placeholder.component'

import { useFeatureFlag } from './feature-flag-web.hooks'

type FeatureFlagPropTypes = {
  children: React.ReactNode
  fallback?: React.ReactNode
  flagName: FeatureFlagNameType
  showPlaceholder?: boolean
}

/**
 * Feature flag wrapper component for conditional rendering
 * @param flagName - The feature flag to check
 * @param children - Content to render when flag is enabled
 * @param fallback - Optional content to render when flag is disabled
 * @param showPlaceholder - Show "Coming Soon" placeholder when disabled
 */
export const FeatureFlag: React.FC<FeatureFlagPropTypes> = ({
  children,
  fallback = null,
  flagName,
  showPlaceholder = false,
}) => {
  const isEnabled = useFeatureFlag(flagName)

  if (isEnabled) {
    return <>{children}</>
  }

  if (showPlaceholder) {
    return <BetaFeatureComponent message={`Feature "${flagName}" coming soon!`} />
  }

  return <>{fallback}</>
}
```

### API Integration

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.api.ts

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'
import type { FeatureFlagsResponseType } from '@dx3/models-shared'

export const featureFlagsApi = apiWeb.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlagsResponseType, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/feature-flag',
      }),
    }),
  }),
})

export const { useGetFeatureFlagsQuery } = featureFlagsApi
```

---

## Integration with Redux Store

Update `store-web.redux.ts`:

```typescript
// packages/web/web-app/src/app/store/store-web.redux.ts

// Add imports
import type { FeatureFlagsStateType } from '@dx3/models-shared'

import { featureFlagAdminReducer } from '../feature-flags/admin/feature-flag-admin-web.reducer'
import type { FeatureFlagAdminStateType } from '../feature-flags/admin/feature-flag-admin-web.types'
import {
  featureFlagsPersistConfig,
  featureFlagsReducer,
} from '../feature-flags/feature-flag-web.reducer'

// Add to combinedPersistReducers (alphabetically ordered)
const combinedPersistReducers = combineReducers({
  [apiWeb.reducerPath]: apiWeb.reducer,
  auth: persistReducer<AuthStateType, any>(authPersistConfig, authReducer) as typeof authReducer,
  dashboard: dashboardReducer,
  featureFlags: persistReducer<FeatureFlagsStateType, any>(
    featureFlagsPersistConfig,
    featureFlagsReducer,
  ) as typeof featureFlagsReducer,
  featureFlagsAdmin: featureFlagAdminReducer, // No persistence needed for admin state
  home: homeReducer,
  i18n: persistReducer<I18nStateType, any>(i18nPersistConfig, i18nReducer) as typeof i18nReducer,
  // ... rest of reducers
})
```

---

## Real-Time Flag Updates via WebSockets

To enable real-time feature flag updates without requiring page refresh or re-login, we can leverage the existing Socket.IO infrastructure.

### Socket Events (Shared Types)

Add the following socket event types to `feature-flag-shared.types.ts` (append after the existing types):

```typescript
// packages/shared/models/src/feature-flags/feature-flag-shared.types.ts (additions)

export type FeatureFlagSocketServerToClientEvents = {
  featureFlagsUpdated: (flags: FeatureFlagEvaluatedType[]) => void
  featureFlagUpdated: (flag: FeatureFlagEvaluatedType) => void
}

export type FeatureFlagSocketClientToServerEvents = {
  subscribeToFeatureFlags: () => void
  unsubscribeFromFeatureFlags: () => void
}
```

### API Socket Handler

```typescript
// packages/api/libs/feature-flags/feature-flag-api.socket.ts

import type { Namespace } from 'socket.io'

import {
  FEATURE_FLAG_SOCKET_NS,
  type FeatureFlagSocketClientToServerEvents,
  type FeatureFlagSocketData,
  type FeatureFlagSocketInterServerEvents,
  type FeatureFlagSocketServerToClientEvents,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  SocketApiConnection,
  type SocketApiConnectionType,
} from '../socket-io-api'

type FeatureFlagNamespaceType = Namespace<
  FeatureFlagSocketClientToServerEvents,
  FeatureFlagSocketServerToClientEvents,
  FeatureFlagSocketInterServerEvents,
  FeatureFlagSocketData
>

const FEATURE_FLAG_UPDATES_ROOM = 'feature-flag-updates'

export class FeatureFlagSocketApiService {
  static #instance: FeatureFlagSocketApiServiceType
  socket: SocketApiConnectionType
  private logger: ApiLoggingClassType
  public ns: FeatureFlagNamespaceType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.socket = SocketApiConnection.instance
    // @ts-expect-error - type is fine
    this.ns = this.socket.io.of(FEATURE_FLAG_SOCKET_NS)
    FeatureFlagSocketApiService.#instance = this
  }

  public static get instance() {
    return FeatureFlagSocketApiService.#instance
  }

  public configureNamespace() {
    // Set up auth middleware
    this.ns.use((socket, next) => {
      const isLoggedIn = ensureLoggedInSocket(socket.handshake)
      if (isLoggedIn) {
        next()
      } else {
        next(new Error('Not logged in'))
      }
    })

    this.ns.on('connection', (socket) => {
      const userId = getUserIdFromHandshake(socket.handshake)
      this.logger.logInfo(`Feature flag socket connected: ${socket.id}, user: ${userId}`)

      if (userId) {
        socket.data.userId = userId
      }

      socket.on('subscribeToFeatureFlags', () => {
        socket.join(FEATURE_FLAG_UPDATES_ROOM)
        this.logger.logInfo(`Socket ${socket.id} subscribed to feature flag updates`)
      })

      socket.on('unsubscribeFromFeatureFlags', () => {
        socket.leave(FEATURE_FLAG_UPDATES_ROOM)
        this.logger.logInfo(`Socket ${socket.id} unsubscribed from feature flag updates`)
      })

      socket.on('disconnect', () => {
        this.logger.logInfo(`Feature flag socket disconnected: ${socket.id}`)
      })
    })
  }

  /**
   * Broadcast that flags have been updated to all subscribed clients
   * Clients will re-fetch their user-specific evaluations
   */
  public broadcastFlagsUpdated(): void {
    try {
      // Send empty array - clients will re-fetch from API for user-specific evaluations
      this.ns.to(FEATURE_FLAG_UPDATES_ROOM).emit('featureFlagsUpdated', [])
      this.logger.logInfo('Broadcasted feature flags update notification')
    } catch (err) {
      this.logger.logError(`Error broadcasting feature flags update: ${(err as Error).message}`)
    }
  }
}

export type FeatureFlagSocketApiServiceType = typeof FeatureFlagSocketApiService.prototype
```

### Web Socket Handler

```typescript
// packages/web/web-app/src/app/feature-flags/feature-flag-web.sockets.ts

import type { Socket } from 'socket.io-client'

import {
  FEATURE_FLAG_SOCKET_NS,
  type FeatureFlagSocketClientToServerEvents,
  type FeatureFlagSocketServerToClientEvents,
} from '@dx3/models-shared'

import { SocketWebConnection } from '../data/socket-io/socket-web.connection'
import { store } from '../store/store-web.redux'
import { featureFlagsActions } from './feature-flag-web.reducer'
import { featureFlagsApi } from './feature-flag-web.api'

export class FeatureFlagWebSockets {
  static #instance: FeatureFlagWebSocketsType
  socket: Socket<
    FeatureFlagSocketServerToClientEvents,
    FeatureFlagSocketClientToServerEvents
  > | null = null

  constructor() {
    void this.setupSocket()
  }

  async setupSocket() {
    this.socket = await SocketWebConnection.createSocket<
      FeatureFlagSocketClientToServerEvents,
      FeatureFlagSocketServerToClientEvents
    >(FEATURE_FLAG_SOCKET_NS)
    FeatureFlagWebSockets.#instance = this

    // Subscribe to feature flag updates
    this.socket.emit('subscribeToFeatureFlags')

    // Listen for flag updates and re-fetch
    // Server broadcasts empty array as notification; client re-fetches for user-specific evaluations
    this.socket.on('featureFlagsUpdated', async () => {
      try {
        const result = await store.dispatch(
          featureFlagsApi.endpoints.getFeatureFlags.initiate(undefined, {
            forceRefetch: true,
          }),
        ).unwrap()

        store.dispatch(featureFlagsActions.featureFlagsFetched(result.flags))
      } catch (error) {
        console.error('Failed to refresh feature flags:', error)
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('unsubscribeFromFeatureFlags')
      this.socket.disconnect()
    }
  }

  public static get instance() {
    return FeatureFlagWebSockets.#instance
  }
}

export type FeatureFlagWebSocketsType = typeof FeatureFlagWebSockets.prototype
```

### Initialize on Login / Cleanup on Logout

```typescript
// packages/web/web-app/src/app/config/bootstrap/login-bootstrap.ts
import { FeatureFlagWebSockets } from '../../feature-flags/feature-flag-web.sockets'

// In connectToSockets() function - after notification sockets
if (!FeatureFlagWebSockets.instance) {
  new FeatureFlagWebSockets()
} else if (
  FeatureFlagWebSockets.instance.socket &&
  !FeatureFlagWebSockets.instance.socket.connected
) {
  FeatureFlagWebSockets.instance.socket.connect()
}

// packages/web/web-app/src/app/auth/auth-web-logout.button.tsx
// On logout - disconnect sockets and clear state
if (FeatureFlagWebSockets.instance) {
  FeatureFlagWebSockets.instance.disconnect()
}
dispatch(featureFlagsActions.featureFlagsInvalidated())
```

### Socket Registration (API)

```typescript
// packages/api/api-app/src/data/sockets/dx-socket.class.ts

import { FeatureFlagSocketApiService } from '@dx3/api-libs/feature-flags/feature-flag-api.socket'

// In DxSocketClass.startSockets() - after NotificationSocketApiService
new FeatureFlagSocketApiService()

if (FeatureFlagSocketApiService.instance) {
  FeatureFlagSocketApiService.instance.configureNamespace()
}
```

### Broadcasting from Controller

```typescript
// packages/api/api-app/src/feature-flags/feature-flag-api.controller.ts

import { FeatureFlagSocketApiService } from '@dx3/api-libs/feature-flags/feature-flag-api.socket'

// After creating or updating a flag:
if (FeatureFlagSocketApiService.instance) {
  FeatureFlagSocketApiService.instance.broadcastFlagsUpdated()
}
```

---

## Admin UI (SUPER_ADMIN Only)

The Admin UI provides SUPER_ADMIN users with the ability to manage feature flags in real-time.

### File Structure

```
packages/web/web-app/src/app/feature-flags/
├── admin/
│   ├── feature-flag-admin-web.api.ts
│   ├── feature-flag-admin-web.consts.ts
│   ├── feature-flag-admin-web-create.dialog.tsx
│   ├── feature-flag-admin-web-edit.dialog.tsx
│   ├── feature-flag-admin-web-list.component.tsx
│   ├── feature-flag-admin-web-list.service.ts
│   ├── feature-flag-admin-web.menu.ts
│   ├── feature-flag-admin-web.reducer.ts
│   ├── feature-flag-admin-web.selectors.ts
│   └── feature-flag-admin-web.types.ts
```

### Admin API Endpoints

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.api.ts

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
  type FeatureFlagType,
  type GetFeatureFlagsListQueryType,
  type GetFeatureFlagsListResponseType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../../data/rtk-query/web.api'

type CreateFlagPayloadType = {
  description: string
  name: string
  percentage?: number
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

type UpdateFlagPayloadType = {
  description?: string
  id: string
  percentage?: number | null
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

const buildFeatureFlagAdminListUrl = (params: GetFeatureFlagsListQueryType): string => {
  const limit = params.limit !== undefined ? params.limit : DEFAULT_LIMIT
  const offset = params.offset !== undefined ? params.offset : DEFAULT_OFFSET

  let url = `/feature-flag/admin?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`

  if (params.orderBy !== undefined && params.sortDir !== undefined) {
    url += `&orderBy=${encodeURIComponent(params.orderBy)}&sortDir=${encodeURIComponent(params.sortDir)}`
  }
  if (params.filterValue !== undefined) {
    url += `&filterValue=${encodeURIComponent(params.filterValue)}`
  }

  return url
}

export const featureFlagAdminApi = apiWeb.injectEndpoints({
  endpoints: (builder) => ({
    createFeatureFlag: builder.mutation<{ flag: FeatureFlagType }, CreateFlagPayloadType>({
      query: (body) => ({
        body,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: '/feature-flag/admin',
      }),
    }),
    getAdminFeatureFlags: builder.query<GetFeatureFlagsListResponseType, GetFeatureFlagsListQueryType>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildFeatureFlagAdminListUrl(params),
      }),
    }),
    updateFeatureFlag: builder.mutation<{ updated: boolean }, UpdateFlagPayloadType>({
      query: (body) => ({
        body,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: '/feature-flag/admin',
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateFeatureFlagMutation,
  useGetAdminFeatureFlagsQuery,
  useLazyGetAdminFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} = featureFlagAdminApi
```

### Admin Constants

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.consts.ts

export const FEATURE_FLAG_ADMIN_ROUTES = {
  LIST: '/sudo/feature-flags',
  MAIN: '/sudo/feature-flags',
}
```

### Admin List Service

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web-list.service.ts

import { blue, green, grey, orange } from '@mui/material/colors'

import {
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_TARGET,
  type FeatureFlagType,
} from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store'

export class FeatureFlagAdminWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  public static FEATURE_FLAG_ADMIN_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'name',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Name',
      width: '20%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'description',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: 'Description',
      width: '30%',
    },
    {
      align: 'center',
      componentType: 'icon',
      fieldName: 'status',
      fieldType: 'string',
      headerAlign: 'center',
      sortable: true,
      title: 'Status',
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'target',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Target',
      width: '15%',
    },
    {
      align: 'center',
      componentType: 'text',
      fieldName: 'percentage',
      fieldType: 'number',
      headerAlign: 'center',
      sortable: true,
      title: '%',
      width: '10%',
    },
    {
      align: 'left',
      componentType: 'none',
      fieldName: '',
      fieldType: null,
      headerAlign: 'center',
      sortable: false,
      title: '',
      width: '10%',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of FeatureFlagAdminWebListService.FEATURE_FLAG_ADMIN_LIST_META) {
      data.push({
        align: meta.headerAlign,
        fieldName: meta.fieldName,
        sortable: meta.sortable,
        title: meta.title,
        width: meta.width,
      })
    }

    return data
  }

  private getRowData(flag: FeatureFlagType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: flag.id,
      testingKey: `feature-flag-row-${flag.name}`,
    }

    for (const meta of FeatureFlagAdminWebListService.FEATURE_FLAG_ADMIN_LIST_META) {
      let cellData: unknown
      let icon: IconNames | undefined
      let color: string | undefined

      if (meta.fieldName === 'status') {
        cellData = flag.status
        icon = IconNames.CHECK
        switch (flag.status) {
          case FEATURE_FLAG_STATUS.ACTIVE:
            color = green[600]
            break
          case FEATURE_FLAG_STATUS.ROLLOUT:
            color = orange[500]
            break
          case FEATURE_FLAG_STATUS.DISABLED:
            color = grey[400]
            icon = IconNames.CLOSE
            break
        }
      }

      if (meta.fieldName === 'target') {
        switch (flag.target) {
          case FEATURE_FLAG_TARGET.ALL:
            cellData = 'All Users'
            break
          case FEATURE_FLAG_TARGET.ADMIN:
            cellData = 'Admins'
            break
          case FEATURE_FLAG_TARGET.SUPER_ADMIN:
            cellData = 'Super Admins'
            break
          case FEATURE_FLAG_TARGET.BETA_USERS:
            cellData = 'Beta Users'
            break
          case FEATURE_FLAG_TARGET.PERCENTAGE:
            cellData = `${flag.percentage}% Rollout`
            break
          default:
            cellData = flag.target
        }
      }

      if (meta.fieldName === 'percentage') {
        cellData = flag.percentage !== null ? `${flag.percentage}%` : '-'
      }

      if (cellData === undefined) {
        cellData = flag[meta.fieldName as keyof FeatureFlagType]
      }

      row.columns.push({
        align: meta.align,
        color,
        componentType: meta.componentType,
        data: cellData,
        dataType: meta.fieldType,
        icon,
      })
    }

    return row
  }

  public getRows(flags: FeatureFlagType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const flag of flags) {
      const data = this.getRowData(flag)
      rows.push(data)
    }

    return rows
  }
}
```

### Admin Selectors

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.selectors.ts

import { createSelector } from 'reselect'

import type { FeatureFlagType } from '@dx3/models-shared'

import type { RootState } from '../../store/store-web.redux'
import { FeatureFlagAdminWebListService } from './feature-flag-admin-web-list.service'

const getAdminFlags = (state: RootState): FeatureFlagType[] =>
  state.featureFlagsAdmin?.flags || []

export const selectAdminFlagsFormatted = createSelector([getAdminFlags], (flags) => {
  return [...flags].sort((a, b) => a.name.localeCompare(b.name))
})

export const selectAdminFlagsListData = createSelector([selectAdminFlagsFormatted], (flags) => {
  const service = new FeatureFlagAdminWebListService()
  return service.getRows(flags)
})
```

### Admin Reducer

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.reducer.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { FeatureFlagType } from '@dx3/models-shared'

import type { FeatureFlagAdminStateType } from './feature-flag-admin-web.types'

export const featureFlagAdminInitialState: FeatureFlagAdminStateType = {
  filterValue: '',
  flags: [],
  flagsCount: 0,
  lastRoute: null,
  limit: 10,
  offset: 0,
  orderBy: 'name',
  selectedFlag: null,
  sortDir: 'ASC',
}

const featureFlagAdminSlice = createSlice({
  initialState: featureFlagAdminInitialState,
  name: 'featureFlagsAdmin',
  reducers: {
    filterValueSet(state, action: PayloadAction<string>) {
      state.filterValue = action.payload
    },
    flagsCountSet(state, action: PayloadAction<number>) {
      state.flagsCount = action.payload
    },
    flagsListSet(state, action: PayloadAction<FeatureFlagType[]>) {
      state.flags = action.payload
    },
    lastRouteSet(state, action: PayloadAction<string>) {
      state.lastRoute = action.payload
    },
    limitSet(state, action: PayloadAction<number>) {
      state.limit = action.payload
    },
    offsetSet(state, action: PayloadAction<number>) {
      state.offset = action.payload
    },
    orderBySet(state, action: PayloadAction<string>) {
      state.orderBy = action.payload
    },
    selectedFlagSet(state, action: PayloadAction<FeatureFlagType | null>) {
      state.selectedFlag = action.payload
    },
    sortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortDir = action.payload
    },
  },
})

export const featureFlagAdminActions = featureFlagAdminSlice.actions

export const featureFlagAdminReducer = featureFlagAdminSlice.reducer
```

### Admin Types

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.types.ts

import type { FeatureFlagType } from '@dx3/models-shared'

export type FeatureFlagAdminStateType = {
  filterValue: string
  flags: FeatureFlagType[]
  flagsCount: number
  lastRoute: string | null
  limit: number
  offset: number
  orderBy: string
  selectedFlag: FeatureFlagType | null
  sortDir: 'ASC' | 'DESC'
}
```

### Admin List Component

```tsx
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web-list.component.tsx

import { Button, Grid, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'

import type { FeatureFlagType, GetFeatureFlagsListQueryType } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectIsMobileWidth } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useLazyGetAdminFeatureFlagsQuery } from './feature-flag-admin-web.api'
import { featureFlagAdminActions } from './feature-flag-admin-web.reducer'
import {
  selectAdminFlagsFormatted,
  selectAdminFlagsListData,
} from './feature-flag-admin-web.selectors'
import { FeatureFlagAdminWebListService } from './feature-flag-admin-web-list.service'
import { FeatureFlagAdminCreateDialog } from './feature-flag-admin-web-create.dialog'
import { FeatureFlagAdminEditDialog } from './feature-flag-admin-web-edit.dialog'

export const FeatureFlagAdminList: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  // Selectors
  const filterValue = useAppSelector((state) => state.featureFlagsAdmin.filterValue)
  const limit = useAppSelector((state) => state.featureFlagsAdmin.limit || 10)
  const offset = useAppSelector((state) => state.featureFlagsAdmin.offset)
  const orderBy = useAppSelector((state) => state.featureFlagsAdmin.orderBy)
  const sortDir = useAppSelector((state) => state.featureFlagsAdmin.sortDir)
  const flags = useAppSelector(selectAdminFlagsFormatted)
  const flagRowData = useAppSelector(selectAdminFlagsListData)
  const flagsCount = useAppSelector((state) => state.featureFlagsAdmin.flagsCount)
  const isMobileWidth = useAppSelector(selectIsMobileWidth)

  // Local state
  const [isInitialized, setIsInitialized] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editFlag, setEditFlag] = useState<FeatureFlagType | null>(null)

  // Headers
  const flagsListHeaders = FeatureFlagAdminWebListService.getListHeaders()

  // API
  const [
    fetchFlagsList,
    {
      data: flagsListResponse,
      error: flagsListError,
      isFetching: isLoadingFlagsList,
    },
  ] = useLazyGetAdminFeatureFlagsQuery()

  useEffect(() => {
    setDocumentTitle('Feature Flags Admin')
    if (!isLoadingFlagsList) {
      void fetchFlags()
    }

    if (location?.pathname) {
      dispatch(featureFlagAdminActions.lastRouteSet(location.pathname))
    }

    setIsFetching(false)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isLoadingFlagsList) {
      if (!flagsListError && flagsListResponse?.flags) {
        dispatch(featureFlagAdminActions.flagsListSet(flagsListResponse.flags))
        dispatch(featureFlagAdminActions.flagsCountSet(flagsListResponse.count))
        setIsFetching(false)
      }
      if (flagsListError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(flagsListError)))
        setIsFetching(false)
      }
    }
  }, [isLoadingFlagsList, flagsListError, flagsListResponse])

  const fetchFlags = async (searchValue?: string): Promise<void> => {
    setIsFetching(true)
    const params: GetFeatureFlagsListQueryType = {
      filterValue: searchValue !== undefined ? searchValue : filterValue,
      limit,
      offset,
      orderBy,
      sortDir,
    }
    await fetchFlagsList(params)
  }

  const clickRow = (data: TableRowType): void => {
    const flag = flags.find((f) => f.id === data.id)
    if (flag) {
      setEditFlag(flag)
    }
  }

  const handleOffsetChange = (newOffset: number) => {
    dispatch(featureFlagAdminActions.offsetSet(newOffset))
    void fetchFlags()
  }

  const handleLimitChange = (newLimit: number) => {
    dispatch(featureFlagAdminActions.limitSet(newLimit))
    dispatch(featureFlagAdminActions.offsetSet(0))
    void fetchFlags()
  }

  const handleSortChange = (fieldName: string): void => {
    if (fieldName === orderBy) {
      dispatch(featureFlagAdminActions.sortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
      void fetchFlags()
      return
    }

    dispatch(featureFlagAdminActions.orderBySet(fieldName))
    dispatch(featureFlagAdminActions.sortDirSet('ASC'))
    void fetchFlags()
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    void fetchFlags()
  }

  const handleEditSuccess = () => {
    setEditFlag(null)
    void fetchFlags()
  }

  const createDialog = createPortal(
    <CustomDialog
      body={
        <FeatureFlagAdminCreateDialog
          closeDialog={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      }
      closeDialog={() => setCreateDialogOpen(false)}
      isMobileWidth={isMobileWidth}
      open={createDialogOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const editDialog = createPortal(
    <CustomDialog
      body={
        <FeatureFlagAdminEditDialog
          closeDialog={() => setEditFlag(null)}
          flag={editFlag}
          onSuccess={handleEditSuccess}
        />
      }
      closeDialog={() => setEditFlag(null)}
      isMobileWidth={isMobileWidth}
      open={!!editFlag}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  return (
    <ContentWrapper
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      {/* Header with Create Button */}
      <Grid
        alignItems={'center'}
        container
        direction={'row'}
        justifyContent={'space-between'}
        padding="12px 24px 6px"
        spacing={0}
      >
        <Grid size={6}>
          <h2>Feature Flags</h2>
        </Grid>
        <Grid
          size={6}
          textAlign="right"
        >
          <Button
            color="primary"
            onClick={() => setCreateDialogOpen(true)}
            variant="contained"
          >
            Create Flag
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="flex-start"
        padding="6px 24px 12px"
        spacing={0}
      >
        <TableComponent
          changeLimit={handleLimitChange}
          changeOffset={handleOffsetChange}
          changeSort={handleSortChange}
          clickRow={clickRow}
          count={flagsCount || limit}
          header={flagsListHeaders}
          isInitialized={isInitialized}
          limit={limit}
          loading={isFetching}
          offset={offset}
          orderBy={orderBy}
          rows={flagRowData}
          sortDir={sortDir}
          tableName="FeatureFlags"
        />
      </Grid>

      {createDialog}
      {editDialog}
    </ContentWrapper>
  )
}
```

### Add to Sudo Router

```typescript
// packages/web/web-app/src/app/routers/sudo.router.tsx (additions)

import { lazy } from 'react'

import { FEATURE_FLAG_ADMIN_ROUTES } from '../feature-flags/admin/feature-flag-admin-web.consts'

const LazyFeatureFlagAdminList = lazy(async () => ({
  default: (await import('../feature-flags/admin/feature-flag-admin-web-list.component'))
    .FeatureFlagAdminList,
}))

// Add to SudoWebRouterConfig.getRouter():
{
  element: <LazyFeatureFlagAdminList />,
  path: FEATURE_FLAG_ADMIN_ROUTES.LIST,
},
```

### Admin Menu

```typescript
// packages/web/web-app/src/app/feature-flags/admin/feature-flag-admin-web.menu.ts

import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { FEATURE_FLAG_ADMIN_ROUTES } from './feature-flag-admin-web.consts'

export const featureFlagAdminMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-feature-flags',
    items: [
      {
        // NOTE: Add FLAG to IconNames enum in packages/web/libs/ui/icons/enums.ts
        // For now, using MANAGE_ACCOUNTS as placeholder
        icon: IconNames.MANAGE_ACCOUNTS,
        id: 'menu-feature-flags-main',
        pathMatches: [FEATURE_FLAG_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: FEATURE_FLAG_ADMIN_ROUTES.LIST,
        title: strings.FEATURE_FLAGS || 'Feature Flags',
        type: 'ROUTE',
      },
    ],
    title: strings.FEATURE_FLAGS || 'Feature Flags',
  }
}
```

> **Note:**
> - Consider adding `FLAG = 'FLAG'` to `packages/web/libs/ui/icons/enums.ts` and implementing the icon component for a more appropriate visual.
> - Add `FEATURE_FLAGS: 'Feature Flags'` to the i18n translations if localization is needed.

### Add to Menu Config Service

```typescript
// packages/web/web-app/src/app/ui/menus/menu-config.service.ts (additions)

import { featureFlagAdminMenu } from '../../feature-flags/admin/feature-flag-admin-web.menu'

// Add to CARDINAL_MENU_SET array (in desired order):
CARDINAL_MENU_SET: AppMenuType[] = [
  dashboardMenu(),
  userProfileMenu(),
  userAdminMenu(),
  featureFlagAdminMenu(), // Add this line
  statsMenu(),
]
```

---

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

### 4. Fetching Flags on Login

```typescript
// Example: Fetch feature flags after successful login
import { featureFlagsActions } from '../feature-flags/feature-flag-web.reducer'
import { featureFlagsApi } from '../feature-flags/feature-flag-web.api'

// In login success handler or bootstrap
const fetchFlags = async (dispatch: AppDispatch) => {
  dispatch(featureFlagsActions.featureFlagsLoading(undefined))

  try {
    const result = await dispatch(
      featureFlagsApi.endpoints.getFeatureFlags.initiate(),
    ).unwrap()

    dispatch(featureFlagsActions.featureFlagsFetched(result.flags))
  } catch (error) {
    console.error('Failed to fetch feature flags:', error)
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

### Phase 1: Core Infrastructure
- [ ] Add feature flag error codes to `error-shared.consts.ts` (700-799 range)
- [ ] Create `packages/shared/models/src/feature-flags/` directory
- [ ] Add `feature-flag-shared.consts.ts`
- [ ] Add `feature-flag-shared.consts.spec.ts`
- [ ] Add `feature-flag-shared.types.ts`
- [ ] Add `index.ts` barrel export
- [ ] Update `packages/shared/models/src/index.ts` with exports

### Phase 2: API Implementation
- [ ] Create `packages/api/libs/feature-flags/` directory
- [ ] Add all API lib files (model, service, middleware, consts, types, index)
- [ ] Create `packages/api/api-app/src/feature-flags/` directory
- [ ] Add controller and routes
- [ ] Update `v1.routes.ts` with feature flag routes
- [ ] Register `FeatureFlagModel` in `postgres-database-api.service.ts`

### Phase 3: Web Implementation
- [ ] Create `packages/web/web-app/src/app/feature-flags/` directory
- [ ] Add all web app files (reducer, selectors, hooks, component, api)
- [ ] Update `store-web.redux.ts` with feature flags reducer
- [ ] Add feature flags fetch to login/bootstrap flow

### Phase 4: Real-Time Updates (Optional)
- [ ] Add socket types to shared models
- [ ] Create API socket handler for feature flags
- [ ] Create web socket handler for feature flags
- [ ] Initialize socket connection on login

### Phase 5: Admin UI (SUPER_ADMIN Only)
- [ ] Create `feature-flags/admin/` directory in web-app
- [ ] Add `feature-flag-admin-web.api.ts` (API endpoints)
- [ ] Add `feature-flag-admin-web.consts.ts` (routes)
- [ ] Add `feature-flag-admin-web.types.ts` (state types)
- [ ] Add `feature-flag-admin-web.reducer.ts` (Redux slice)
- [ ] Add `feature-flag-admin-web.selectors.ts` (memoized selectors)
- [ ] Add `feature-flag-admin-web-list.service.ts` (table data formatting)
- [ ] Add `feature-flag-admin-web-list.component.tsx` (main list with TableComponent)
- [ ] Add `feature-flag-admin-web-create.dialog.tsx` (create dialog)
- [ ] Add `feature-flag-admin-web-edit.dialog.tsx` (edit dialog)
- [ ] Add `feature-flag-admin-web.menu.ts` (sidebar menu)
- [ ] Add `featureFlagsAdmin` reducer to `store-web.redux.ts`
- [ ] Add routes to `sudo.router.tsx`
- [ ] Add `featureFlagAdminMenu()` to `menu-config.service.ts` CARDINAL_MENU_SET

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
