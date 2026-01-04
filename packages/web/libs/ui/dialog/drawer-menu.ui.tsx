import { List, ListItem } from '@mui/material'
import { styled } from '@mui/material/styles'

export const CloseViewItem = styled(ListItem)<{
  justifcation: string
  component?: React.ElementType
}>((props) => ({
  backgroundColor: props.theme.palette.background.default,
  borderBottom: `1px solid ${props.theme.palette.background.paper}`,
  display: 'flex',
  justifyContent: props.justifcation || 'flex-end',
  minHeight: '48px',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}))

export const StyledBottomContainer = styled(List)<{
  width: string
  component?: React.ElementType
}>((props) => ({
  bottom: 0,
  marginTop: 'auto',
  paddingBottom: '0',
  position: 'fixed',
  width: props.width,
}))

export const StyledBottomItem = styled(ListItem)<{
  component?: React.ElementType
  justifcation?: string
}>((props) => ({
  backgroundColor:
    props.theme.palette.mode === 'dark'
      ? props.theme.darken(props.theme.palette.background.paper, 0.25)
      : props.theme.darken(props.theme.palette.background.paper, 0.1),
  display: 'flex',
  justifyContent: props.justifcation || 'flex-end',
  width: '100%',
}))

export const StyledContentWrapper = styled('div')<{ component?: React.ElementType }>({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: '53px',
  overflow: 'auto',
})

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
