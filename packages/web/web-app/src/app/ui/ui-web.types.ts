import type { PaletteMode } from '@mui/material/styles'

import type { AppMenuType } from './menus/app-menu.types'

export type UiStateType = {
  apiDialogOpen: boolean
  apiDialogError: string | null
  awaitDialogMessage: string
  awaitDialogOpen: boolean
  bootstrapped: boolean
  isShowingUnauthorizedAlert: boolean
  logoUrl: string
  logoUrlSmall: string
  menuOpen: boolean
  menus: AppMenuType[] | null
  mobileNotiicationsOpen: boolean
  name: string
  notifications: number
  publicMenuOpen: boolean
  theme: PaletteMode
  windowWidth: number
  windowHeight: number
}

export type RouteState = {
  [routeKey: string]: string
}
