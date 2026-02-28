import type { Components } from '@mui/material/styles'

import { WEB_APP_COLOR_PALETTE } from '../../mui.palette'
import { listItemButtonOverridesCommon, listItemOverridesCommon } from '../common/list-common'

export const listItemOverridesDark: Components['MuiListItem'] = {
  ...listItemOverridesCommon,
}

export const listItemButtonOverridesDark: Components['MuiListItemButton'] = {
  ...listItemButtonOverridesCommon,
  styleOverrides: {
    ...listItemButtonOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...listItemButtonOverridesCommon?.styleOverrides?.root,
      '&&.Mui-selected': {
        backgroundColor: WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[900],
      },
    },
  },
}
