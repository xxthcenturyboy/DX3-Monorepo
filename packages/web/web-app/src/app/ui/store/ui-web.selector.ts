import type { PaletteMode } from '@mui/material/styles'
import type { Theme as ToastifyTheme } from 'react-toastify'
import { createSelector } from 'reselect'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import type { RootState } from '../../store/store-web.redux'
import type { UiStateType } from '../ui-web.types'

const getThemePaletteMode = (state: RootState): RootState['ui']['theme'] => state.ui.theme

const _selectUiState = (state: RootState): UiStateType => state.ui
export const selectWindowHeight = (state: RootState): number => state.ui.windowHeight
export const selectWindowWidth = (state: RootState): number => state.ui.windowWidth

export const selectCurrentThemeMode = createSelector(
  [getThemePaletteMode],
  (palette): PaletteMode | undefined => {
    return palette || 'light'
  },
)

export const selectIsMobileWidth = createSelector([selectWindowWidth], (width): boolean => {
  return width <= MEDIA_BREAK.MOBILE
})

export const selectToastThemeMode = createSelector(
  [selectCurrentThemeMode],
  (mode): ToastifyTheme => {
    return mode || 'colored'
  },
)
