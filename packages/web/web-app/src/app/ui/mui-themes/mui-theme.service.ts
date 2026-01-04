import type { ThemeOptions } from '@mui/material/styles'

import { STORAGE_KEYS_UI } from '@dx3/web-libs/ui/ui.consts'

import { typographyOverridesCommon } from './components/common/typography-common'
import { getComponentOverrides } from './components/mui-component-override.service'
import { muiThemePalette, WEB_APP_COLOR_PALETTE } from './mui-palette.theme'

function getThemeModeFromLocalStorage() {
  const themeMode = localStorage.getItem(STORAGE_KEYS_UI.THEME_MODE)
  return themeMode === 'dark' ? 'dark' : 'light'
}

export function getTheme(): ThemeOptions {
  const mode = getThemeModeFromLocalStorage()
  if (mode === 'light') {
    return {
      components: getComponentOverrides('light'),
      palette: {
        ...muiThemePalette,
        background: {
          default: WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT.DEFAULT,
          paper: WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT.PAPER,
        },
        mode: 'light',
      },
      typography: typographyOverridesCommon,
    }
  } else {
    return {
      components: getComponentOverrides('dark'),
      palette: {
        ...muiThemePalette,
        background: {
          default: WEB_APP_COLOR_PALETTE.BACKGROUND.DARK.DEFAULT,
          paper: WEB_APP_COLOR_PALETTE.BACKGROUND.DARK.PAPER,
        },
        mode: 'dark',
      },
      typography: typographyOverridesCommon,
    }
  }
}
