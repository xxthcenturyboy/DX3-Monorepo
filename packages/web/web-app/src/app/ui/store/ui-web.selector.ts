import type { PaletteMode } from '@mui/material'
import type { Theme as ToastifyTheme } from 'react-toastify'
import { createSelector } from 'reselect'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import type { RootState } from '../../store/store-web.redux'
import type { UiStateType } from '../ui-web.types'

const getThemePalette = (state: RootState): RootState['ui']['theme']['palette'] =>
  state.ui.theme.palette

const _selectUiState = (state: RootState): UiStateType => state.ui
export const selectWindowHeight = (state: RootState): number => state.ui.windowHeight
export const selectWindowWidth = (state: RootState): number => state.ui.windowWidth

export const selectCurrentThemeMode = createSelector(
  [getThemePalette],
  (palette): PaletteMode | undefined => {
    return palette?.mode
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
