import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import type { LoginPayloadType } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { WebConfigService } from '../config/config-web.service'
import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useString, useStrings } from '../i18n'
import { useAppDispatch } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { userProfileActions } from '../user/profile/user-profile-web.reducer'
import { useLoginMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'
import { WebLoginUserPass } from './auth-web-login-user-pass.component'
import { AuthWebRequestOtp } from './auth-web-request-otp.component'

export const WebLogin: React.FC = () => {
  const [loginType, setLoginType] = React.useState<'USER_PASS' | 'OTP'>('USER_PASS')
  const [hideTypeSwitch, setHideTypeSwitch] = React.useState(false)
  const stringLogin = useString('LOGIN')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings([
    'LOG_IN_TO_YOUR_ACCOUNT',
    'TRY_WITH_ONE_TIME_CODE',
    'TRY_WITH_USERNAME_AND_PASSWORD',
    'TIMEOUT_TURBO',
  ])
  const [
    requestLogin,
    {
      data: loginResponse,
      error: loginError,
      isLoading: isFetchingLogin,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginMutation()

  React.useEffect(() => {
    setDocumentTitle(stringLogin)
  }, [stringLogin])

  React.useEffect(() => {
    if (loginError) {
      if (loginError.code && loginError.code === '429') {
        navigate(ROUTES.LIMITED)
        toast.error(strings.TIMEOUT_TURBO)
        return
      }

      toast.warn(getErrorStringFromApiResponse(loginError))
      dispatch(userProfileActions.profileInvalidated())
    }
  }, [loginError])

  React.useEffect(() => {
    if (loginResponse) {
      const { accessToken, profile } = loginResponse
      if (accessToken && profile) {
        dispatch(authActions.usernameUpdated(''))
        dispatch(authActions.passwordUpdated(''))
        dispatch(authActions.tokenAdded(accessToken))
        dispatch(userProfileActions.profileUpdated(profile))
        // loginBootstrap is called by AppNavBar when isAuthenticated becomes true,
        // which prevents a race condition that would create duplicate socket connections.
        navigate(ROUTES.DASHBOARD.MAIN)
        dispatch(authActions.setLogoutResponse(false))
      }
    }
  }, [loginResponse])

  const handleLogin = async (payload: LoginPayloadType): Promise<void> => {
    await requestLogin(payload)
  }

  const getTypeSwitcherVisiblity = (): 'hidden' | 'visible' => {
    if (hideTypeSwitch || isFetchingLogin || loginIsSuccess) {
      return 'hidden'
    }

    return 'visible'
  }

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box width="100%">
        <Typography
          align="center"
          color="primary"
          justifySelf="center"
          margin="-16px 0 28px"
          variant="h5"
        >
          {strings.LOG_IN_TO_YOUR_ACCOUNT}
        </Typography>
        {loginType === 'USER_PASS' && (
          <WebLoginUserPass
            changeLoginType={() => setLoginType('OTP')}
            isFetchingLogin={isFetchingLogin}
            login={handleLogin}
          />
        )}
        {loginType === 'OTP' && (
          <Box>
            <AuthWebRequestOtp
              hasCallbackError={!!loginError}
              onCompleteCallback={(value: string, code: string, region?: string) => {
                const data: LoginPayloadType = {
                  code,
                  region,
                  value,
                }
                void handleLogin(data)
              }}
              setHasSentOtp={setHideTypeSwitch}
            />
          </Box>
        )}
        <Typography
          align="center"
          color="primary"
          justifySelf="center"
          marginBottom={'0'}
          marginTop={loginType === 'OTP' ? '-2em' : '2em'}
          onClick={() => setLoginType(loginType === 'OTP' ? 'USER_PASS' : 'OTP')}
          style={{ cursor: 'pointer', visibility: getTypeSwitcherVisiblity() }}
          variant="subtitle2"
        >
          {loginType === 'OTP'
            ? strings.TRY_WITH_USERNAME_AND_PASSWORD
            : strings.TRY_WITH_ONE_TIME_CODE}
        </Typography>
      </Box>
    </Fade>
  )
}
