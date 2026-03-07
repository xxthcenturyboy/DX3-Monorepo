import { jest } from '@jest/globals'

import { FEATURE_FLAG_NAMES, type FeatureFlagNameType } from '@dx3/models-shared'

export const mockFeatureFlags: Partial<Record<FeatureFlagNameType, boolean>> = {
  [FEATURE_FLAG_NAMES.BLOG]: true,
  [FEATURE_FLAG_NAMES.FAQ_APP]: true,
  [FEATURE_FLAG_NAMES.FAQ_MARKETING]: false,
}

export const useFeatureFlag = jest.fn(
  (flagName: FeatureFlagNameType) => mockFeatureFlags[flagName] ?? false,
)

export const useFeatureFlags = jest.fn(() => ({
  isEnabled: (flagName: FeatureFlagNameType) => mockFeatureFlags[flagName] ?? false,
  isLoading: false,
}))
