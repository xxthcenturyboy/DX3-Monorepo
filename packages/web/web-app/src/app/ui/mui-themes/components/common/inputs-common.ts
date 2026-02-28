import type { Components } from '@mui/material/styles'

import { BORDER_RADIUS } from '@dx3/web-libs/ui/ui.consts'

export const filledInputOverridesCommon: Components['MuiFilledInput'] = {
  defaultProps: {
    disableUnderline: true,
  },
  styleOverrides: {
    root: {
      border: '1px solid transparent',
      borderRadius: BORDER_RADIUS,
    },
  },
}

export const outlinedInputOverridesCommon: Components['MuiOutlinedInput'] = {
  defaultProps: {},
  styleOverrides: {
    root: {
      borderRadius: BORDER_RADIUS,
    },
  },
}

export const checkboxOverridesCommon: Components['MuiCheckbox'] = {
  defaultProps: {},
  styleOverrides: {},
}

export const textFieldOverridesCommon: Components['MuiTextField'] = {
  defaultProps: {},
  styleOverrides: {},
}
