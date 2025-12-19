import { Box, DialogContent } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import type React from 'react'

// import DialogTitle from '@mui/material/DialogTitle';

import { ErrorLottie } from '../lottie/error.lottie'
import { DialogWrapper } from './ui-wrapper.dialog'

type DialogApiErrorPropsType = {
  closeDialog: () => void
  isMobileWidth: boolean
  message?: string
  open: boolean
  windowHeight: number
} & Partial<DialogProps>

export const DialogApiError: React.FC<DialogApiErrorPropsType> = (props) => {
  const { closeDialog, isMobileWidth, message, open, windowHeight } = props
  const height = isMobileWidth ? windowHeight - 140 : undefined

  return (
    <Dialog
      {...{
        fullScreen: isMobileWidth,
        keepMounted: true,
        maxWidth: false,
        // keepMounted: false,
        // disableEnforceFocus: true,
        onClose: (_event, reason) => {
          // Close on backdrop click or escape key
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            closeDialog()
          }
        },
        open,
        props,
      }}
    >
      <Box
        style={{
          padding: '10px 24px',
        }}
      >
        <DialogWrapper>
          {/* <DialogTitle style={{ textAlign: 'center' }} >{APP_NAME}</DialogTitle> */}
          <DialogContent
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: height,
              justifyContent: 'space-around',
              minHeight: '300px',
              minWidth: '360px',
              overflow: 'visible',
            }}
          >
            {open && <ErrorLottie />}
            <DialogContentText
              align="center"
              color="error"
              id="dialog-api-alert"
              margin="20px 0 0"
              variant="body1"
            >
              {message || 'Your request could not be completed.'}
            </DialogContentText>
          </DialogContent>

          <DialogActions
            style={{
              justifyContent: isMobileWidth ? 'center' : 'flex-end',
            }}
          >
            <Button
              onClick={closeDialog}
              variant="contained"
            >
              OK
            </Button>
          </DialogActions>
        </DialogWrapper>
      </Box>
    </Dialog>
  )
}
