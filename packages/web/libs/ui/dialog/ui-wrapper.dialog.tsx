import { Box } from '@mui/material'
import type React from 'react'

type DialogWrapperType = {
  children?: React.ReactNode
  maxWidth?: number
}

export const DialogWrapper: React.FC<DialogWrapperType> = ({ children, maxWidth }) => {
  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      style={{
        maxWidth: maxWidth ? `${maxWidth}px` : '',
      }}
    >
      {children}
    </Box>
  )
}
