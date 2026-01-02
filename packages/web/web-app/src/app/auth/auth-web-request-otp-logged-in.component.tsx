import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { Box, Button, Fade, Grid, Typography } from '@mui/material'
import React from 'react'
import type { CountryData } from 'react-phone-input-2'
import { BeatLoader } from 'react-spinners'

import { logger } from '@dx3/web-libs/logger'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { getThemePalette } from '@dx3/web-libs/ui/system/mui-themes/mui-theme.service'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { showDevOtpCode } from '../ui/ui-web-otp-dev.toast'
import { selectUserEmails, selectUserPhones } from '../user/profile/user-profile-web.selectors'
import { useOtpRequestIdMutation } from './auth-web.api'
import { AuthWebRequestOtpEntry } from './auth-web-request-otp-entry.component'

type AuthWebRequestOtpLoggedInPropsType = {
  hasCallbackError: boolean
  onCompleteCallback: (value: string, code: string, region?: string) => void
}

export const AuthWebRequestOtpLoggedIn: React.FC<AuthWebRequestOtpLoggedInPropsType> =
  React.forwardRef((props, ref) => {
    const [email, setEmail] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [countryData, setCountryData] = React.useState<CountryData | null>(null)
    const [hasSentOtp, setHasSentOtp] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')
    const [selectedMethod, setSelectedMethod] = React.useState<'EMAIL' | 'PHONE' | ''>('')
    const userEmails = useAppSelector((state) => selectUserEmails(state))
    const userPhones = useAppSelector((state) => selectUserPhones(state))
    const strings = useStrings(['OTP_CHOOSE_METHOD', 'SEND_CODE', 'START_OVER'])
    const themeColors = getThemePalette()
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

    React.useEffect(() => {
      if (!isLoadingSendOtpId) {
        if (!sendOtpIdError) {
          setErrorMessage('')
          return
        }
        if (sendOtpIdError && 'error' in sendOtpIdError) {
          setErrorMessage(sendOtpIdError.error)
        }
      }
    }, [isLoadingSendOtpId, sendOtpIdError])

    React.useEffect(() => {
      if (sendOtpIdSuccess) {
        setHasSentOtp(true)
        showDevOtpCode(sendOtpIdResponse?.code)
      }
    }, [sendOtpIdSuccess])

    const handleSendOtpCode = async (method: 'EMAIL' | 'PHONE', id: string): Promise<void> => {
      setSelectedMethod(method)
      await requestOtpCodeId({ id, type: method }).catch((err) =>
        logger.error((err as Error).message, err),
      )
    }

    const renderOtpEntry = (): React.ReactElement => {
      return (
        <AuthWebRequestOtpEntry
          hasCallbackError={props.hasCallbackError}
          onClickStartOver={() => {
            setErrorMessage('')
            setHasSentOtp(false)
            setSelectedMethod('')
          }}
          onCompleteCallback={(code: string) => {
            const value = selectedMethod === 'PHONE' ? phone : email
            props.onCompleteCallback(value, code, countryData?.countryCode)
          }}
          selectedMethod={selectedMethod}
        />
      )
    }

    const renderSelectList = (): React.ReactElement => {
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
          {userPhones.length > 0 &&
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
                        handleSendOtpCode('PHONE', userPhone.id)
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
          {userEmails.length > 0 &&
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
                        handleSendOtpCode('EMAIL', userEmail.id)
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

    return (
      <Fade
        in={true}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Box
          minHeight={'282px'}
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
            {!errorMessage && !hasSentOtp && renderSelectList()}
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
  })
