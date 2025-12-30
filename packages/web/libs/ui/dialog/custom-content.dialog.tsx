import { DialogContent, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'

type CustomDialogContentType = {
  isMobileWidth: boolean
  justifyContent?: string
  maxWidth?: string
  children?: React.ReactNode
  windowHeight: number
}

export const CustomDialogContent: React.FC<CustomDialogContentType> = (props) => {
  const { isMobileWidth, justifyContent, maxWidth, children, windowHeight } = props
  const theme = useTheme()
  const smBreak = useMediaQuery(theme.breakpoints.down('sm'))
  const height = isMobileWidth ? windowHeight - 140 : undefined

  return (
    <DialogContent
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: height,
        justifyContent: justifyContent || 'space-around',
        maxWidth: maxWidth || '400px',
        minHeight: '360px',
        minWidth: smBreak ? '' : '320px',
        overflow: 'visible',
        padding: 0,
      }}
    >
      {children}
    </DialogContent>
  )
}
