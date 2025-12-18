import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import {
  Box,
  Button,
  Fade,
  FormControl,
  Grid2,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material'
import { type CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import React from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'

import { OTP_LENGTH } from '@dx3/models-shared'
import { regexEmail } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { PhoneNumberInput } from '../phone/phone-input/phone-web-input.component'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectWindowHeight } from '../ui/store/ui-web.selector'
import {
  selectIsUserProfileValid,
  selectUserEmails,
  selectUserPhones,
} from '../user/profile/user-profile-web.selectors'
import {
  useOtpRequestEmailMutation,
  useOtpRequestIdMutation,
  useOtpRequestPhoneMutation,
} from './auth-web.api'
import { Form } from './auth-web-login.ui'
import { AuthWebOtpEntry } from './auth-web-otp.component'

type AuthWebRequestOtpPropsType = {
  hasCallbackError: boolean
  onCompleteCallback: (value: string, code: string, region?: string) => void
}

export const AuthWebRequestOtpEntry: React.FC<AuthWebRequestOtpPropsType> = React.forwardRef(
  (props, ref) => {
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [countryData, setCountryData] = React.useState<CountryData | null>(null)
    const [hasSentOtp, setHasSentOtp] = React.useState(false)
    const [hasFiredCallback, setHasFiredCallback] = React.useState(false)
    const [otp, setOtp] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')
    const [selectedMethod, setSelectedMethod] = React.useState<'EMAIL' | 'PHONE' | ''>('')
    const isProfileValid = useAppSelector((state) => selectIsUserProfileValid(state))
    const userEmails = useAppSelector((state) => selectUserEmails(state))
    const userPhones = useAppSelector((state) => selectUserPhones(state))
    const windowHeight = useAppSelector((state) => selectWindowHeight(state))
    const [
      requestOtpCodeEmail,
      {
        data: _sendOtpEmailResponse,
        error: sendOtpEmailError,
        isLoading: isLoadingSendOtpEmail,
        isSuccess: sendOtpEmailSuccess,
        isUninitialized: _sendOtpEmailUninitialized,
      },
    ] = useOtpRequestEmailMutation()
    const [
      requestOtpCodeId,
      {
        data: _sendOtpIdResponse,
        error: sendOtpIdError,
        isLoading: isLoadingSendOtpId,
        isSuccess: sendOtpIdSuccess,
        isUninitialized: _sendOtpIdUninitialized,
      },
    ] = useOtpRequestIdMutation()
    const [
      requestOtpCodePhone,
      {
        data: _sendOtpPhoneResponse,
        error: sendOtpPhoneError,
        isLoading: isLoadingSendOtpPhone,
        isSuccess: sendOtpPhoneSuccess,
        isUninitialized: _sendOtpPhoneUninitialized,
      },
    ] = useOtpRequestPhoneMutation()

    React.useEffect(() => {
      if (!isLoadingSendOtpEmail && !isLoadingSendOtpPhone && !isLoadingSendOtpId) {
        if (!sendOtpEmailError && !sendOtpPhoneError && !sendOtpIdError) {
          setErrorMessage('')
          return
        }

        if (sendOtpEmailError && 'error' in sendOtpEmailError) {
          setErrorMessage(sendOtpEmailError.error)
        }

        if (sendOtpPhoneError && 'error' in sendOtpPhoneError) {
          setErrorMessage(sendOtpPhoneError.error)
        }

        if (sendOtpIdError && 'error' in sendOtpIdError) {
          setErrorMessage(sendOtpIdError.error)
        }
      }
    }, [
      isLoadingSendOtpEmail,
      isLoadingSendOtpPhone,
      isLoadingSendOtpId,
      sendOtpEmailError,
      sendOtpIdError,
      sendOtpPhoneError,
    ])

    React.useEffect(() => {
      if (sendOtpEmailSuccess || sendOtpPhoneSuccess || sendOtpIdSuccess) {
        setHasSentOtp(true)
      }
    }, [sendOtpEmailSuccess, sendOtpPhoneSuccess, sendOtpIdSuccess])

    React.useEffect(() => {
      if (otp.length === OTP_LENGTH && selectedMethod) {
        const value = selectedMethod === 'PHONE' ? phone : email
        props.onCompleteCallback(value, otp, countryData?.countryCode)
        setHasFiredCallback(true)
      }
    }, [otp, countryData?.countryCode, email, phone, selectedMethod])

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

    const handleSendOtpCodeFromLoggedIn = async (
      method: 'EMAIL' | 'PHONE',
      id: string,
    ): Promise<void> => {
      setSelectedMethod(method)
      await requestOtpCodeId({ id, type: method }).catch((err) =>
        logger.error((err as Error).message, err),
      )
    }

    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>): void => {
      setEmail(event.target.value)
    }

    const renderBackButton = (startOver?: boolean): JSX.Element | null => {
      if (startOver) {
        return (
          <Button
            fullWidth
            onClick={() => {
              setSelectedMethod('')
              setHasSentOtp(false)
              setHasFiredCallback(false)
            }}
            startIcon={<ChevronLeftIcon />}
            style={{
              justifyContent: 'center',
              marginTop: '50px',
            }}
            variant="text"
          >
            Start Over
          </Button>
        )
      }

      return (
        <Button
          fullWidth
          onClick={() => {
            setSelectedMethod('')
            setHasSentOtp(false)
          }}
          startIcon={<ChevronLeftIcon />}
          style={{
            justifyContent: 'start',
          }}
          variant="text"
        >
          Back
        </Button>
      )
    }

    const renderPhoneInput = (): JSX.Element => {
      return (
        <Fade
          in={true}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid2>
            <Form
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
                    color={themeColors.secondary}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  'Send Code'
                )}
              </Button>
            </Form>
            {renderBackButton()}
          </Grid2>
        </Fade>
      )
    }

    const renderEmailInput = (): JSX.Element => {
      return (
        <Fade
          in={true}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid2>
            <Form
              name="form-enter-email"
              onSubmit={handleSendOtpCode}
            >
              <FormControl
                disabled={isLoadingSendOtpEmail}
                margin="normal"
                style={{ minWidth: 300 }}
                variant="outlined"
              >
                <InputLabel htmlFor="input-email">Email</InputLabel>
                <OutlinedInput
                  autoCapitalize="off"
                  autoComplete="off"
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
                    color={themeColors.secondary}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  'Send Code'
                )}
              </Button>
            </Form>
            {renderBackButton()}
          </Grid2>
        </Fade>
      )
    }

    const renderSelectFromLoggedIn = (): JSX.Element => {
      return (
        <>
          <Typography
            style={{
              margin: '0px auto 24px',
            }}
            textAlign="center"
            variant="h6"
          >
            Choose where to send a one-time code.
          </Typography>
          {userPhones.length &&
            userPhones.map((userPhone) => {
              if (userPhone.isVerified) {
                return (
                  <Grid2
                    key={userPhone.id}
                    width={'100%'}
                  >
                    <Button
                      fullWidth
                      onClick={(event: React.FormEvent) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setPhone(userPhone.id)
                        setCountryData({
                          countryCode: userPhone.countryCode,
                          dialCode: '',
                          format: '',
                          name: '',
                        })
                        handleSendOtpCodeFromLoggedIn('PHONE', userPhone.id)
                      }}
                      startIcon={<PhoneIcon />}
                      style={{
                        justifyContent: 'left',
                        paddingLeft: '24px',
                      }}
                      variant="contained"
                    >
                      {userPhone.uiFormatted || userPhone.phone}
                    </Button>
                  </Grid2>
                )
              }
            })}
          {userEmails.length &&
            userEmails.map((userEmail) => {
              if (userEmail.isVerified) {
                return (
                  <Grid2
                    key={userEmail.id}
                    width={'100%'}
                  >
                    <Button
                      fullWidth
                      onClick={(event: React.FormEvent) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setEmail(userEmail.id)
                        setCountryData(null)
                        handleSendOtpCodeFromLoggedIn('EMAIL', userEmail.id)
                      }}
                      startIcon={<EmailIcon />}
                      style={{
                        justifyContent: 'left',
                        paddingLeft: '24px',
                      }}
                      variant="contained"
                    >
                      {userEmail.email}
                    </Button>
                  </Grid2>
                )
              }
            })}
        </>
      )
    }

    const renderSelectFromLoggedout = (): JSX.Element => {
      return (
        <>
          <Grid2 width={'100%'}>
            <Button
              endIcon={<PhoneIcon />}
              fullWidth
              onClick={() => setSelectedMethod('PHONE')}
              variant="contained"
            >
              Get code via phone
            </Button>
          </Grid2>

          <Grid2 width={'100%'}>
            <Button
              endIcon={<EmailIcon />}
              fullWidth
              onClick={() => setSelectedMethod('EMAIL')}
              variant="contained"
            >
              Get code via email
            </Button>
          </Grid2>
        </>
      )
    }

    const renderOtpEntry = (): JSX.Element => {
      return (
        <>
          {!hasFiredCallback && (
            <AuthWebOtpEntry
              method={selectedMethod}
              onCompleteCallback={setOtp}
            />
          )}
          {hasFiredCallback && !props.hasCallbackError && (
            <BeatLoader
              color={themeColors.secondary}
              margin="2px"
              size={24}
            />
          )}
          {hasFiredCallback && props.hasCallbackError && renderBackButton(true)}
        </>
      )
    }

    return (
      <Fade
        in={true}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Box
          ref={ref}
          width={'100%'}
        >
          <Grid2
            alignItems="center"
            container
            direction="column"
            justifyContent="flex-start"
            spacing={2}
          >
            {isProfileValid && !selectedMethod && !errorMessage && renderSelectFromLoggedIn()}
            {!isProfileValid && !selectedMethod && !errorMessage && renderSelectFromLoggedout()}
            {!isProfileValid &&
              selectedMethod === 'PHONE' &&
              !hasSentOtp &&
              !errorMessage &&
              renderPhoneInput()}
            {!isProfileValid &&
              selectedMethod === 'EMAIL' &&
              !hasSentOtp &&
              !errorMessage &&
              renderEmailInput()}
            {hasSentOtp && !errorMessage && renderOtpEntry()}
            {isLoadingSendOtpId && (
              <BeatLoader
                color={themeColors.secondary}
                margin="2px"
                size={16}
              />
            )}
            {!!errorMessage && (
              <DialogError
                message={errorMessage}
                windowHeight={windowHeight}
              />
            )}
          </Grid2>
        </Box>
      </Fade>
    )
  },
)
