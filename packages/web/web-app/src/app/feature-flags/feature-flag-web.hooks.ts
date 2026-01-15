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
