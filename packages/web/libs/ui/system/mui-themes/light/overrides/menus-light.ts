import type { Components } from '@mui/material'

import { APP_COLOR_PALETTE } from '../../../ui.consts'
import { toolbarItemOverridesCommon } from '../../common-overrides/menus-common'

export const toolbarItemOverridesLight: Components['MuiToolbar'] = {
  ...toolbarItemOverridesCommon,
  styleOverrides: {
    ...toolbarItemOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...toolbarItemOverridesCommon?.styleOverrides?.root,
      '.toolbar-app-name': {
        color: APP_COLOR_PALETTE.SECONDARY[700],
      },
      '.toolbar-icons': {
        color: APP_COLOR_PALETTE.SECONDARY[700],
      },
    },
  },
}
