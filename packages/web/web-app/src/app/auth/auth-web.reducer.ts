import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX, type JwtPayloadType } from '@dx3/models-shared'

import { AUTH_ENTITY_NAME } from './auth-web.consts'
import type { AuthStateType } from './auth-web.types'

export const authInitialState: AuthStateType = {
  logoutResponse: false,
  password: '',
  token: null,
  userId: null,
  username: '',
}

export const authPersistConfig: PersistConfig<AuthStateType> = {
  blacklist: ['password'],
  key: `${APP_PREFIX}:${AUTH_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const authSlice = createSlice({
  initialState: authInitialState,
  name: AUTH_ENTITY_NAME,
  reducers: {
    passwordUpdated(state, action: PayloadAction<string>) {
      state.password = action.payload
    },
    setLogoutResponse(state, action: PayloadAction<boolean>) {
      state.logoutResponse = action.payload
    },
    tokenAdded(state, action: PayloadAction<string>) {
      const tokenDecoded = jwtDecode<JwtPayloadType>(action.payload)
      state.token = action.payload
      state.userId = tokenDecoded?._id || null
    },
    tokenRemoved(state, _action: PayloadAction<undefined>) {
      state.token = null
      state.userId = null
    },
    usernameUpdated(state, action: PayloadAction<string>) {
      state.username = action.payload
    },
  },
})

export const authActions = authSlice.actions

export const authReducer = authSlice.reducer
