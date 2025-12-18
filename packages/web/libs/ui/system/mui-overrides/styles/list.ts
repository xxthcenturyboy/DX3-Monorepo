import { yellow } from '@mui/material/colors'

import { BORDER_RADIUS, BOX_SHADOW } from './common'

export const listItemOverrides = {
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
}

export const listItemButtonOverrides = {
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
}
