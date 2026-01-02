import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'

export const LoginForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  marginBottom: 0,
  minHeight: '200px',
  width: '100%',
}))

export const Logo = styled('img')(({ theme }) => ({
  margin: '25 0',
  maxWidth: '224px',
}))

export const AuthTypeContainer = styled(Box)<{
  component?: React.ElementType
}>((_props) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
}))

export const AuthTypeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{
  active: boolean
}>((props) => ({
  '& .MuiChip-label': {
    color: props.active ? 'white' : undefined,
    fontSize: '1.25em',
  },
  height: '36px',
  padding: '16px 0',
  width: '136px',
}))
