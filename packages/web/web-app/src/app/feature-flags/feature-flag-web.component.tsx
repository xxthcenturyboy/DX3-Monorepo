import type * as React from 'react'

import type { FeatureFlagNameType } from '@dx3/models-shared'
import { BetaFeatureComponent } from '@dx3/web-libs/ui/global/beta-feature-placeholder.component'

import { useI18n } from '../i18n'
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
  const { t } = useI18n()

  if (isEnabled) {
    return <>{children}</>
  }

  if (showPlaceholder) {
    return <BetaFeatureComponent message={t('FEATURE_FLAG_COMING_SOON', { flagName })} />
  }

  return <>{fallback}</>
}
