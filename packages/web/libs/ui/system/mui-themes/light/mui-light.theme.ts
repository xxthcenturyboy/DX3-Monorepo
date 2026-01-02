import { blueGrey, green, lightBlue, orange, red } from '@mui/material/colors'
import type { ThemeOptions } from '@mui/material/styles'

import { APP_COLOR_PALETTE } from '../../ui.consts'
import { typographyOverridesCommon } from '../common-overrides/typography-common'
import { dialogOverridesLight } from './overrides/dialog-light'
import {
  checkboxOverridesLight,
  filledInputOverridesLight,
  outlinedInputOverridesLight,
  textFieldOverridesLight,
} from './overrides/inputs-light'
import { listItemButtonOverridesLight, listItemOverridesLight } from './overrides/list-light'
import { toolbarItemOverridesLight } from './overrides/menus-light'

export const muiThemeLightColors = {
  background: APP_COLOR_PALETTE.LIGHT.BACKGROUND[100],
  blueGrey: blueGrey[300],
  error: red[700],
  info: lightBlue[700],
  notificationHighlight: 'aliceblue',
  primary: APP_COLOR_PALETTE.PRIMARY[900],
  secondary: APP_COLOR_PALETTE.SECONDARY[700],
  success: green[800],
  warning: orange[700],
}

export const muiThemeLight: ThemeOptions = {
  components: {
    MuiCheckbox: checkboxOverridesLight,
    MuiDialog: dialogOverridesLight,
    MuiFilledInput: filledInputOverridesLight,
    MuiListItem: listItemOverridesLight,
    MuiListItemButton: listItemButtonOverridesLight,
    MuiOutlinedInput: outlinedInputOverridesLight,
    MuiTextField: textFieldOverridesLight,
    MuiToolbar: toolbarItemOverridesLight,
  },
  palette: {
    error: {
      main: muiThemeLightColors.error,
    },
    info: {
      main: muiThemeLightColors.info,
    },
    mode: 'light',
    primary: {
      main: muiThemeLightColors.primary,
    },
    secondary: {
      main: muiThemeLightColors.secondary,
    },
    success: {
      main: muiThemeLightColors.success,
    },
    warning: {
      main: muiThemeLightColors.warning,
    },
  },
  typography: typographyOverridesCommon,
}
