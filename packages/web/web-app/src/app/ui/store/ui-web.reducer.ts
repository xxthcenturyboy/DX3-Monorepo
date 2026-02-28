import type { PaletteMode } from '@mui/material/styles'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import { APP_NAME, APP_PREFIX } from '@dx3/models-shared'

import type { AppMenuType } from '../menus/app-menu.types'
import { UI_WEB_ENTITY_NAME } from '../ui-web.consts'
import type { UiStateType } from '../ui-web.types'

export const uiInitialState: UiStateType = {
  apiDialogError: null,
  apiDialogOpen: false,
  awaitDialogMessage: '',
  awaitDialogOpen: false,
  bootstrapped: false,
  isShowingUnauthorizedAlert: false,
  logoUrl: `/assets/img/text-logo-dark-square.png`,
  logoUrlSmall: `/assets/img/text-logo-square.png`,
  menuOpen: false,
  menus: null,
  mobileNotiicationsOpen: false,
  name: APP_NAME,
  notifications: 0,
  publicMenuOpen: false,
  theme: 'light',
  windowHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
}

export const uiPersistConfig: PersistConfig<UiStateType> = {
  blacklist: [
    'apiDialogError',
    'apiDialogOpen',
    'awaitDialogMessage',
    'awaitDialogOpen',
    'bootstrapped',
    'isShowingUnauthorizedAlert',
    'logoUrl',
    'logoUrlSmall',
    'mobileNotiicationsOpen',
    'publicMenuOpen',
  ],
  key: `${APP_PREFIX}:${UI_WEB_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  storage,
}

const uiSlice = createSlice({
  initialState: uiInitialState,
  name: UI_WEB_ENTITY_NAME,
  reducers: {
    apiDialogSet(state, action: PayloadAction<string>) {
      state.apiDialogOpen = !!action.payload
      state.apiDialogError = action.payload
    },
    awaitDialogMessageSet(state, action: PayloadAction<string>) {
      state.awaitDialogMessage = action.payload
    },
    awaitDialogOpenSet(state, action: PayloadAction<boolean>) {
      state.awaitDialogOpen = action.payload
    },
    bootstrapSet(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload
    },
    menusSet(state, action: PayloadAction<{ menus: AppMenuType[] | null }>) {
      state.menus = action.payload.menus
    },
    setIsShowingUnauthorizedAlert(state, action: PayloadAction<boolean>) {
      state.isShowingUnauthorizedAlert = action.payload
    },
    themeModeSet(state, action: PayloadAction<PaletteMode>) {
      state.theme = action.payload
    },
    toggleMenuSet(state, action: PayloadAction<boolean>) {
      state.menuOpen = action.payload
    },
    toggleMobileNotificationsOpenSet(state, action: PayloadAction<boolean>) {
      state.mobileNotiicationsOpen = action.payload
    },
    togglePublicMenuSet(state, action: PayloadAction<boolean>) {
      state.publicMenuOpen = action.payload
    },
    windowSizeSet(state, _action: PayloadAction<undefined>) {
      state.windowWidth = window?.innerWidth
      state.windowHeight = window?.innerHeight
    },
  },
})

export const uiActions = uiSlice.actions

export const uiReducer = uiSlice.reducer
