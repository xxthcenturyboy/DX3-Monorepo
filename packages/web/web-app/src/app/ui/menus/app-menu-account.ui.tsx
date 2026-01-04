import { List, ListItem } from '@mui/material'
import Menu from '@mui/material/Menu'
import { styled } from '@mui/material/styles'

import { WEB_APP_COLOR_PALETTE } from '../mui-themes/mui-palette.theme'

export const StyledAccountnMenu = styled(Menu)<{
  mobilebreak: string
  component?: React.ElementType
}>((props) => ({
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiPaper-root': {
    maxHeight: '100%',
    width: props.mobilebreak === 'true' ? '100%' : '200px',
  },
  left: props.mobilebreak === 'true' ? '0px' : '-30px',
  top: '30px',
}))

export const StyledAccountList = styled(List)<{
  component?: React.ElementType
}>(() => ({
  '& .MuiList-root': {
    padding: 0,
  },
  maxHeight: '80vh',
  overflowX: 'hidden',
}))

export const StyledAccountMenuListItem = styled(ListItem)<{
  component?: React.ElementType
}>((props) => ({
  border: `1px solid ${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300]}`,
  cursor: 'pointer',
  height: '48px',
}))

export const StyledAccountActionArea = styled('div')<{
  component?: React.ElementType
}>((props) => ({
  backgroundColor:
    props.theme.palette.mode === 'dark'
      ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800]
      : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300],
  border: `1px solid ${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300]}`,
  minHeight: '20px',
}))
