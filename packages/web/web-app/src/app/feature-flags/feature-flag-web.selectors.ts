import { createSelector } from 'reselect'

import type { FeatureFlagNameType } from '@dx3/models-shared'

import type { RootState } from '../store/store-web.redux'
import { FEATURE_FLAGS_STALE_TIME } from './feature-flag-web.consts'

export const selectFeatureFlags = (state: RootState): Record<string, boolean> =>
  state.featureFlags.flags

export const selectFeatureFlagsLoading = (state: RootState): boolean => state.featureFlags.isLoading

export const selectFeatureFlagsLastFetched = (state: RootState): number | null =>
  state.featureFlags.lastFetched

export const selectFeatureFlag = (state: RootState, flagName: FeatureFlagNameType): boolean =>
  state.featureFlags.flags[flagName] ?? false

export const selectFeatureFlagsStale = createSelector(
  [selectFeatureFlagsLastFetched],
  (lastFetched): boolean => {
    if (!lastFetched) return true
    return Date.now() - lastFetched > FEATURE_FLAGS_STALE_TIME
  },
)
