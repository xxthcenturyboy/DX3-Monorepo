import { styled as muiStyled } from '@mui/material/styles'

export const AddPhoneForm = muiStyled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  marginBottom: 0,
  minHeight: '200px',
  width: '100%',
}))
