import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import {
  Box,
  Button,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  useTheme,
} from '@mui/material'
import { type CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import React from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'

import { regexEmail } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { DEFAULT_STRINGS, useStrings } from '../i18n'
import { PhoneNumberInput } from '../phone/phone-input/phone-web-input.component'
import { showDevOtpCode } from '../ui/ui-web-otp-dev.toast'
import { useOtpRequestEmailMutation, useOtpRequestPhoneMutation } from './auth-web.api'
import { AuthTypeChip, AuthTypeContainer, LoginForm } from './auth-web-login.ui'
import { AuthWebRequestOtpEntry } from './auth-web-request-otp-entry.component'

type AuthWebRequestOtpLoggedOutPropsType = {
  hasCallbackError: boolean
  onCompleteCallback: (value: string, code: string, region?: string) => void
  setHasSentOtp?: (value: boolean) => void
}

export const AuthWebRequestOtpLoggedOut: React.FC<AuthWebRequestOtpLoggedOutPropsType> =
  React.forwardRef((props, ref) => {
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [countryData, setCountryData] = React.useState<CountryData | null>(null)
    const [hasSentOtp, setHasSentOtp] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')
    const [selectedMethod, setSelectedMethod] = React.useState<'EMAIL' | 'PHONE'>('PHONE')
    const strings = useStrings(['EMAIL', 'PHONE', 'SEND_CODE'])
    const theme = useTheme()
    const [
      requestOtpCodeEmail,
      {
        data: sendOtpEmailResponse,
        error: sendOtpEmailError,
        isLoading: isLoadingSendOtpEmail,
        isSuccess: sendOtpEmailSuccess,
        isUninitialized: _sendOtpEmailUninitialized,
      },
    ] = useOtpRequestEmailMutation()
    const [
      requestOtpCodePhone,
      {
        data: sendOtpPhoneResponse,
        error: sendOtpPhoneError,
        isLoading: isLoadingSendOtpPhone,
        isSuccess: sendOtpPhoneSuccess,
        isUninitialized: _sendOtpPhoneUninitialized,
      },
    ] = useOtpRequestPhoneMutation()

    React.useEffect(() => {
      if (!isLoadingSendOtpEmail && !isLoadingSendOtpPhone) {
        if (!sendOtpEmailError && !sendOtpPhoneError) {
          setErrorMessage('')
          return
        }

        if (sendOtpEmailError && 'error' in sendOtpEmailError) {
          let msg = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG
          if ('localizedMessage' in sendOtpEmailError && sendOtpEmailError.localizedMessage) {
            msg = sendOtpEmailError.localizedMessage
          } else if ('error' in sendOtpEmailError) {
            msg = sendOtpEmailError.error
          }
          setErrorMessage(msg)
        }

        if (sendOtpPhoneError && 'error' in sendOtpPhoneError) {
          let msg = DEFAULT_STRINGS.OOPS_SOMETHING_WENT_WRONG
          if ('localizedMessage' in sendOtpPhoneError && sendOtpPhoneError.localizedMessage) {
            msg = sendOtpPhoneError.localizedMessage
          } else if ('error' in sendOtpPhoneError) {
            msg = sendOtpPhoneError.error
          }
          setErrorMessage(msg)
        }
      }
    }, [isLoadingSendOtpEmail, isLoadingSendOtpPhone, sendOtpEmailError, sendOtpPhoneError])

    React.useEffect(() => {
      if (sendOtpEmailSuccess || sendOtpPhoneSuccess) {
        setHasSentOtp(true)
        props.setHasSentOtp?.(true)
        showDevOtpCode(sendOtpPhoneResponse?.code || sendOtpEmailResponse?.code)
      }
    }, [sendOtpEmailSuccess, sendOtpPhoneSuccess])

    const phoneSubmitButtonDisabled = (): boolean => {
      const countryCode = countryData?.countryCode
        ? (countryData.countryCode.toUpperCase() as CountryCode)
        : 'US'

      if (
        !(phone && countryData) ||
        !isValidPhoneNumber(phone, countryCode) ||
        isLoadingSendOtpPhone
      ) {
        return true
      }

      return false
    }

    const handleSendOtpCode = async (event: React.FormEvent): Promise<void> => {
      event.preventDefault()
      event.stopPropagation()

      if (selectedMethod === 'EMAIL' && email) {
        await requestOtpCodeEmail({ email }).catch((err) =>
          logger.error((err as Error).message, err),
        )
      }

      if (selectedMethod === 'PHONE' && phone) {
        await requestOtpCodePhone({
          phone,
          regionCode: (countryData as CountryData).countryCode,
        }).catch((err) => logger.error((err as Error).message, err))
      }
    }

    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>): void => {
      setEmail(event.target.value)
    }

    const renderPhoneInput = (): React.ReactElement => {
      return (
        <Fade
          in={true}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid>
            <LoginForm
              name="form-enter-phone"
              onSubmit={handleSendOtpCode}
            >
              <FormControl
                disabled={phoneSubmitButtonDisabled()}
                margin="normal"
                style={{ minWidth: 300 }}
                variant="outlined"
              >
                <PhoneNumberInput
                  defaultCountry="us"
                  defaultValue=""
                  disabled={false}
                  inputId="input-user-phone"
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
              <Button
                disabled={phoneSubmitButtonDisabled()}
                fullWidth
                onClick={handleSendOtpCode}
                sx={{
                  marginTop: '12px',
                }}
                type="submit"
                variant="contained"
              >
                {isLoadingSendOtpPhone ? (
                  <BeatLoader
                    color={theme.palette.secondary.main}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  strings.SEND_CODE
                )}
              </Button>
            </LoginForm>
          </Grid>
        </Fade>
      )
    }

    const renderEmailInput = (): React.ReactElement => {
      return (
        <Fade
          in={true}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid>
            <LoginForm
              name="form-enter-email"
              onSubmit={handleSendOtpCode}
            >
              <FormControl
                disabled={isLoadingSendOtpEmail}
                margin="normal"
                style={{ minWidth: 300 }}
                variant="outlined"
              >
                <InputLabel htmlFor="input-email">{strings.EMAIL}</InputLabel>
                <OutlinedInput
                  autoCapitalize="off"
                  autoComplete="email"
                  autoCorrect="off"
                  fullWidth
                  id="input-email"
                  label={strings.EMAIL}
                  name="input-email"
                  onChange={handleChangeEmail}
                  placeholder={strings.EMAIL}
                  type="email"
                  value={email || ''}
                />
              </FormControl>
              <Button
                disabled={isLoadingSendOtpEmail || !regexEmail.test(email)}
                fullWidth
                onClick={handleSendOtpCode}
                sx={{
                  marginTop: '12px',
                }}
                type="submit"
                variant="contained"
              >
                {isLoadingSendOtpEmail ? (
                  <BeatLoader
                    color={theme.palette.secondary.main}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  strings.SEND_CODE
                )}
              </Button>
            </LoginForm>
          </Grid>
        </Fade>
      )
    }

    const renderOtpEntry = (): React.ReactElement => {
      return (
        <AuthWebRequestOtpEntry
          hasCallbackError={props.hasCallbackError}
          onClickStartOver={() => {
            setErrorMessage('')
            setHasSentOtp(false)
            props.setHasSentOtp?.(false)
          }}
          onCompleteCallback={(code: string) => {
            const value = selectedMethod === 'PHONE' ? phone : email
            props.onCompleteCallback(value, code, countryData?.countryCode)
          }}
          selectedMethod={selectedMethod}
        />
      )
    }

    return (
      <Fade
        in={true}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Box
          ref={ref}
          width="100%"
        >
          <Grid
            alignItems="center"
            container
            direction="column"
            justifyContent="flex-start"
            spacing={2}
          >
            <AuthTypeContainer>
              <AuthTypeChip
                active={selectedMethod === 'PHONE'}
                color="primary"
                disabled={hasSentOtp}
                icon={<PhoneIcon />}
                label={strings.PHONE}
                onClick={() => setSelectedMethod('PHONE')}
                variant={selectedMethod === 'PHONE' ? 'filled' : 'outlined'}
              />
              <AuthTypeChip
                active={selectedMethod === 'EMAIL'}
                color="primary"
                disabled={hasSentOtp}
                icon={<EmailIcon />}
                label={strings.EMAIL}
                onClick={() => setSelectedMethod('EMAIL')}
                variant={selectedMethod === 'EMAIL' ? 'filled' : 'outlined'}
              />
            </AuthTypeContainer>
            {selectedMethod === 'PHONE' && !hasSentOtp && !errorMessage && renderPhoneInput()}
            {selectedMethod === 'EMAIL' && !hasSentOtp && !errorMessage && renderEmailInput()}
            {hasSentOtp && !errorMessage && renderOtpEntry()}
            {!!errorMessage && (
              <DialogError
                message={errorMessage}
                windowHeight={400}
              />
            )}
          </Grid>
        </Box>
      </Fade>
    )
  })
