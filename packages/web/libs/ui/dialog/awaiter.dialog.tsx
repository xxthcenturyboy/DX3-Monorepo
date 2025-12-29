import { Box, DialogContent } from '@mui/material'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import DialogContentText from '@mui/material/DialogContentText'
import type React from 'react'

import { AwaiterLottie } from '../lottie/awaiter.lottie'
import { TIMEOUT_DUR_500 } from '../system/ui.consts'
import { SlideTransition, ZoomTransition } from './dialog.ui'
import { DialogWrapper } from './ui-wrapper.dialog'

type DialogAwaiterPropsType = {
  isMobileWidth: boolean
  message?: string
  open: boolean
} & Partial<DialogProps>

export const DialogAwaiter: React.FC<DialogAwaiterPropsType> = (props) => {
  const { isMobileWidth, message, open } = props

  return (
    <Dialog
      {...{
        fullScreen: isMobileWidth,
        keepMounted: true,
        maxWidth: false,
        // Prevent closing on backdrop click or escape - user must wait
        onClose: (_event, _reason) => {
          // Do nothing - awaiter dialog cannot be dismissed
        },
        open,
        props,
        slotProps: {
          transition: {
            timeout: TIMEOUT_DUR_500,
          },
        },
        slots: { transition: isMobileWidth ? SlideTransition : ZoomTransition },
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
              justifyContent: 'space-around',
              minHeight: '300px',
              minWidth: '360px',
              overflow: 'visible',
            }}
          >
            {open && <AwaiterLottie />}
            <DialogContentText
              align="center"
              color="default"
              id="dialog-api-alert"
              margin="20px 0 0"
              variant="body1"
            >
              {message || 'Please Standby'}
            </DialogContentText>
          </DialogContent>
        </DialogWrapper>
      </Box>
    </Dialog>
  )
}
