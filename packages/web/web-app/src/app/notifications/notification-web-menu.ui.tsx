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
  component?: React.ElementType
}>(() => ({
  '& .MuiList-root': {
    padding: 0,
  },
  maxHeight: '80vh',
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
