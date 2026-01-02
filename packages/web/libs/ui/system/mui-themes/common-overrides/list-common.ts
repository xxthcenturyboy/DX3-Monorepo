import type { Components } from '@mui/material'
import { yellow } from '@mui/material/colors'

import { BORDER_RADIUS, BOX_SHADOW } from '../../ui.consts'

export const listItemOverridesCommon: Components['MuiListItem'] = {
  defaultProps: {},
  styleOverrides: {
    root: {
      '&&.menu-item': {
        borderRadius: BORDER_RADIUS,
        boxShadow: BOX_SHADOW,
        margin: '10px 0',
      },
      '&&.privilegeset-item': {
        borderRadius: BORDER_RADIUS,
        boxShadow: BOX_SHADOW,
        margin: '10px 0',
      },
    },
  },
}

export const listItemButtonOverridesCommon: Components['MuiListItemButton'] = {
  defaultProps: {},
  styleOverrides: {
    root: {
      '&&.Mui-selected': {
        backgroundColor: yellow[200],
      },
      '&&.menu-item': {
        borderRadius: BORDER_RADIUS,
        boxShadow: BOX_SHADOW,
        margin: '10px 0',
      },
      '&&.privilegeset-item': {
        borderRadius: BORDER_RADIUS,
        boxShadow: BOX_SHADOW,
        margin: '10px 0',
      },
    },
  },
}
