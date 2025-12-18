import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_PREFIX, type MediaDataType } from '@dx3/models-shared'

import { MEDIA_ENTITY_NAME } from './media-web.constants'
import type { MediaStateType } from './media-web.types'

export const mediaInitialState: MediaStateType = {
  media: [],
}

export const mediaPersistConfig: PersistConfig<MediaStateType> = {
  key: `${APP_PREFIX}:${MEDIA_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  // blacklist: ['password'],
  storage,
}

const mediaSlice = createSlice({
  initialState: mediaInitialState,
  name: MEDIA_ENTITY_NAME,
  reducers: {
    addMediaItem(state, action: PayloadAction<MediaDataType>) {
      const nextState = state.media
      nextState.push(action.payload)
      state.media = nextState
    },
    removeMediaItem(state, action: PayloadAction<string>) {
      const nextState = state.media.filter((mediaItem) => mediaItem.id !== action.payload)
      state.media = nextState
    },
    setMediaAll(state, action: PayloadAction<MediaDataType[]>) {
      state.media = action.payload
    },
  },
})

export const mediaActions = mediaSlice.actions

export const mediaReducer = mediaSlice.reducer
