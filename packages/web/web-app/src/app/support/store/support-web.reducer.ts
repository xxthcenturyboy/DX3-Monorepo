import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { SupportRequestType } from '@dx3/models-shared'

import type { SupportWebState } from '../support.types'

export const supportInitialState: SupportWebState = {
  lastToast: null,
  newRequestIds: [],
  unviewedCount: 0,
}

export const SUPPORT_WEB_ENTITY_NAME = 'support'

const supportSlice = createSlice({
  initialState: supportInitialState,
  name: SUPPORT_WEB_ENTITY_NAME,
  reducers: {
    addNewRequest: (state, action: PayloadAction<SupportRequestType>) => {
      state.newRequestIds.push(action.payload.id)
      state.unviewedCount += 1
      state.lastToast = action.payload
    },
    clearLastToast: (state) => {
      state.lastToast = null
    },
    markRequestViewed: (state, action: PayloadAction<string>) => {
      state.newRequestIds = state.newRequestIds.filter((id) => id !== action.payload)
      if (state.unviewedCount > 0) {
        state.unviewedCount -= 1
      }
    },
    resetSupportState: () => supportInitialState,
    setUnviewedCount: (state, action: PayloadAction<number>) => {
      state.unviewedCount = action.payload
    },
  },
})

export const supportActions = supportSlice.actions

export const supportReducer = supportSlice.reducer
