import { List, ListItem } from '@mui/material'
import { grey } from '@mui/material/colors'
import Menu from '@mui/material/Menu'
import { styled } from '@mui/material/styles'

import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

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

export const StyledNotificationsList = styled(List)<{
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
  backgroundColor: props.isunread === 'true' ? themeColors.notificationHighlight : 'inherit',
  border: `1px solid ${grey[300]}`,
  maxHeight: '108px',
  minHeight: '75px',
  minWidth: MIN_WIDTH,
}))

export const StyledNotificationActionArea = styled('div')<{
  component?: React.ElementType
}>(() => ({
  backgroundColor: grey[200],
  border: `1px solid ${grey[300]}`,
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
  backgroundColor: grey[100],
  borderBottom: `1px solid ${grey[300]}`,
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

export const StyledBottomItem = styled(ListItem)<{ component?: React.ElementType }>({
  backgroundColor: grey[100],
  display: 'flex',
  justifyContent: 'flex-end',
})

export const StyledContentWrapper = styled('div')<{ component?: React.ElementType }>({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: '53px',
  overflow: 'auto',
})
