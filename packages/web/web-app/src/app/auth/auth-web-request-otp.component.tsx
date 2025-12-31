import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
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
  Typography,
} from '@mui/material'
import { type CountryCode, isValidPhoneNumber } from 'libphonenumber-js'
import React from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

import { OTP_LENGTH } from '@dx3/models-shared'
import { regexEmail } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { WebConfigService } from '../config/config-web.service'
import { useStrings } from '../i18n'
import { PhoneNumberInput } from '../phone/phone-input/phone-web-input.component'
import { useAppSelector } from '../store/store-web-redux.hooks'
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
import { LoginForm } from './auth-web-login.ui'
import { AuthWebOtpEntry } from './auth-web-otp.component'

type AuthWebRequestOtpPropsType = {
  hasCallbackError: boolean
  isLogin?: boolean
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
    const [selectedMethod, setSelectedMethod] = React.useState<'EMAIL' | 'PHONE' | ''>(
      props.isLogin ? 'PHONE' : '',
    )
    const isProfileValid = useAppSelector((state) => selectIsUserProfileValid(state))
    const userEmails = useAppSelector((state) => selectUserEmails(state))
    const userPhones = useAppSelector((state) => selectUserPhones(state))
    const strings = useStrings([
      'BACK',
      'EMAIL',
      'GET_CODE_VIA_EMAIL',
      'GET_CODE_VIA_PHONE',
      'OTP_CHOOSE_METHOD',
      'PHONE',
      'SEND_CODE',
      'START_OVER',
    ])
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
      requestOtpCodeId,
      {
        data: sendOtpIdResponse,
        error: sendOtpIdError,
        isLoading: isLoadingSendOtpId,
        isSuccess: sendOtpIdSuccess,
        isUninitialized: _sendOtpIdUninitialized,
      },
    ] = useOtpRequestIdMutation()
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
        const code =
          sendOtpPhoneResponse?.code || sendOtpEmailResponse?.code || sendOtpIdResponse?.code
        if (WebConfigService.isDev()) {
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
    }, [sendOtpEmailSuccess, sendOtpPhoneSuccess, sendOtpIdSuccess])

    React.useEffect(() => {
      if (otp.length === OTP_LENGTH && selectedMethod) {
        const value = selectedMethod === 'PHONE' ? phone : email
        props.onCompleteCallback(value, otp, countryData?.countryCode)
        setHasFiredCallback(true)
      }
    }, [otp])

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

    const renderBackButton = (startOver?: boolean): React.ReactElement | null => {
      if (props.isLogin && !startOver) {
        return null
      }

      if (startOver) {
        return (
          <Button
            fullWidth
            onClick={() => {
              setErrorMessage('')
              setSelectedMethod(props.isLogin ? 'PHONE' : '')
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
            {strings.START_OVER}
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
          {strings.BACK}
        </Button>
      )
    }

    const renderPhoneInput = (): React.ReactElement => {
      return (
        <Fade
          in={true}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid marginTop={props.isLogin ? '24px' : undefined}>
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
                    color={themeColors.secondary}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  strings.SEND_CODE
                )}
              </Button>
            </LoginForm>
            {renderBackButton()}
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
                  autoComplete="off"
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
                    color={themeColors.secondary}
                    margin="2px"
                    size={16}
                  />
                ) : (
                  strings.SEND_CODE
                )}
              </Button>
            </LoginForm>
            {renderBackButton()}
          </Grid>
        </Fade>
      )
    }

    const renderSelectFromLoggedIn = (): React.ReactElement => {
      return (
        <>
          <Typography
            style={{
              margin: '0px auto 24px',
            }}
            textAlign="center"
            variant="h6"
          >
            {strings.OTP_CHOOSE_METHOD}
          </Typography>
          {userPhones.length &&
            userPhones.map((userPhone) => {
              if (userPhone.isVerified) {
                return (
                  <Grid
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
                  </Grid>
                )
              }
            })}
          {userEmails.length &&
            userEmails.map((userEmail) => {
              if (userEmail.isVerified) {
                return (
                  <Grid
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
                  </Grid>
                )
              }
            })}
        </>
      )
    }

    const renderSelectFromLoggedout = (): React.ReactElement => {
      return (
        <>
          <Grid width={'100%'}>
            <Button
              endIcon={<PhoneIcon />}
              fullWidth
              onClick={() => setSelectedMethod('PHONE')}
              variant="contained"
            >
              {strings.GET_CODE_VIA_PHONE}
            </Button>
          </Grid>

          <Grid width={'100%'}>
            <Button
              endIcon={<EmailIcon />}
              fullWidth
              onClick={() => setSelectedMethod('EMAIL')}
              variant="contained"
            >
              {strings.GET_CODE_VIA_EMAIL}
            </Button>
          </Grid>
        </>
      )
    }

    const renderOtpEntry = (): React.ReactElement => {
      return (
        <Box
          display="flex"
          flexDirection="column"
          height={props.isLogin ? '200px' : undefined}
          justifyContent="center"
        >
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
        </Box>
      )
    }

    return (
      <Fade
        in={true}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Box
          minHeight={props.isLogin ? '282px' : undefined}
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
                windowHeight={400}
              />
            )}
          </Grid>
        </Box>
      </Fade>
    )
  },
)
