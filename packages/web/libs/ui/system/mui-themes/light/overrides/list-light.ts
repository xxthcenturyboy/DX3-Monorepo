import type { Components } from '@mui/material'
import { yellow } from '@mui/material/colors'

import {
  listItemButtonOverridesCommon,
  listItemOverridesCommon,
} from '../../common-overrides/list-common'

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
        backgroundColor: yellow[200],
      },
    },
  },
}
