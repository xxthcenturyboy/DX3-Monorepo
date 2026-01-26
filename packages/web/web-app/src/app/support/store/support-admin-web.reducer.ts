import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import {
  APP_PREFIX,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  DEFAULT_SORT,
  type SupportCategoryType,
  type SupportRequestType,
  type SupportRequestWithUserType,
  type SupportStatusType,
} from '@dx3/models-shared'

import type { SupportAdminStateType } from '../support.types'

export const SUPPORT_ADMIN_ENTITY_NAME = 'supportAdmin'

export const supportAdminUserTabInitialState: SupportAdminStateType['userTab'] = {
  filterOpenOnly: true,
  limit: DEFAULT_LIMIT,
  offset: DEFAULT_OFFSET,
  orderBy: 'createdAt',
  sortDir: DEFAULT_SORT,
  supportRequests: [],
  supportRequestsCount: 0,
  userId: '',
}

export const supportAdminInitialState: SupportAdminStateType = {
  categoryFilter: '',
  filterValue: '',
  lastRoute: '',
  limit: DEFAULT_LIMIT,
  offset: DEFAULT_OFFSET,
  orderBy: 'createdAt',
  selectedIds: [],
  sortDir: DEFAULT_SORT,
  statusFilter: '',
  supportRequestsWithUser: [],
  supportRequestsWithUserCount: 0,
  userTab: supportAdminUserTabInitialState,
}

export const supportAdminPersistConfig: PersistConfig<SupportAdminStateType> = {
  key: `${APP_PREFIX}:${SUPPORT_ADMIN_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const supportAdminSlice = createSlice({
  initialState: supportAdminInitialState,
  name: SUPPORT_ADMIN_ENTITY_NAME,
  reducers: {
    categoryFilterSet(state, action: PayloadAction<SupportCategoryType | ''>) {
      state.categoryFilter = action.payload
    },
    filterValueSet(state, action: PayloadAction<string>) {
      state.filterValue = action.payload
    },
    lastRouteSet(state, action: PayloadAction<string>) {
      state.lastRoute = action.payload
    },
    limitSet(state, action: PayloadAction<number>) {
      state.limit = action.payload
    },
    listWithUserSet(state, action: PayloadAction<SupportRequestWithUserType[]>) {
      state.supportRequestsWithUser = action.payload
    },
    offsetSet(state, action: PayloadAction<number>) {
      state.offset = action.payload
    },
    orderBySet(state, action: PayloadAction<string>) {
      state.orderBy = action.payload
    },
    resetFilters(state) {
      state.categoryFilter = ''
      state.filterValue = ''
      state.offset = DEFAULT_OFFSET
      state.statusFilter = ''
    },
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload
    },
    sortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortDir = action.payload
    },
    statusFilterSet(state, action: PayloadAction<SupportStatusType | ''>) {
      state.statusFilter = action.payload
    },
    supportRequestsWithUserCountSet(state, action: PayloadAction<number | undefined>) {
      state.supportRequestsWithUserCount = action.payload || 0
    },
    // Update a single request's viewedByAdmin status in the list
    updateRequestViewed(state, action: PayloadAction<string>) {
      const idx = state.supportRequestsWithUser.findIndex((r) => r.id === action.payload)
      if (idx !== -1) {
        state.supportRequestsWithUser[idx].viewedByAdmin = true
      }
    },
    // User Tab actions
    userTabFilterOpenOnlySet(state, action: PayloadAction<boolean>) {
      state.userTab.filterOpenOnly = action.payload
    },
    userTabLimitSet(state, action: PayloadAction<number>) {
      state.userTab.limit = action.payload
    },
    userTabListSet(state, action: PayloadAction<SupportRequestType[]>) {
      state.userTab.supportRequests = action.payload
    },
    userTabOffsetSet(state, action: PayloadAction<number>) {
      state.userTab.offset = action.payload
    },
    userTabOrderBySet(state, action: PayloadAction<string>) {
      state.userTab.orderBy = action.payload
    },
    userTabReset(state) {
      state.userTab = supportAdminUserTabInitialState
    },
    userTabSortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.userTab.sortDir = action.payload
    },
    userTabSupportRequestsCountSet(state, action: PayloadAction<number>) {
      state.userTab.supportRequestsCount = action.payload
    },
    userTabUserIdSet(state, action: PayloadAction<string>) {
      state.userTab.userId = action.payload
    },
  },
})

export const supportAdminActions = supportAdminSlice.actions

export const supportAdminReducer = supportAdminSlice.reducer
