import { useTheme } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type React from 'react'
import { BeatLoader } from 'react-spinners'

type GlobalAwaiterPropstype = {
  open: boolean
  message?: string
}

export const GlobalAwaiter: React.FC<GlobalAwaiterPropstype> = (props) => {
  const { message, open } = props
  const theme = useTheme()

  return (
    <Backdrop
      open={open}
      style={{
        textAlign: 'center',
        zIndex: 10000,
      }}
    >
      <Box>
        <BeatLoader
          color={theme.palette.primary.main}
          margin="2px"
          size={30}
        />
        {!!message && (
          <Box
            style={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50px',
              margin: '40px 20px',
              opacity: 0.75,
              padding: '20px',
            }}
          >
            <Typography
              align="center"
              color="white"
              margin="0 20px"
              variant="h5"
            >
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    </Backdrop>
  )
}
