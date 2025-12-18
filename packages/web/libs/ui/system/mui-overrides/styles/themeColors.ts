import { blue, blueGrey, green, grey, lightBlue, orange, red, yellow } from '@mui/material/colors'

export const APP_COLOR_PALETTE = {
  BLUE: blue,
  BLUE_GREY: blueGrey,
  DARK: {
    PRIMARY: yellow,
    SECONDARY: blueGrey,
  },
  GREEN: green,
  INFO: lightBlue,
  LIGHT: {
    BACKGROUND: grey,
  },
  ORANGE: orange,
  PRIMARY: blueGrey,
  RED: red,
  SECONDARY: yellow,
}

export const themeColors = {
  blueGrey: blueGrey[300],
  dark: {
    primary: APP_COLOR_PALETTE.DARK.PRIMARY[500],
    secondary: APP_COLOR_PALETTE.DARK.SECONDARY[500],
  },
  error: red[700],
  info: lightBlue[700],
  light: {
    background: APP_COLOR_PALETTE.LIGHT.BACKGROUND[100],
    // background: '#fbfbfb'
  },
  notificationHighlight: 'aliceblue',
  // primary: '#09152F',
  // secondary: '#FCC711',
  primary: APP_COLOR_PALETTE.PRIMARY[900],
  secondary: APP_COLOR_PALETTE.SECONDARY[800],
  success: green[800],
  warning: orange[700],
}
