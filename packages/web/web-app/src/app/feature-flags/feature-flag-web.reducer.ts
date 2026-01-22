import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX, type FeatureFlagEvaluatedType } from '@dx3/models-shared'

import { FEATURE_FLAGS_ENTITY_NAME } from './feature-flag-web.consts'
import type { FeatureFlagsStateType } from './feature-flag-web.types'

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
