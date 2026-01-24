import type { ThemeOptions } from '@mui/material/styles'

import { STORAGE_KEYS_UI } from '@dx3/web-libs/ui/ui.consts'

import { typographyOverridesCommon } from './components/common/typography-common'
import { muiDarkComponentOverrides } from './components/dark'
import { muiLightComponentOverrides } from './components/light'
import { muiDarkPalette } from './mui-dark.palette'
import { muiLightPalette } from './mui-light.palette'

function getThemeModeFromLocalStorage() {
  // SSR-safe: default to 'light' if localStorage is not available
  if (typeof localStorage === 'undefined') {
    return 'light'
  }
  const themeMode = localStorage.getItem(STORAGE_KEYS_UI.THEME_MODE)
  return themeMode === 'dark' ? 'dark' : 'light'
}

/**
 * Get theme options for a specific mode.
 * Use this for SSR where you have the mode from Redux state.
 * @param mode - 'light' or 'dark'
 */
export function getThemeForMode(mode: 'light' | 'dark'): ThemeOptions {
  if (mode === 'light') {
    return {
      components: muiLightComponentOverrides,
      palette: muiLightPalette,
      typography: typographyOverridesCommon,
    }
  } else {
    return {
      components: muiDarkComponentOverrides,
      palette: muiDarkPalette,
      typography: typographyOverridesCommon,
    }
  }
}

/**
 * Get theme options using localStorage.
 * Use this for CSR where theme mode is read from localStorage.
 */
export function getTheme(): ThemeOptions {
  const mode = getThemeModeFromLocalStorage()
  return getThemeForMode(mode)
}
