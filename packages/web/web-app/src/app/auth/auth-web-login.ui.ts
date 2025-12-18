import { styled as muiStyled } from '@mui/material/styles'

export const Form = muiStyled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  marginBottom: 0,
  minHeight: '200px',
  width: '100%',
}))

export const Logo = muiStyled('img')(({ theme }) => ({
  margin: '25 0',
  maxWidth: '224px',
}))
