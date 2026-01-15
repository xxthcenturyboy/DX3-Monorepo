import { createSelector } from 'reselect'

import type { FeatureFlagType } from '@dx3/models-shared'

import type { RootState } from '../../store/store-web.redux'
import { FeatureFlagAdminWebListService } from './feature-flag-admin-web-list.service'

const getAdminFlags = (state: RootState): FeatureFlagType[] => state.featureFlagsAdmin?.flags || []

export const selectAdminFlagsFormatted = createSelector([getAdminFlags], (flags) => {
  return [...flags].sort((a, b) => a.name.localeCompare(b.name))
})

export const selectAdminFlagsListData = createSelector([selectAdminFlagsFormatted], (flags) => {
  const service = new FeatureFlagAdminWebListService()
  return service.getRows(flags)
})
