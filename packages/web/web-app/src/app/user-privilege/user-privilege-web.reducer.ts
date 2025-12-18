import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX, type PrivilegeSetDataType } from '@dx3/models-shared'

import { PRIVILEGE_SET_WEB_ENTITY_NAME } from './user-privilege-web.consts'
import type { PrivilegeSetStateType } from './user-privilege-web.types'

export const privilegeSetInitialState: PrivilegeSetStateType = {
  sets: [],
}

export const privilegeSetPersistConfig: PersistConfig<PrivilegeSetStateType> = {
  key: `${APP_PREFIX}:${PRIVILEGE_SET_WEB_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const privilegeSetSlice = createSlice({
  initialState: privilegeSetInitialState,
  name: PRIVILEGE_SET_WEB_ENTITY_NAME,
  reducers: {
    setPrivileges(state, action: PayloadAction<PrivilegeSetDataType[]>) {
      state.sets = Array.isArray(action.payload) ? action.payload : []
    },
  },
})

export const privilegeSetActions = privilegeSetSlice.actions

export const privilegeSetReducer = privilegeSetSlice.reducer
