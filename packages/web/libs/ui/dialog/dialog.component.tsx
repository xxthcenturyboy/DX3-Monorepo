import { Box } from '@mui/material'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import type React from 'react'

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
        onBackdropClick: () => closeDialog(),
        onClose: () => closeDialog(),
        open,
        props,
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
