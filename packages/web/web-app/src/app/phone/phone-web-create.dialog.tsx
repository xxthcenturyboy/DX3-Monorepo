import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { type CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import React, { type ReactElement } from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'

import { type CreatePhonePayloadType, OTP_LENGTH, type PhoneType } from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { useOtpRequestPhoneMutation } from '../auth/auth-web.api'
import { AuthWebOtpEntry } from '../auth/auth-web-otp.component'
import { DEFAULT_STRINGS, useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../ui/store/ui-web.selector'
import { showDevOtpCode } from '../ui/ui-web-otp-dev.toast'
import { PhoneNumberInput } from './phone-input/phone-web-input.component'
import { useAddPhoneMutation, useCheckPhoneAvailabilityMutation } from './phone-web.api'
import { AddPhoneForm } from './phone-web.ui'

type AddPhoneDialogProps = {
  closeDialog: () => void
  userId: string
  phoneDataCallback: (phone: PhoneType) => void
}

export const AddPhoneDialog: React.FC<AddPhoneDialogProps> = (props): ReactElement => {
  const [allSucceeded, setAllSucceeded] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [hasSentOtp, setHasSentOtp] = React.useState(false)
  const [isPhoneAvailable, setIsPhoneAvailable] = React.useState(false)
  const [phone, setPhone] = React.useState('')
  const [countryData, setCountryData] = React.useState<CountryData | null>(null)
  const [label, setLabel] = React.useState('')
  const [labels, setLabels] = React.useState<string[]>([])
  const [errorMessage, setErrorMessage] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const theme = useTheme()
  const strings = useStrings([
    'CANCEL',
    'CLOSE',
    'CREATE',
    'EMAIL',
    'LABEL',
    'NEW_PHONE',
    'PERSONAL',
    'PHONE',
    'PHONE_MUST_BE_ABLE_TO_RECEIVE_SMS',
    'SET_AS_DEFAULT',
    'WORK',
  ])
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
  ] = useCheckPhoneAvailabilityMutation()
  const [
    requestAddPhone,
    {
      data: addPhoneResponse,
      error: addPhoneError,
      isLoading: isLoadingAddPhone,
      isSuccess: addPhoneSuccess,
      isUninitialized: addPhoneUninitialized,
      reset: resetAddPhone,
    },
  ] = useAddPhoneMutation()
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
  ] = useOtpRequestPhoneMutation()

  const reset = () => {
    resetAddPhone()
    resetCheckAvailability()
    resetSendOtp()
    setAllSucceeded(false)
    setShowLottieError(false)
    setHasSentOtp(false)
    setIsPhoneAvailable(false)
    setPhone('')
    setCountryData(null)
    setLabel(strings.PERSONAL)
    setErrorMessage('')
    setOtp('')
    setIsDefault(false)
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

  React.useEffect(() => {
    setLabel(strings.PERSONAL)
    setLabels([strings.PERSONAL, strings.WORK])
  }, [])

  React.useEffect(() => {
    if (!props.userId) {
      handleClose()
    }
  }, [props.userId])

  React.useEffect(() => {
    if (!isLoadingAddPhone && !addPhoneUninitialized) {
      if (!addPhoneError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        let msg = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG
        if ('localizedMessage' in addPhoneError && addPhoneError.localizedMessage) {
          msg = addPhoneError.localizedMessage
        } else if ('error' in addPhoneError) {
          msg = addPhoneError.error
        }
        setErrorMessage(msg)
        setShowLottieError(true)
      }
    }
  }, [isLoadingAddPhone, addPhoneError, addPhoneUninitialized])

  React.useEffect(() => {
    if (!isLoadingCheckAvailability && !checkAvailabilityUninitialized) {
      if (!checkAvailabilityError) {
        setShowLottieError(false)
        setIsPhoneAvailable(true)
      } else {
        let msg = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG
        if (
          'localizedMessage' in checkAvailabilityError &&
          checkAvailabilityError.localizedMessage
        ) {
          msg = checkAvailabilityError.localizedMessage
        } else if ('error' in checkAvailabilityError) {
          msg = checkAvailabilityError.error
        }
        setErrorMessage(msg)
        setShowLottieError(true)
        setIsPhoneAvailable(false)
      }
    }
  }, [isLoadingCheckAvailability, checkAvailabilityError, checkAvailabilityUninitialized])

  React.useEffect(() => {
    if (!isLoadingSendOtp) {
      if (!sendOtpError) {
        setShowLottieError(false)
      } else {
        let msg = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG
        if ('localizedMessage' in sendOtpError && sendOtpError.localizedMessage) {
          msg = sendOtpError.localizedMessage
        } else if ('error' in sendOtpError) {
          msg = sendOtpError.error
        }
        setErrorMessage(msg)
        setShowLottieError(true)
      }
    }
  }, [isLoadingSendOtp, sendOtpError])

  React.useEffect(() => {
    if (
      addPhoneSuccess &&
      props.phoneDataCallback &&
      typeof props.phoneDataCallback === 'function'
    ) {
      props.phoneDataCallback({
        countryCode: (countryData as CountryData).countryCode,
        default: isDefault,
        id: addPhoneResponse.id,
        isDeleted: false,
        isSent: true,
        isVerified: true,
        label,
        phone,
        phoneFormatted: addPhoneResponse.phoneFormatted,
      })
    }
  }, [addPhoneSuccess, addPhoneResponse?.id, addPhoneResponse?.phoneFormatted])

  React.useEffect(() => {
    if (checkAvailabilitySuccess && sendOtpUninitialized) {
      sendOtpCode({
        phone,
        regionCode: (countryData as CountryData).countryCode,
      }).catch((err: Error) => logger.error(err.message, err))
    }
  }, [checkAvailabilitySuccess, countryData, phone, sendOtpUninitialized])

  React.useEffect(() => {
    if (sendOtpSuccess) {
      setHasSentOtp(true)
      showDevOtpCode(sendOtpResponse?.code)
    }
  }, [sendOtpSuccess])

  React.useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      void handleCreate()
    }
  }, [otp])

  const submitDisabled = (): boolean => {
    const countryCode = countryData?.countryCode
      ? (countryData.countryCode.toUpperCase() as CountryCode)
      : 'US'
    if (
      !(phone && countryData && label) ||
      !isValidPhoneNumber(phone, countryCode) ||
      isLoadingAddPhone ||
      isLoadingSendOtp
    ) {
      return true
    }

    if (hasSentOtp && otp.length < OTP_LENGTH) {
      return true
    }

    return false
  }

  const handleCreate = async (): Promise<void> => {
    if (!submitDisabled() && props.userId) {
      if (!isPhoneAvailable && !hasSentOtp) {
        try {
          await requestCheckAvailability({
            phone,
            regionCode: (countryData as CountryData).countryCode,
          })
        } catch (err) {
          logger.error((err as Error).message, err)
        }
      }

      if (hasSentOtp && otp) {
        try {
          const payload: CreatePhonePayloadType = {
            code: otp,
            def: isDefault,
            label,
            phone,
            regionCode: (countryData as CountryData).countryCode,
            userId: props.userId,
          }

          await requestAddPhone(payload)
        } catch (err) {
          logger.error((err as Error).message, err)
        }
      }
    }
  }

  const handleChangeLabel = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setLabel(event.target.value)
  }

  const renderFormContent = (): React.ReactElement => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={SM_BREAK ? 'flex-start' : 'space-around'}
        windowHeight={windowHeight}
      >
        <Typography
          align="center"
          color="primary"
          style={{
            margin: '0 72px',
            position: SM_BREAK ? 'relative' : 'absolute',
            top: SM_BREAK ? '0' : '80px',
          }}
          variant="subtitle1"
        >
          {strings.PHONE_MUST_BE_ABLE_TO_RECEIVE_SMS}
        </Typography>
        <AddPhoneForm
          name="form-add-phone"
          onSubmit={handleCreate}
        >
          <FormControl
            disabled={isLoadingAddPhone}
            margin="normal"
            style={{
              minWidth: 300,
            }}
            variant="outlined"
          >
            <PhoneNumberInput
              defaultCountry="us"
              defaultValue=""
              disabled={false}
              inputId="input-new-user-phone"
              label={strings.PHONE}
              onChange={(value: string, data: CountryData) => {
                setPhone(value)
                setCountryData(data)
              }}
              preferredCountries={['us']}
              required={true}
              value={phone || ''}
            />
          </FormControl>
          <FormControl
            disabled={isLoadingAddPhone}
            margin="normal"
            variant="outlined"
          >
            <Autocomplete
              freeSolo
              id="phone-label-autocomplete"
              options={labels.map((option) => option)}
              renderInput={(params) => (
                <>
                  <TextField
                    {...params}
                    label={strings.LABEL}
                    name="phone-label"
                    onChange={handleChangeLabel}
                    value={label}
                    variant="outlined"
                  />
                </>
              )}
            />
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDefault}
                onChange={() => setIsDefault(!isDefault)}
                size="large"
              />
            }
            label={strings.SET_AS_DEFAULT}
          />
        </AddPhoneForm>
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
        {strings.NEW_PHONE}
      </DialogTitle>
      {!allSucceeded && !showLottieError && !hasSentOtp && renderFormContent()}
      {!allSucceeded && !showLottieError && isPhoneAvailable && hasSentOtp && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <AuthWebOtpEntry
            method="PHONE"
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
          <SuccessLottie complete={() => sleep(700).then(() => handleClose())} />
        </CustomDialogContent>
      )}
      {!allSucceeded && (
        <DialogActions
          style={{
            justifyContent: isMobileWidth ? 'center' : 'flex-end',
          }}
        >
          <Button
            disabled={isLoadingAddPhone}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? strings.CLOSE : strings.CANCEL}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleCreate}
              variant="contained"
            >
              {isLoadingAddPhone || isLoadingCheckAvailability || isLoadingSendOtp ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="2px"
                  size={16}
                />
              ) : (
                strings.CREATE
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
