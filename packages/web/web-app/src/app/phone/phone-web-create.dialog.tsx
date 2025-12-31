import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import { type CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import React, { type ReactElement } from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'

import {
  type CreatePhonePayloadType,
  OTP_LENGTH,
  PHONE_LABEL,
  type PhoneType,
} from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { useOtpRequestPhoneMutation } from '../auth/auth-web.api'
import { AuthWebOtpEntry } from '../auth/auth-web-otp.component'
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
  const [label, setLabel] = React.useState(PHONE_LABEL.CELL)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
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
    setLabel(PHONE_LABEL.CELL)
    setErrorMessage('')
    setOtp('')
    setIsDefault(false)
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

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
        if ('error' in addPhoneError) {
          setErrorMessage(addPhoneError.error)
        }
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
        if ('error' in checkAvailabilityError) {
          setErrorMessage(checkAvailabilityError.error)
        }
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
        if ('error' in sendOtpError) {
          setErrorMessage(sendOtpError.error)
        }
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
              label="Phone"
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
            <InputLabel htmlFor="label-select">Label</InputLabel>
            <Select
              id="label-select"
              label="Label"
              name="label-select"
              notched
              onChange={handleChangeLabel}
              value={label || ''}
            >
              {Object.values(PHONE_LABEL).map((labelValue) => {
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
        {`New Phone`}
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
          <SuccessLottie complete={() => setTimeout(() => handleClose(), 700)} />
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
            {showLottieError ? 'Close' : 'Cancel'}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleCreate}
              variant="contained"
            >
              {isLoadingAddPhone || isLoadingCheckAvailability || isLoadingSendOtp ? (
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
