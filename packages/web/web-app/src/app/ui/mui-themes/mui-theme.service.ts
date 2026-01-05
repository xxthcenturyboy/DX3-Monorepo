import type { ThemeOptions } from '@mui/material/styles'

import { STORAGE_KEYS_UI } from '@dx3/web-libs/ui/ui.consts'

import { typographyOverridesCommon } from './components/common/typography-common'
import { muiDarkComponentOverrides } from './components/dark'
import { muiLightComponentOverrides } from './components/light'
import { muiDarkPalette } from './mui-dark.palette'
import { muiLightPalette } from './mui-light.palette'

function getThemeModeFromLocalStorage() {
  const themeMode = localStorage.getItem(STORAGE_KEYS_UI.THEME_MODE)
  return themeMode === 'dark' ? 'dark' : 'light'
}

export function getTheme(): ThemeOptions {
  const mode = getThemeModeFromLocalStorage()
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
