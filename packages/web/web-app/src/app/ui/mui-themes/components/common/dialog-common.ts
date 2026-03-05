import type { Components } from '@mui/material/styles'

export const dialogOverridesCommon: NonNullable<Components['MuiDialog']> = {
  defaultProps: {},
  styleOverrides: {
    paper: {
      // borderRadius: '24px',
    },
    root: {
      // backdropFilter: 'blur(5px)', // CAUSES BUGS in webkit
    },
  },
}
