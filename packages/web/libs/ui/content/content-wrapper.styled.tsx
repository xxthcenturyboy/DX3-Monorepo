import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: theme.spacing(3),
}))
