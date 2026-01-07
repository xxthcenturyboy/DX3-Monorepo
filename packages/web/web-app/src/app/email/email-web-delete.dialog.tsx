// import DialogTitle from '@mui/material/DialogTitle';
import { Button, useTheme } from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import React, { type ReactElement } from 'react'
import { BeatLoader } from 'react-spinners'

import type { EmailType } from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { CancelLottie } from '@dx3/web-libs/ui/lottie/cancel.lottie'
import { QuestionMarkLottie } from '@dx3/web-libs/ui/lottie/question-mark.lottie'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { useI18n, useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../ui/store/ui-web.selector'
import { useDeleteEmailProfileMutation } from './email-web.api'

type DeleteEmailDialogProps = {
  closeDialog: () => void
  emailItem?: EmailType
  emailDataCallback: (email: EmailType) => void
}

export const DeleteEmailDialog: React.FC<DeleteEmailDialogProps> = (props): ReactElement => {
  const { emailItem } = props
  const [showLottieInitial] = React.useState(true)
  const [showLottieCancel, setShowLottieCancel] = React.useState(false)
  const [showLottieSuccess, setShowLottieSuccess] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [bodyMessage, setBodyMessage] = React.useState('')
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const theme = useTheme()
  const { t } = useI18n()
  const strings = useStrings(['CANCEL', 'CANCELING', 'CLOSE', 'DELETE', 'EMAIL_DELETED'])
  const [
    requestDeleteEmail,
    {
      data: _deleteEmailResponse,
      error: deleteEmailError,
      isLoading: isLoadingDeleteEmail,
      isSuccess: deleteEmailSuccess,
      isUninitialized: deleteEmailUninitialized,
    },
  ] = useDeleteEmailProfileMutation()

  React.useEffect(() => {
    if (emailItem && !showLottieCancel && !showLottieSuccess && !showLottieError) {
      setBodyMessage(
        t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THE_EMAIL', {
          email: emailItem.email,
          label: emailItem.label,
        }),
      )
    }
  })

  React.useEffect(() => {
    if (!isLoadingDeleteEmail && !deleteEmailUninitialized) {
      if (!deleteEmailError) {
        setShowLottieError(false)
        setShowLottieSuccess(true)
        setBodyMessage(strings.EMAIL_DELETED)
      } else {
        setShowLottieError(true)
        if ('error' in deleteEmailError) {
          setBodyMessage(deleteEmailError.error)
        }
      }
    }
  }, [isLoadingDeleteEmail, deleteEmailError, deleteEmailUninitialized])

  React.useEffect(() => {
    if (
      deleteEmailSuccess &&
      props.emailDataCallback &&
      typeof props.emailDataCallback === 'function' &&
      emailItem
    ) {
      props.emailDataCallback(emailItem)
    }
  }, [deleteEmailSuccess])

  const reset = (): void => {
    setShowLottieCancel(false)
    setShowLottieSuccess(false)
    setShowLottieError(false)
    setBodyMessage('')
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

  const handleDelete = async (): Promise<void> => {
    try {
      if (emailItem) {
        await requestDeleteEmail(emailItem.id)
      }
    } catch (err) {
      logger.error((err as Error).message, err)
    }
  }

  const renderLottie = (): React.ReactElement => {
    if (showLottieInitial) {
      if (!(showLottieCancel || showLottieError || showLottieSuccess)) {
        return <QuestionMarkLottie />
      }
    }

    if (showLottieCancel) {
      return <CancelLottie complete={() => sleep(200).then(() => handleClose())} />
    }

    if (showLottieSuccess) {
      return <SuccessLottie complete={() => sleep(500).then(() => handleClose())} />
    }

    return <QuestionMarkLottie />
  }

  const showActions = (): boolean => {
    return !(showLottieCancel || showLottieSuccess)
  }

  return (
    <DialogWrapper maxWidth={400}>
      {showLottieError ? (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <DialogError
            message={bodyMessage}
            windowHeight={windowHeight}
          />
        </CustomDialogContent>
      ) : (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          {renderLottie()}
          <DialogContentText
            align="center"
            id="confirm-dialog-description"
            margin="20px 0 0"
            variant="h6"
          >
            {bodyMessage}
          </DialogContentText>
        </CustomDialogContent>
      )}
      {showActions() && (
        <DialogActions
          style={{
            justifyContent: isMobileWidth ? 'center' : 'flex-end',
          }}
        >
          <Button
            onClick={() => {
              if (showLottieError) {
                handleClose()
                return
              }

              setBodyMessage(strings.CANCELING)
              setShowLottieCancel(true)
            }}
            variant="outlined"
          >
            {showLottieError ? strings.CLOSE : strings.CANCEL}
          </Button>
          {!showLottieError && (
            <Button
              onClick={handleDelete}
              variant="contained"
            >
              {isLoadingDeleteEmail ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="2px"
                  size={16}
                />
              ) : (
                strings.DELETE
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
