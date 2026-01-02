import type { Components } from '@mui/material'

import { APP_COLOR_PALETTE, BORDER_RADIUS } from '../../../ui.consts'
import {
  checkboxOverridesCommon,
  filledInputOverridesCommon,
  outlinedInputOverridesCommon,
  textFieldOverridesCommon,
} from '../../common-overrides/inputs-common'

export const filledInputOverridesDark: Components['MuiFilledInput'] = {
  ...filledInputOverridesCommon,
  styleOverrides: {
    ...filledInputOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...filledInputOverridesCommon?.styleOverrides?.root,
      '&.Mui-focused': {
        backgroundColor: APP_COLOR_PALETTE.DARK.BACKGROUND[600],
        border: `1px solid ${APP_COLOR_PALETTE.DARK.SECONDARY[700]}`,
      },
    },
  },
}

export const outlinedInputOverridesDark: Components['MuiOutlinedInput'] = {
  ...outlinedInputOverridesCommon,
  styleOverrides: {
    ...outlinedInputOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...outlinedInputOverridesCommon?.styleOverrides?.root,
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          border: `1px solid ${APP_COLOR_PALETTE.SECONDARY[700]}`,
        },
        backgroundColor: APP_COLOR_PALETTE.DARK.BACKGROUND[600],
      },
      borderRadius: BORDER_RADIUS,
    },
  },
}

export const checkboxOverridesDark: Components['MuiCheckbox'] = {
  ...checkboxOverridesCommon,
  styleOverrides: {
    ...checkboxOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an ojbect
      ...checkboxOverridesCommon?.styleOverrides?.root,
      '&.Mui-checked': {
        color: APP_COLOR_PALETTE.SECONDARY[700],
      },
      '&.Mui-checked-error': {
        '&.Mui-checked': {
          color: APP_COLOR_PALETTE.RED[500],
        },
        color: APP_COLOR_PALETTE.RED[200],
      },
      color: APP_COLOR_PALETTE.PRIMARY[200],
    },
  },
}

export const textFieldOverridesDark: Components['MuiTextField'] = {
  ...textFieldOverridesCommon,
  styleOverrides: {
    ...textFieldOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...textFieldOverridesCommon?.styleOverrides?.root,
      '&:-webkit-autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${APP_COLOR_PALETTE.DARK.BACKGROUND[600]} inset`, // Your color
        WebkitTextFillColor: '#000000', // Your text color
      },
    },
  },
}
