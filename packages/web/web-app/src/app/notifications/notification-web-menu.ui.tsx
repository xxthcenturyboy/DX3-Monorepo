import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Menu from '@mui/material/Menu'
import { styled } from '@mui/material/styles'

import { WEB_APP_COLOR_PALETTE } from '../ui/mui-themes/mui.palette'

const MIN_WIDTH = '358px'

export const StyledNotificationMenu = styled(Menu)<{
  mobilebreak: string
  component?: React.ElementType
}>((props) => ({
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiPaper-root': {
    maxHeight: '100%',
    width: props.mobilebreak === 'true' ? '100%' : '420px',
  },
  left: props.mobilebreak === 'true' ? '0px' : '-30px',
  top: '30px',
}))

export const StyledNotificationsList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'maxHeight',
})<{
  maxHeight?: string
  component?: React.ElementType
}>((props) => ({
  '& .MuiList-root': {
    padding: 0,
  },
  maxHeight: props.maxHeight,
  overflowX: 'hidden',
}))

export const StyledNotification = styled(ListItem)<{
  isunread: string
  component?: React.ElementType
}>((props) => ({
  alignItems: 'flex-start',
  backgroundColor: `${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[900] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[100]}`,
  border: `1px solid ${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300]}`,
  maxHeight: '108px',
  minHeight: '75px',
  minWidth: MIN_WIDTH,
}))

export const StyledNotificationActionArea = styled('div')<{
  component?: React.ElementType
}>((props) => ({
  backgroundColor:
    props.theme.palette.mode === 'dark'
      ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800]
      : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300],
  border: `1px solid ${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300]}`,
  minHeight: '30px',
  minWidth: MIN_WIDTH,
}))

export const StyledList = styled(List)<{ component?: React.ElementType }>({
  '& .MuiList-root': {
    flexGrow: 1,
    height: '100%',
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },
  '& .MuiListItemIcon-root': {
    marginRight: 16,
    minWidth: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 0,
  paddingTop: 0,
})

export const CloseViewItem = styled(ListItem)<{
  justifcation: string
  component?: React.ElementType
}>((props) => ({
  backgroundColor:
    props.theme.palette.mode === 'dark'
      ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800]
      : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300],
  borderBottom: `1px solid ${props.theme.palette.mode === 'dark' ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800] : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300]}`,
  display: 'flex',
  justifyContent: props.justifcation || 'flex-end',
  minHeight: '48px',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}))

export const StyledBottomContainer = styled(List)<{
  component?: React.ElementType
}>((_props) => ({
  bottom: 0,
  marginTop: 'auto',
  paddingBottom: '0',
  position: 'fixed',
  width: '100%',
}))

export const StyledBottomItem = styled(ListItem)<{ component?: React.ElementType }>((props) => ({
  backgroundColor:
    props.theme.palette.mode === 'dark'
      ? WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[800]
      : WEB_APP_COLOR_PALETTE.BACKGROUND.BASE[300],
  display: 'flex',
  justifyContent: 'flex-end',
}))

export const StyledContentWrapper = styled('div')<{ component?: React.ElementType }>({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: '53px',
  overflow: 'auto',
})
