import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import {
  APP_PREFIX,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT,
  type UserType,
} from '@dx3/models-shared'

import { USER_ADMIN_ENTITY_NAME } from './user-admin-web.consts'
import type { UserAdminStateType } from './user-admin-web.types'

export const userAdminInitialState: UserAdminStateType = {
  filterValue: undefined,
  lastRoute: '',
  limit: DEFAULT_LIMIT,
  offset: DEFAULT_OFFSET,
  orderBy: undefined,
  sortDir: DEFAULT_SORT,
  user: undefined,
  users: [],
  usersCount: undefined,
}

export const userAdminPersistConfig: PersistConfig<UserAdminStateType> = {
  key: `${APP_PREFIX}:${USER_ADMIN_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  // blacklist: ['password'],
  storage,
}

const userAdminSlice = createSlice({
  initialState: userAdminInitialState,
  name: USER_ADMIN_ENTITY_NAME,
  reducers: {
    filterValueSet(state, action: PayloadAction<string | undefined>) {
      state.filterValue = action.payload
    },
    lastRouteSet(state, action: PayloadAction<string>) {
      state.lastRoute = action.payload
    },
    limitSet(state, action: PayloadAction<number>) {
      state.limit = action.payload
    },
    listSet(state, action: PayloadAction<UserType[]>) {
      state.users = action.payload
    },
    offsetSet(state, action: PayloadAction<number>) {
      state.offset = action.payload
    },
    orderBySet(state, action: PayloadAction<string | undefined>) {
      state.orderBy = action.payload
    },
    sortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortDir = action.payload
    },
    userCountSet(state, action: PayloadAction<number | undefined>) {
      state.usersCount = action.payload
    },
    userSet(state, action: PayloadAction<UserType | undefined>) {
      state.user = action.payload
    },
  },
})

export const userAdminActions = userAdminSlice.actions

export const userAdminReducer = userAdminSlice.reducer
