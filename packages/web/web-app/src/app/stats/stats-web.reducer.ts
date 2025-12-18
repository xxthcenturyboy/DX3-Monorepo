import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX } from '@dx3/models-shared'

import { STATS_SUDO_WEB_ENTITY_NAME } from './stats-web.consts'
import type { StatsApiHealthType, StatsStateType } from './stats-web.types'

export const statsInitialState: StatsStateType = {
  api: undefined,
}

export const statsPersistConfig: PersistConfig<StatsStateType> = {
  blacklist: ['api'],
  key: `${APP_PREFIX}:${STATS_SUDO_WEB_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const statsSlice = createSlice({
  initialState: statsInitialState,
  name: STATS_SUDO_WEB_ENTITY_NAME,
  reducers: {
    setApiStats(state, action: PayloadAction<StatsApiHealthType | undefined>) {
      state.api = action.payload
    },
  },
})

export const statsActions = statsSlice.actions

export const statsReducer = statsSlice.reducer
