import { createSlice } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'

import { APP_PREFIX } from '@dx3/models-shared'

import { HOME_ENTITY_NAME } from './home-web.consts'
import type { HomeStateType } from './home-web.types'

export const homeInitialState: HomeStateType = {
  a: null,
}

export const homePersistConfig = {
  key: `${APP_PREFIX}:${HOME_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  // blacklist: ['password', 'passwordConfirmation'],
  storage,
}

const homeSlice = createSlice({
  initialState: homeInitialState,
  name: HOME_ENTITY_NAME,
  reducers: {},
})

export const homeActions = homeSlice.actions

export const homeReducer = homeSlice.reducer
