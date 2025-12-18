import { useMediaQuery, useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import type React from 'react'

import { AlertLottie } from '../lottie/alert.lottie'
import { CustomDialogContent } from './custom-content.dialog'

type DialogAlertType = {
  buttonText?: string
  message?: string
  closeDialog: () => void
  windowHeight: number
}

export const DialogAlert: React.FC<DialogAlertType> = (props) => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <CustomDialogContent
      isMobileWidth={SM_BREAK}
      windowHeight={props.windowHeight}
    >
      <AlertLottie />
      <DialogContentText
        align="center"
        color="default"
        id="dialog-api-alert"
        margin="20px 0 0"
        variant="body1"
      >
        {props.message || 'Something went wrong.'}
      </DialogContentText>
      <DialogActions>
        <Button
          onClick={props.closeDialog}
          variant="contained"
        >
          {props.buttonText || 'OK'}
        </Button>
      </DialogActions>
    </CustomDialogContent>
  )
}
