import { useMediaQuery, useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import React, { type ReactElement } from 'react'

import { sleep } from '@dx3/utils-shared'

import { CancelLottie } from '../lottie/cancel.lottie'
import { QuestionMarkLottie } from '../lottie/question-mark.lottie'
import { SuccessLottie } from '../lottie/success.lottie'
import { CustomDialogContent } from './custom-content.dialog'
import { DialogWrapper } from './ui-wrapper.dialog'

type ConfirmationDialogProps = {
  okText?: string
  cancellingText: string
  cancelText?: string
  bodyMessage?: string
  bodyMessageHtml?: React.ReactNode
  noAwait?: boolean
  title?: string
  onComplete(confirmation?: boolean): void
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  okText,
  cancellingText,
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

  const resetState = async (): Promise<void> => {
    sleep(1000).then(() => {
      setShowLottieCancel(false)
      setShowLottieSuccess(false)
      setMessageText(bodyMessage || '')
    })
  }

  const handleClose = (): void => {
    onComplete(false)
    resetState()
  }

  const handleConfirmation = (): void => {
    onComplete(true)
    resetState()
  }

  const handleClickCancel = (): void => {
    setMessageText(cancellingText || 'Canceling')
    if (noAwait) {
      handleClose()
      return
    }

    setShowLottieCancel(true)
  }

  const handleClickConfirm = (): void => {
    setMessageText(okText || 'Ok')
    if (noAwait) {
      handleConfirmation()
      return
    }

    setShowLottieSuccess(true)
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
          margin="40px 0 12px"
          variant="h6"
        >
          {messageText || 'Confirm this action.'}
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
              onClick={handleClickCancel}
              variant="outlined"
            >
              {cancelText || 'cancel'}
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
