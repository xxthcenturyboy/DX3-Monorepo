import { BORDER_RADIUS } from './common'
import { APP_COLOR_PALETTE } from './themeColors'

export const filledInputSyleOverrides = {
  root: {
    '&.Mui-focused': {
      backgroundColor: APP_COLOR_PALETTE.SECONDARY[50],
      border: `1px solid ${APP_COLOR_PALETTE.SECONDARY[700]}`,
    },
    border: '1px solid transparent',
    borderRadius: BORDER_RADIUS,
  },
}

export const outlinedInputSyleOverrides = {
  root: {
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${APP_COLOR_PALETTE.SECONDARY[700]}`,
      },
      backgroundColor: APP_COLOR_PALETTE.SECONDARY[50],
    },
    borderRadius: BORDER_RADIUS,
  },
}

export const filledInputDefaults = {
  disableUnderline: true,
}

export const outlinedInputInputDefaults = {
  // notched: true
}

export const checkboxStyleOverrides = {
  root: {
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
}
