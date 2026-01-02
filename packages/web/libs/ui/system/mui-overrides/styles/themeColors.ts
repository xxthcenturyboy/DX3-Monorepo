import { blueGrey, green, lightBlue, orange, red } from '@mui/material/colors'

import { APP_COLOR_PALETTE } from '../../ui.consts'

export const themeColors = {
  blueGrey: blueGrey[300],
  dark: {
    background: APP_COLOR_PALETTE.DARK.BACKGROUND[800],
    primary: APP_COLOR_PALETTE.DARK.PRIMARY[500],
    secondary: APP_COLOR_PALETTE.DARK.SECONDARY[500],
  },
  error: red[700],
  info: lightBlue[700],
  light: {
    background: APP_COLOR_PALETTE.LIGHT.BACKGROUND[100],
    primary: APP_COLOR_PALETTE.DARK.PRIMARY[500],
    secondary: APP_COLOR_PALETTE.DARK.SECONDARY[500],
    // background: '#fbfbfb'
  },
  notificationHighlight: 'aliceblue',
  // primary: '#09152F',
  // secondary: '#FCC711',
  primary: APP_COLOR_PALETTE.PRIMARY[900],
  secondary: APP_COLOR_PALETTE.SECONDARY[700],
  success: green[800],
  warning: orange[700],
}
