import { DialogContentText, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'

import { AlertLottie } from '../lottie/alert.lottie'
import { CustomDialogContent } from './custom-content.dialog'

// import { ERROR_MSG } from '@dx/config-shared';

type DialogErrorType = {
  message?: string
  windowHeight: number
}

export const DialogError: React.FC<DialogErrorType> = ({ message, windowHeight }) => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <CustomDialogContent
      isMobileWidth={SM_BREAK}
      windowHeight={windowHeight}
    >
      <AlertLottie />
      <DialogContentText
        align="center"
        color="default"
        id="dialog-error"
        margin="20px 0 0"
        variant="h6"
      >
        {/* <span>
          { ERROR_MSG }
        </span>
        <br />
        <br /> */}
        {message || ''}
      </DialogContentText>
    </CustomDialogContent>
  )
}
