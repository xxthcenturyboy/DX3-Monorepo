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
