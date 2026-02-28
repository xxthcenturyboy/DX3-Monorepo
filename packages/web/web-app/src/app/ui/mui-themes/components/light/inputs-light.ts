import type { Components } from '@mui/material/styles'

import { BORDER_RADIUS } from '@dx3/web-libs/ui/ui.consts'

import { WEB_APP_COLOR_PALETTE } from '../../mui.palette'
import {
  checkboxOverridesCommon,
  filledInputOverridesCommon,
  outlinedInputOverridesCommon,
  textFieldOverridesCommon,
} from '../common/inputs-common'

export const filledInputOverridesLight: Components['MuiFilledInput'] = {
  ...filledInputOverridesCommon,
  styleOverrides: {
    ...filledInputOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...filledInputOverridesCommon?.styleOverrides?.root,
      '&.Mui-focused': {
        backgroundColor: WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[50],
        border: `1px solid ${WEB_APP_COLOR_PALETTE.PRIMARY[700]}`,
      },
    },
  },
}

export const outlinedInputOverridesLight: Components['MuiOutlinedInput'] = {
  ...outlinedInputOverridesCommon,
  styleOverrides: {
    ...outlinedInputOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...outlinedInputOverridesCommon?.styleOverrides?.root,
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          border: `1px solid ${WEB_APP_COLOR_PALETTE.PRIMARY[700]}`,
        },
        backgroundColor: WEB_APP_COLOR_PALETTE.SECONDARY[50],
      },
      borderRadius: BORDER_RADIUS,
    },
  },
}

export const checkboxOverridesLight: Components['MuiCheckbox'] = {
  ...checkboxOverridesCommon,
  styleOverrides: {
    ...checkboxOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an ojbect
      ...checkboxOverridesCommon?.styleOverrides?.root,
      '&.Mui-checked': {
        color: WEB_APP_COLOR_PALETTE.SECONDARY[700],
      },
      '&.Mui-checked-error': {
        '&.Mui-checked': {
          color: WEB_APP_COLOR_PALETTE.ERROR[500],
        },
        color: WEB_APP_COLOR_PALETTE.ERROR[200],
      },
      color: WEB_APP_COLOR_PALETTE.PRIMARY[200],
    },
  },
}

export const textFieldOverridesLight: Components['MuiTextField'] = {
  ...textFieldOverridesCommon,
  styleOverrides: {
    ...textFieldOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...textFieldOverridesCommon?.styleOverrides?.root,
      '&:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[100]} inset`, // Your color
        WebkitTextFillColor: '#000000', // Your text color
      },
    },
  },
}
