/** biome-ignore-all lint/correctness/useExhaustiveDependencies: do not require exhaustive deps */
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import React, { type ReactElement } from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

import {
  type CreateEmailPayloadType,
  EMAIL_LABEL,
  type EmailType,
  OTP_LENGTH,
} from '@dx3/models-shared'
import { regexEmail, sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { useOtpRequestEmailMutation } from '../auth/auth-web.api'
import { AuthWebOtpEntry } from '../auth/auth-web-otp.component'
import { WebConfigService } from '../config/config-web.service'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../ui/store/ui-web.selector'
import { selectUserEmails } from '../user/profile/user-profile-web.selectors'
import { useAddEmailMutation, useCheckEmailAvailabilityMutation } from './email-web.api'
import { AddEmailForm } from './email-web.ui'

type AddEmailPropsType = {
  closeDialog: () => void
  userId: string
  emailDataCallback: (email: EmailType) => void
}

export const AddEmailDialog: React.FC<AddEmailPropsType> = (props): ReactElement => {
  const [allSucceeded, setAllSucceeded] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [hasSentOtp, setHasSentOtp] = React.useState(false)
  const [isEmailAvailable, setIsEmailAvailable] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [label, setLabel] = React.useState(EMAIL_LABEL.PERSONAL)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const userEmails = useAppSelector((state) => selectUserEmails(state))
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const [
    requestCheckAvailability,
    {
      data: _checkAvailabilityResponse,
      error: checkAvailabilityError,
      isLoading: isLoadingCheckAvailability,
      isSuccess: checkAvailabilitySuccess,
      isUninitialized: checkAvailabilityUninitialized,
      reset: resetCheckAvailability,
    },
  ] = useCheckEmailAvailabilityMutation()
  const [
    requestAddEmail,
    {
      data: addEmailResponse,
      error: addEmailError,
      isLoading: isLoadingAddEmail,
      isSuccess: addEmailSuccess,
      isUninitialized: addEmailUninitialized,
      reset: resetAddEmail,
    },
  ] = useAddEmailMutation()
  const [
    sendOtpCode,
    {
      data: sendOtpResponse,
      error: sendOtpError,
      isLoading: isLoadingSendOtp,
      isSuccess: sendOtpSuccess,
      isUninitialized: sendOtpUninitialized,
      reset: resetSendOtp,
    },
  ] = useOtpRequestEmailMutation()

  const reset = () => {
    resetAddEmail()
    resetCheckAvailability()
    resetSendOtp()
    setAllSucceeded(false)
    setShowLottieError(false)
    setHasSentOtp(false)
    setIsEmailAvailable(false)
    setEmail('')
    setLabel(EMAIL_LABEL.PERSONAL)
    setErrorMessage('')
    setOtp('')
    setIsDefault(false)
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

  const handleCreate = async (): Promise<void> => {
    if (!submitDisabled() && props.userId) {
      if (!isEmailAvailable && !hasSentOtp) {
        try {
          await requestCheckAvailability(email)
        } catch (err) {
          logger.error((err as Error).message, err)
        }
      }

      if (hasSentOtp && otp) {
        try {
          const payload: CreateEmailPayloadType = {
            code: otp,
            def: userEmails.length === 0 || isDefault,
            email,
            label,
            userId: props.userId,
          }

          await requestAddEmail(payload)
        } catch (err) {
          logger.error((err as Error).message, err)
        }
      }
    }
  }

  React.useEffect(() => {
    if (!props.userId) {
      handleClose()
    }
  }, [props.userId])

  React.useEffect(() => {
    if (!isLoadingAddEmail && !addEmailUninitialized) {
      if (!addEmailError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        if ('error' in addEmailError) {
          setErrorMessage(addEmailError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [isLoadingAddEmail, addEmailError, addEmailUninitialized])

  React.useEffect(() => {
    if (!isLoadingCheckAvailability && !checkAvailabilityUninitialized) {
      if (!checkAvailabilityError) {
        setShowLottieError(false)
        setIsEmailAvailable(true)
      } else {
        if ('error' in checkAvailabilityError) {
          setErrorMessage(checkAvailabilityError.error)
        }
        setShowLottieError(true)
        setIsEmailAvailable(false)
      }
    }
  }, [isLoadingCheckAvailability, checkAvailabilityError, checkAvailabilityUninitialized])

  React.useEffect(() => {
    if (!isLoadingSendOtp) {
      if (!sendOtpError) {
        setShowLottieError(false)
      } else {
        if ('error' in sendOtpError) {
          setErrorMessage(sendOtpError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [isLoadingSendOtp, sendOtpError])

  React.useEffect(() => {
    if (
      addEmailSuccess &&
      props.emailDataCallback &&
      typeof props.emailDataCallback === 'function'
    ) {
      props.emailDataCallback({
        default: userEmails.length === 0 || isDefault,
        email,
        id: addEmailResponse.id,
        isDeleted: false,
        isVerified: true,
        label,
      })
    }
  }, [addEmailSuccess, addEmailResponse?.id])

  React.useEffect(() => {
    if (checkAvailabilitySuccess && sendOtpUninitialized) {
      sendOtpCode({ email }).catch((err: Error) => logger.error(err.message, err))
    }
  }, [checkAvailabilitySuccess, email, sendOtpUninitialized])

  React.useEffect(() => {
    if (sendOtpSuccess) {
      setHasSentOtp(true)
      const code = sendOtpResponse?.code
      if (WebConfigService.isDev() && code) {
        toast.info(`DEV MODE: OTP Code: ${code}`, {
          autoClose: 5000,
          closeButton: true,
          closeOnClick: false,
          draggable: true,
          hideProgressBar: true,
          position: 'bottom-center',
          theme: 'colored',
        })
      }
    }
  }, [sendOtpSuccess])

  React.useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      void handleCreate()
    }
  }, [otp])

  const submitDisabled = (): boolean => {
    if (!(email && label) || !regexEmail.test(email) || isLoadingAddEmail || isLoadingSendOtp) {
      return true
    }

    if (hasSentOtp && otp.length < 6) {
      return true
    }

    return false
  }

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value)
  }

  const handleChangeLabel = (event: SelectChangeEvent<string>): void => {
    setLabel(event.target.value)
  }

  const renderFormContent = (): React.ReactElement => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={SM_BREAK ? 'flex-start' : 'space-around'}
        windowHeight={windowHeight}
      >
        <AddEmailForm
          name="form-add-email"
          onSubmit={handleCreate}
        >
          <FormControl
            margin="normal"
            sx={{
              minWidth: 300,
            }}
          >
            <InputLabel htmlFor="input-email">Email</InputLabel>
            <OutlinedInput
              autoCapitalize="off"
              autoCorrect="off"
              fullWidth
              id="input-email"
              label={'Email'}
              name="input-email"
              onChange={handleChangeEmail}
              placeholder={'Email'}
              type="email"
              value={email || ''}
            />
          </FormControl>
          <FormControl
            disabled={isLoadingAddEmail}
            margin="normal"
            variant="outlined"
          >
            <InputLabel htmlFor="label-select">Label</InputLabel>
            <Select
              id="label-select"
              label="Label"
              name="label-select"
              notched
              onChange={handleChangeLabel}
              value={label || ''}
            >
              {Object.values(EMAIL_LABEL).map((labelValue) => {
                return (
                  <MenuItem
                    key={labelValue}
                    value={labelValue}
                  >
                    {labelValue}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDefault}
                onChange={() => setIsDefault(!isDefault)}
                size="large"
              />
            }
            label="Set as Default"
          />
        </AddEmailForm>
      </CustomDialogContent>
    )
  }

  return (
    <DialogWrapper maxWidth={400}>
      <DialogTitle
        style={{
          textAlign: 'center',
        }}
      >
        {`New Email`}
      </DialogTitle>
      {!allSucceeded && !showLottieError && !hasSentOtp && renderFormContent()}
      {!allSucceeded && !showLottieError && isEmailAvailable && hasSentOtp && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <AuthWebOtpEntry
            method="EMAIL"
            onCompleteCallback={setOtp}
          />
        </CustomDialogContent>
      )}
      {showLottieError && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <DialogError
            message={errorMessage}
            windowHeight={windowHeight}
          />
        </CustomDialogContent>
      )}
      {allSucceeded && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <SuccessLottie complete={() => setTimeout(() => handleClose(), 500)} />
        </CustomDialogContent>
      )}
      {!allSucceeded && (
        <DialogActions
          style={{
            justifyContent: isMobileWidth ? 'center' : 'flex-end',
          }}
        >
          <Button
            disabled={isLoadingAddEmail}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? 'Close' : 'Cancel'}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleCreate}
              variant="contained"
            >
              {isLoadingAddEmail || isLoadingCheckAvailability || isLoadingSendOtp ? (
                <BeatLoader
                  color={themeColors.secondary}
                  margin="2px"
                  size={16}
                />
              ) : (
                'Create'
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
