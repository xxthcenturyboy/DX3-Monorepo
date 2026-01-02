import type { Components } from '@mui/material'

import { APP_COLOR_PALETTE } from '../../../ui.consts'
import {
  listItemButtonOverridesCommon,
  listItemOverridesCommon,
} from '../../common-overrides/list-common'

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
        backgroundColor: APP_COLOR_PALETTE.DARK.BACKGROUND[800],
      },
    },
  },
}
