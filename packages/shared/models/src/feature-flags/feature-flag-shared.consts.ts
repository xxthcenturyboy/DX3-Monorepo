/**
 * Feature flag socket namespace
 */
export const FEATURE_FLAG_SOCKET_NS = '/feature-flags'

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
