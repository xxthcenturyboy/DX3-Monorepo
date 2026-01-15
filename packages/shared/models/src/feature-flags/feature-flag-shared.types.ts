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

export type FeatureFlagSocketServerToClientEvents = {
  featureFlagUpdated: (flag: FeatureFlagEvaluatedType) => void
  featureFlagsUpdated: (flags: FeatureFlagEvaluatedType[]) => void
}

export type FeatureFlagSocketClientToServerEvents = {
  subscribeToFeatureFlags: () => void
  unsubscribeFromFeatureFlags: () => void
}

export type FeatureFlagSocketInterServerEvents = {
  ping: () => void
}

export type FeatureFlagSocketData = {
  userId?: string
}
