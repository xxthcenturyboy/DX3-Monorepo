import type { ThemeOptions } from '@mui/material/styles'

import { WEB_APP_COLOR_PALETTE } from './mui.palette'

export const muiLightPalette: ThemeOptions['palette'] = {
  background: {
    default: WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT.DEFAULT,
    paper: WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT.PAPER,
  },
  brandColor: {
    main: WEB_APP_COLOR_PALETTE.BRAND[600],
  },
  error: {
    main: WEB_APP_COLOR_PALETTE.ERROR[700],
  },
  highlight: {
    light: WEB_APP_COLOR_PALETTE.HIGHTLIGHT[50],
    main: WEB_APP_COLOR_PALETTE.HIGHTLIGHT[200],
  },
  info: {
    main: WEB_APP_COLOR_PALETTE.INFO[300],
  },
  mode: 'light',
  primary: {
    main: WEB_APP_COLOR_PALETTE.PRIMARY[600],
  },
  secondary: {
    main: WEB_APP_COLOR_PALETTE.SECONDARY[700],
  },
  success: {
    main: WEB_APP_COLOR_PALETTE.SUCCESS[700],
  },
  tertiary: {
    main: WEB_APP_COLOR_PALETTE.TERTIARY[700],
  },
  warning: {
    main: WEB_APP_COLOR_PALETTE.WARNING[700],
  },
}
