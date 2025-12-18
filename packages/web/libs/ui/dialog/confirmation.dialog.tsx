// import DialogTitle from '@mui/material/DialogTitle';
// import Box from '@mui/material/Box';
import { useMediaQuery, useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
// import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText'
import React, { type ReactElement } from 'react'

// import Zoom from '@mui/material/Zoom';

import { CancelLottie } from '../lottie/cancel.lottie'
import { QuestionMarkLottie } from '../lottie/question-mark.lottie'
import { SuccessLottie } from '../lottie/success.lottie'
import { CustomDialogContent } from './custom-content.dialog'
import { DialogWrapper } from './ui-wrapper.dialog'

type ConfirmationDialogProps = {
  okText?: string
  cancelText?: string
  bodyMessage?: string
  bodyMessageHtml?: React.ReactNode
  // bodyMessageHtml?: DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  noAwait?: boolean
  title?: string
  onComplete(confirmation?: boolean): void
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  okText,
  cancelText,
  bodyMessage,
  bodyMessageHtml,
  noAwait,
  title,
  onComplete,
}): ReactElement => {
  const [showLottieInitial, _setShowLottieInitial] = React.useState<boolean>(true)
  const [showLottieCancel, setShowLottieCancel] = React.useState<boolean>(false)
  const [showLottieSuccess, setShowLottieSuccess] = React.useState<boolean>(false)
  const [messageText, setMessageText] = React.useState<string>(bodyMessage || '')
  const theme = useTheme()
  const smBreak = useMediaQuery(theme.breakpoints.down('sm'))

  const handleClose = (): void => {
    onComplete(false)
  }

  const handleConfirmation = (): void => {
    if (!noAwait) {
      setTimeout(() => onComplete(true), 500)
    }
  }

  const handleCancel = (): void => {
    setMessageText('Cancelling')
    setShowLottieCancel(true)
  }

  const handleClickConfirm = (): void => {
    setMessageText(okText || 'Ok')
    setShowLottieSuccess(true)
    if (noAwait) {
      onComplete(true)
    }
  }

  return (
    <DialogWrapper>
      {/* <DialogTitle style={{ textAlign: 'center' }} >{title || APP_NAME}</DialogTitle> */}
      <CustomDialogContent
        isMobileWidth={smBreak}
        windowHeight={window.innerHeight}
      >
        {showLottieInitial && !(showLottieCancel || showLottieSuccess) && <QuestionMarkLottie />}
        {showLottieCancel && <CancelLottie complete={handleClose} />}
        {showLottieSuccess && <SuccessLottie complete={handleConfirmation} />}
        <DialogContentText
          align="center"
          id="confirm-dialog-description"
          margin="0 0 20px"
          variant="h6"
        >
          {messageText || 'Are you sure?'}
        </DialogContentText>
        {bodyMessageHtml}
      </CustomDialogContent>

      {!(showLottieCancel || showLottieSuccess) && (
        <DialogActions
          style={{
            justifyContent: smBreak ? 'center' : 'flex-end',
          }}
        >
          {cancelText && (
            <Button
              onClick={handleCancel}
              variant="outlined"
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleClickConfirm}
            variant="contained"
          >
            {okText || 'OK'}
          </Button>
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
