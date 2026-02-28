import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { styled, type Theme } from '@mui/material/styles'

import { BORDER_RADIUS } from '@dx3/web-libs/ui/ui.consts'

export const StyledTopControlRowContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  margin: '16px 0 0',
  width: '100%',
}))

export const StyledControlItem = styled(Button)(
  ({ theme, selected }: { theme?: Theme; selected: boolean }) => ({
    '&:first-of-type': {
      border: `1px solid ${theme?.palette.primary.main}`,
      borderBottomLeftRadius: BORDER_RADIUS,
      borderRight: 'hidden !important',
      borderTopLeftRadius: BORDER_RADIUS,
    },
    '&:hover': {
      backgroundColor: !selected && theme?.palette.secondary.main,
      cursor: 'pointer',
    },
    '&:last-of-type': {
      border: `1px solid ${theme?.palette.primary.main} !important`,
      borderBottomRightRadius: BORDER_RADIUS,
      borderRight: `1px solid ${theme?.palette.primary.main} !important`,
      borderTopRightRadius: BORDER_RADIUS,
    },
    backgroundColor: selected ? theme?.palette.secondary.main : theme?.palette.common.white,
    // boxShadow: BOX_SHADOW,
    border: `1px solid ${theme?.palette.primary.main}`,
    borderRadius: '0px',
    borderRight: 'hidden !important',
    color: selected ? theme?.palette.primary.dark : theme?.palette.primary.main,
    fontSize: '0.725rem',
    fontWeight: selected ? 600 : undefined,
    height: '32px',
    marginBottom: '-2px',
    minWidth: '146px',
    padding: '4px 2px 2px',
    textAlign: 'center',
  }),
)
