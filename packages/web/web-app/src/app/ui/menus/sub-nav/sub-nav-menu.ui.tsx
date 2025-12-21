import { Button, Grid } from '@mui/material'
import { styled, type Theme } from '@mui/material/styles'

import { APP_COLOR_PALETTE, BORDER_RADIUS } from '@dx3/web-libs/ui/system/mui-overrides/styles'

export const StyledTopControlRowContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  margin: '16px 0 0',
  // borderBottom: `1px solid ${APP_COLOR_PALETTE.GREY[400]}`,
  width: '100%',
}))

export const StyledControlItem = styled(Button)(
  ({ theme, selected }: { theme?: Theme; selected: boolean }) => ({
    '&:first-of-type': {
      border: `1px solid ${APP_COLOR_PALETTE.BLUE_GREY[400]}`,
      borderBottomLeftRadius: BORDER_RADIUS,
      borderRight: 'hidden !important',
      borderTopLeftRadius: BORDER_RADIUS,
    },
    '&:hover': {
      backgroundColor: !selected && theme?.palette.secondary.main,
      cursor: 'pointer',
    },
    '&:last-of-type': {
      border: `1px solid ${APP_COLOR_PALETTE.BLUE_GREY[400]} !important`,
      borderBottomRightRadius: BORDER_RADIUS,
      borderRight: `1px solid ${APP_COLOR_PALETTE.BLUE_GREY[400]} !important`,
      borderTopRightRadius: BORDER_RADIUS,
    },
    backgroundColor: selected ? theme?.palette.secondary.main : theme?.palette.common.white,
    // boxShadow: BOX_SHADOW,
    border: `1px solid ${APP_COLOR_PALETTE.BLUE_GREY[400]}`,
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
