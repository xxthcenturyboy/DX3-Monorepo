import { Box } from '@mui/material'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import type React from 'react'

import { TIMEOUT_DUR_500 } from '../system/ui.consts'
import { SlideTransition, ZoomTransition } from './dialog.ui'

type CustomDialogPropsType = {
  body: React.ReactNode
  closeDialog: () => void
  isMobileWidth: boolean
  open: boolean
} & Partial<DialogProps>

export const CustomDialog: React.FC<CustomDialogPropsType> = (props) => {
  const { body, closeDialog, isMobileWidth, open } = props

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
        slotProps: {
          transition: {
            timeout: TIMEOUT_DUR_500,
          },
        },
        slots: { transition: isMobileWidth ? SlideTransition : ZoomTransition },
      }}
    >
      <Box
        display={'flex'}
        justifyContent={'center'}
        overflow={'hidden'}
        padding={'10px 24px'}
      >
        {body}
      </Box>
    </Dialog>
  )
}
