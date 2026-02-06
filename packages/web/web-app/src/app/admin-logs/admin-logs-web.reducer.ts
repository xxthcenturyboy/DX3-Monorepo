import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX, type LogEntryType, type LogEventType } from '@dx3/models-shared'

import { ADMIN_LOGS_ENTITY_NAME } from './admin-logs-web.consts'
import type { AdminLogsStateType } from './admin-logs-web.types'

export const adminLogsInitialState: AdminLogsStateType = {
  eventTypeFilter: '',
  isAvailable: null,
  lastRoute: '',
  limit: 25,
  logs: [],
  logsCount: 0,
  offset: 0,
  orderBy: 'created_at',
  sortDir: 'DESC',
  successFilter: '',
}

export const adminLogsPersistConfig: PersistConfig<AdminLogsStateType> = {
  blacklist: ['isAvailable', 'logs', 'logsCount'],
  key: `${APP_PREFIX}:${ADMIN_LOGS_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const adminLogsSlice = createSlice({
  initialState: adminLogsInitialState,
  name: ADMIN_LOGS_ENTITY_NAME,
  reducers: {
    eventTypeFilterSet(state, action: PayloadAction<LogEventType | ''>) {
      state.eventTypeFilter = action.payload
    },
    isAvailableSet(state, action: PayloadAction<boolean | null>) {
      state.isAvailable = action.payload
    },
    lastRouteSet(state, action: PayloadAction<string>) {
      state.lastRoute = action.payload
    },
    limitSet(state, action: PayloadAction<number>) {
      state.limit = action.payload
    },
    logsCountSet(state, action: PayloadAction<number>) {
      state.logsCount = action.payload
    },
    logsSet(state, action: PayloadAction<LogEntryType[]>) {
      state.logs = action.payload
    },
    offsetSet(state, action: PayloadAction<number>) {
      state.offset = action.payload
    },
    orderBySet(state, action: PayloadAction<string>) {
      state.orderBy = action.payload
    },
    sortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortDir = action.payload
    },
    successFilterSet(state, action: PayloadAction<boolean | ''>) {
      state.successFilter = action.payload
    },
  },
})

export const adminLogsActions = adminLogsSlice.actions

export const adminLogsReducer = adminLogsSlice.reducer
