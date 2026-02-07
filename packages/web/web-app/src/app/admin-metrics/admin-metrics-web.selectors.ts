import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '../store/store-web.redux'

const selectAdminMetricsSlice = (state: RootState) => state.adminMetrics

export const selectAdminMetricsState = createSelector(
  [selectAdminMetricsSlice],
  (adminMetrics) => ({
    dateRange: adminMetrics.dateRange,
    growth: adminMetrics.growth,
    isAvailable: adminMetrics.isAvailable,
    lastRoute: adminMetrics.lastRoute,
  }),
)

export const selectMetricsDateRange = createSelector(
  [selectAdminMetricsSlice],
  (adminMetrics) => adminMetrics.dateRange,
)

export const selectMetricsGrowth = createSelector(
  [selectAdminMetricsSlice],
  (adminMetrics) => adminMetrics.growth,
)

export const selectMetricsIsAvailable = createSelector(
  [selectAdminMetricsSlice],
  (adminMetrics) => adminMetrics.isAvailable,
)
