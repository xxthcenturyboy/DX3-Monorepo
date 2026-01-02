import { blue, blueGrey, green, grey, lightBlue, orange, red, yellow } from '@mui/material/colors'

import { APP_PREFIX } from '@dx3/models-shared'

export const APP_COLOR_PALETTE = {
  BLUE: blue,
  BLUE_GREY: blueGrey,
  DARK: {
    BACKGROUND: grey,
    PRIMARY: yellow,
    SECONDARY: blueGrey,
  },
  GREEN: green,
  INFO: lightBlue,
  LIGHT: {
    BACKGROUND: grey,
    PRIMARY: blueGrey,
    SECONDARY: yellow,
  },
  ORANGE: orange,
  PRIMARY: blueGrey,
  RED: red,
  SECONDARY: yellow,
}

export const BORDER_RADIUS = '6px'
export const BOX_SHADOW =
  '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)'
export const DRAWER_WIDTH = 300
export const FADE_TIMEOUT_DUR = 500
export const MEDIA_BREAK = {
  MENU: 1080,
  MOBILE: 600,
}
export const MODAL_ROOT_ELEM_ID = 'modal-root'
export const STORAGE_KEYS_UI = {
  MENU_STATE: `${APP_PREFIX}:MENU_STATE`,
  THEME_MODE: `${APP_PREFIX}:THEME_MODE`,
}
export const TIMEOUT_DUR_200 = 200
export const TIMEOUT_DUR_500 = 500
export const TIMEOUT_DUR_1000 = 1000
