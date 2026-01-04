import {
  blue,
  // blueGrey,
  green,
  grey,
  lightBlue,
  // orange,
  purple,
  red,
  yellow,
} from '@mui/material/colors'
import type { ThemeOptions } from '@mui/material/styles'

export const WEB_APP_COLOR_PALETTE = {
  BACKGROUND: {
    BASE: grey,
    DARK: {
      DEFAULT: grey[600],
      PAPER: grey[800],
    },
    LIGHT: {
      DEFAULT: grey[50],
      PAPER: grey[200],
    },
  },
  BRAND: blue,
  ERROR: red,
  HIGHTLIGHT: lightBlue,
  INFO: blue,
  PRIMARY: blue,
  SECONDARY: yellow,
  SUCCESS: green,
  TERTIARY: purple,
  WARNING: yellow,
}

export const muiThemePalette: ThemeOptions['palette'] = {
  brandColor: {
    main: WEB_APP_COLOR_PALETTE.BRAND[600],
  },
  error: {
    main: WEB_APP_COLOR_PALETTE.ERROR[700],
  },
  highlight: {
    main: WEB_APP_COLOR_PALETTE.HIGHTLIGHT[200],
  },
  info: {
    main: WEB_APP_COLOR_PALETTE.INFO[300],
  },
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
