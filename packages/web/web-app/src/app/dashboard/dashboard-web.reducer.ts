import { createSlice } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'

import { APP_PREFIX } from '@dx3/models-shared'

import { DASHBOARD_ENTITY_NAME } from './dashboard-web.consts'
import type { DashboardStateType } from './dashboard-web.types'

export const dashbaordInitialState: DashboardStateType = {
  a: null,
}

export const dashboardPersistConfig = {
  key: `${APP_PREFIX}:${DASHBOARD_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  // blacklist: ['password', 'passwordConfirmation'],
  storage,
}

const dashboardSlice = createSlice({
  initialState: dashbaordInitialState,
  name: DASHBOARD_ENTITY_NAME,
  reducers: {},
})

export const dashboardActions = dashboardSlice.actions

export const dashboardReducer = dashboardSlice.reducer
