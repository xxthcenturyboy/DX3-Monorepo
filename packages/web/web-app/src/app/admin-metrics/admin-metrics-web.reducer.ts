import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX } from '@dx3/models-shared'

import { ADMIN_METRICS_ENTITY_NAME, type MetricsDateRangeType } from './admin-metrics-web.consts'
import type { AdminMetricsStateType, MetricsGrowthDataType } from './admin-metrics-web.types'

export const adminMetricsInitialState: AdminMetricsStateType = {
  dateRange: '30d',
  growth: null,
  isAvailable: null,
  lastRoute: '',
}

export const adminMetricsPersistConfig: PersistConfig<AdminMetricsStateType> = {
  blacklist: ['growth', 'isAvailable'],
  key: `${APP_PREFIX}:${ADMIN_METRICS_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const adminMetricsSlice = createSlice({
  initialState: adminMetricsInitialState,
  name: ADMIN_METRICS_ENTITY_NAME,
  reducers: {
    dateRangeSet(state, action: PayloadAction<MetricsDateRangeType>) {
      state.dateRange = action.payload
    },
    growthSet(state, action: PayloadAction<MetricsGrowthDataType | null>) {
      state.growth = action.payload
    },
    isAvailableSet(state, action: PayloadAction<boolean | null>) {
      state.isAvailable = action.payload
    },
    lastRouteSet(state, action: PayloadAction<string>) {
      state.lastRoute = action.payload
    },
  },
})

export const adminMetricsActions = adminMetricsSlice.actions

export const adminMetricsReducer = adminMetricsSlice.reducer
