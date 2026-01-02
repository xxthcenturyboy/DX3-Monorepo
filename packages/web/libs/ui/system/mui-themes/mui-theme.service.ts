import type { ThemeOptions } from '@mui/material/styles'

import { STORAGE_KEYS_UI } from '@dx3/web-libs/ui/system/ui.consts'

import { muiThemeDark, muiThemeDarkColors } from './dark/mui-dark.theme'
import { muiThemeLight, muiThemeLightColors } from './light/mui-light.theme'

function getThemeModeFromLocalStorage() {
  const themeMode = localStorage.getItem(STORAGE_KEYS_UI.THEME_MODE)
  return themeMode === 'dark' ? 'dark' : 'light'
}

export function getTheme(): ThemeOptions {
  const mode = getThemeModeFromLocalStorage()
  if (mode === 'light') {
    return muiThemeLight
  } else {
    return muiThemeDark
  }
}

export function getThemePalette() {
  const mode = getThemeModeFromLocalStorage()
  if (mode === 'light') {
    return muiThemeLightColors
  } else {
    return muiThemeDarkColors
  }
}
