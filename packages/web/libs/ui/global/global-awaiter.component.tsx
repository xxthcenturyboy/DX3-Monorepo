import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type React from 'react'
import { BeatLoader } from 'react-spinners'

import { getThemePalette } from '../system/mui-themes/mui-theme.service'

type GlobalAwaiterPropstype = {
  open: boolean
  message?: string
}

export const GlobalAwaiter: React.FC<GlobalAwaiterPropstype> = (props) => {
  const { message, open } = props
  const themeColors = getThemePalette()

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
          color={themeColors.secondary}
          margin="2px"
          size={30}
        />
        {!!message && (
          <Box
            style={{
              backgroundColor: themeColors.primary,
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
