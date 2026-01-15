import { Box } from '@mui/material'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import type React from 'react'

import { TIMEOUT_DUR_500 } from '../ui.consts'
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
        sx: {
          '& .MuiDialog-paper': {
            borderBottomLeftRadius: isMobileWidth ? '0px' : '24px',
            borderBottomRightRadius: isMobileWidth ? '0px' : '24px',
            borderTopLeftRadius: isMobileWidth ? '16px' : '24px',
            borderTopRightRadius: isMobileWidth ? '16px' : '24px',
            bottom: isMobileWidth ? '0px' : 'auto',
            height: isMobileWidth ? '96%' : 'auto',
            position: isMobileWidth ? 'fixed' : 'relative',
          },
          backdropFilter: open ? 'blur(5px)' : undefined,
        },
      }}
    >
      <Box
        display={'flex'}
        justifyContent={'center'}
        overflow={'hidden'}
        padding={'10px 24px'}
        sx={(theme) => {
          return {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : theme.palette.background.default,
            height: '100%',
          }
        }}
      >
        {body}
      </Box>
    </Dialog>
  )
}
