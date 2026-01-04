import type { Components } from '@mui/material'

import { WEB_APP_COLOR_PALETTE } from '../../mui-palette.theme'
import { toolbarItemOverridesCommon } from '../common/menus-common'

export const toolbarItemOverridesDark: Components['MuiToolbar'] = {
  ...toolbarItemOverridesCommon,
  styleOverrides: {
    ...toolbarItemOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...toolbarItemOverridesCommon?.styleOverrides?.root,
      '.toolbar-app-name': {
        color: WEB_APP_COLOR_PALETTE.SECONDARY[700],
      },
      '.toolbar-icons': {
        color: WEB_APP_COLOR_PALETTE.SECONDARY[700],
      },
    },
  },
}
