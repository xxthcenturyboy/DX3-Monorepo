import { blueGrey, green, lightBlue, orange, red } from '@mui/material/colors'
import type { ThemeOptions } from '@mui/material/styles'

import { APP_COLOR_PALETTE } from '../../ui.consts'
import { typographyOverridesCommon } from '../common-overrides/typography-common'
import { dialogOverridesDark } from './overrides/dialog-dark'
import {
  checkboxOverridesDark,
  filledInputOverridesDark,
  outlinedInputOverridesDark,
  textFieldOverridesDark,
} from './overrides/inputs-dark'
import { listItemButtonOverridesDark, listItemOverridesDark } from './overrides/list-dark'
import { toolbarItemOverridesDark } from './overrides/menus-dark'

export const muiThemeDarkColors = {
  background: APP_COLOR_PALETTE.DARK.BACKGROUND[800],
  blueGrey: blueGrey[300],
  error: red[700],
  info: lightBlue[700],
  notificationHighlight: 'aliceblue',
  primary: APP_COLOR_PALETTE.DARK.PRIMARY[900],
  secondary: APP_COLOR_PALETTE.DARK.SECONDARY[200],
  success: green[800],
  warning: orange[700],
}

export const muiThemeDark: ThemeOptions = {
  components: {
    MuiCheckbox: checkboxOverridesDark,
    MuiDialog: dialogOverridesDark,
    MuiFilledInput: filledInputOverridesDark,
    MuiListItem: listItemOverridesDark,
    MuiListItemButton: listItemButtonOverridesDark,
    MuiOutlinedInput: outlinedInputOverridesDark,
    MuiTextField: textFieldOverridesDark,
    MuiToolbar: toolbarItemOverridesDark,
  },
  palette: {
    error: {
      main: muiThemeDarkColors.error,
    },
    info: {
      main: muiThemeDarkColors.info,
    },
    mode: 'dark',
    primary: {
      main: muiThemeDarkColors.primary,
    },
    secondary: {
      main: muiThemeDarkColors.secondary,
    },
    success: {
      main: muiThemeDarkColors.success,
    },
    warning: {
      main: muiThemeDarkColors.warning,
    },
  },
  typography: typographyOverridesCommon,
}
