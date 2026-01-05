import type { Components } from '@mui/material'

import { WEB_APP_COLOR_PALETTE } from '../../mui.palette'
import { listItemButtonOverridesCommon, listItemOverridesCommon } from '../common/list-common'

export const listItemOverridesLight: Components['MuiListItem'] = {
  ...listItemOverridesCommon,
}

export const listItemButtonOverridesLight: Components['MuiListItemButton'] = {
  ...listItemButtonOverridesCommon,
  styleOverrides: {
    ...listItemButtonOverridesCommon?.styleOverrides,
    root: {
      // @ts-expect-error - is an object
      ...listItemButtonOverridesCommon?.styleOverrides?.root,
      '&&.Mui-selected': {
        backgroundColor: WEB_APP_COLOR_PALETTE.HIGHTLIGHT[50],
      },
    },
  },
}
