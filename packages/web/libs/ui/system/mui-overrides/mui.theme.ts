import type { ThemeOptions } from '@mui/material/styles'

import {
  checkboxStyleOverrides,
  dialogOverrides,
  filledInputDefaults,
  filledInputSyleOverrides,
  listItemButtonOverrides,
  listItemOverrides,
  outlinedInputInputDefaults,
  outlinedInputSyleOverrides,
  themeColors,
} from './styles'
import { toolbarItemOverrides } from './styles/menus'

export const DRAWER_WIDTH = 300

export const appTheme: ThemeOptions = {
  components: {
    MuiCheckbox: {
      styleOverrides: checkboxStyleOverrides,
    },
    MuiDialog: {
      styleOverrides: dialogOverrides,
    },
    MuiFilledInput: {
      defaultProps: filledInputDefaults,
      styleOverrides: filledInputSyleOverrides,
    },
    MuiListItem: {
      styleOverrides: listItemOverrides,
    },
    MuiListItemButton: {
      styleOverrides: listItemButtonOverrides,
    },
    MuiOutlinedInput: {
      defaultProps: outlinedInputInputDefaults,
      styleOverrides: outlinedInputSyleOverrides,
    },
    MuiToolbar: {
      styleOverrides: toolbarItemOverrides,
    },
  },
  palette: {
    error: {
      main: themeColors.error,
    },
    info: {
      main: themeColors.info,
    },
    mode: 'light',
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    success: {
      main: themeColors.success,
    },
    warning: {
      main: themeColors.warning,
    },
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif, serif',
  },
}
