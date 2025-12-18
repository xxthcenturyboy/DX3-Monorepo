import { Box, LinearProgress, type LinearProgressProps, Typography } from '@mui/material'
import type React from 'react'

type UploadProgressComponentPropsType = {
  value: number
} & LinearProgressProps

export const UploadProgressComponent: React.FC<UploadProgressComponentPropsType> = (props) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <Box
        sx={{
          mr: 1,
          width: '100%',
        }}
      >
        <LinearProgress
          variant="determinate"
          {...props}
        />
      </Box>
      <Box
        sx={{
          minWidth: 35,
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
          }}
          variant="body2"
        >
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}
