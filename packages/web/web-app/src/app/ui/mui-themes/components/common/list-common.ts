import type { Components } from '@mui/material/styles'

import { BORDER_RADIUS, BOX_SHADOW } from '@dx3/web-libs/ui/ui.consts'

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
