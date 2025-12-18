import { List, ListItem } from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

import { DRAWER_WIDTH } from '@dx3/web-libs/ui/system/mui-overrides/mui.theme'

export const ListNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiListItemIcon-root': {
    marginRight: 16,
    minWidth: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
  flexGrow: 1,
  height: '100%',
  margin: 0,
  paddingTop: 0,
})

export const CloseMenuItem = styled(ListItem)<{
  component?: React.ElementType
}>((_props) => ({
  backgroundColor: grey[100],
  borderBottom: `1px solid ${grey[300]}`,
  display: 'flex',
  justifyContent: 'flex-end',
  minHeight: '48px',
}))

export const StyledBottomContainer = styled(List)<{
  mobilebreak: string
  component?: React.ElementType
}>((props) => ({
  bottom: 0,
  marginTop: 'auto',
  paddingBottom: '0',
  position: 'fixed',
  width: props.mobilebreak === 'true' ? '100%' : DRAWER_WIDTH,
}))

export const StyledBottomItem = styled(ListItem)<{ component?: React.ElementType }>({
  backgroundColor: grey[100],
  display: 'flex',
  justifyContent: 'center',
})
