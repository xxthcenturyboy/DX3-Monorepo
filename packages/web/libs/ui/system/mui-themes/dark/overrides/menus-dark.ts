import type { Components } from '@mui/material'

import { APP_COLOR_PALETTE } from '../../../ui.consts'
import { toolbarItemOverridesCommon } from '../../common-overrides/menus-common'

export const toolbarItemOverridesDark: Components['MuiToolbar'] = {
  ...toolbarItemOverridesCommon,
  styleOverrides: {
    ...toolbarItemOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...toolbarItemOverridesCommon?.styleOverrides?.root,
      '.toolbar-app-name': {
        color: APP_COLOR_PALETTE.DARK.SECONDARY[50],
      },
      '.toolbar-icons': {
        color: APP_COLOR_PALETTE.DARK.SECONDARY[50],
      },
    },
  },
}
