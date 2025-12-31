import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { Box, Fade } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import type { LoginPayloadType } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR, MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { loginBootstrap } from '../config/bootstrap/login-bootstrap'
import { WebConfigService } from '../config/config-web.service'
import { useString, useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { userProfileActions } from '../user/profile/user-profile-web.reducer'
import { useLoginMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'
import { LoginTypeChip, LoginTypeContainer } from './auth-web-login.ui'
import { WebLoginUserPass } from './auth-web-login-user-pass.component'
import { AuthWebRequestOtpEntry } from './auth-web-request-otp.component'

export const WebLogin: React.FC = () => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const [loginType, setLoginType] = React.useState<'USER_PASS' | 'PHONE' | 'OTP' | false>(
    'USER_PASS',
  )
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const stringLogin = useString('LOGIN')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings(['EMAIL', 'LOGIN', 'PASSWORD', 'PHONE', 'USERNAME', 'TRY_ANOTHER_WAY'])
  const [
    requestLogin,
    {
      data: loginResponse,
      error: loginError,
      isLoading: isFetchingLogin,
      isSuccess: _loginIsSuccess,
    },
  ] = useLoginMutation()

  React.useEffect(() => {
    setDocumentTitle(stringLogin)
  }, [stringLogin])

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  React.useEffect(() => {
    if (loginError) {
      if (loginError.code && loginError.code === '429') {
        navigate(ROUTES.LIMITED)
        'error' in loginError && toast.error(loginError.error)
        return
      }

      'error' in loginError && toast.warn(loginError.error)
      dispatch(userProfileActions.profileInvalidated())

      return
    }
  }, [loginError])

  React.useEffect(() => {
    if (loginResponse) {
      const { accessToken, profile } = loginResponse
      dispatch(authActions.usernameUpdated(''))
      dispatch(authActions.passwordUpdated(''))
      dispatch(authActions.tokenAdded(accessToken))
      dispatch(authActions.setLogoutResponse(false))
      dispatch(userProfileActions.profileUpdated(profile))
      loginBootstrap(profile, mobileBreak)
      navigate(ROUTES.DASHBOARD.MAIN)
    }
  }, [loginResponse])

  const handleLogin = async (payload: LoginPayloadType): Promise<void> => {
    await requestLogin(payload)
  }

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box width="100%">
        {(loginType === 'PHONE' || loginType === 'USER_PASS') && (
          <LoginTypeContainer>
            <LoginTypeChip
              active={loginType === 'USER_PASS'}
              color="primary"
              icon={<EmailIcon />}
              label={strings.PASSWORD}
              onClick={() => setLoginType('USER_PASS')}
              variant={loginType === 'USER_PASS' ? 'filled' : 'outlined'}
            />
            <LoginTypeChip
              active={loginType === 'PHONE'}
              color="primary"
              icon={<PhoneIcon />}
              label={strings.PHONE}
              onClick={() => setLoginType('PHONE')}
              variant={loginType === 'PHONE' ? 'filled' : 'outlined'}
            />
          </LoginTypeContainer>
        )}
        {loginType === 'USER_PASS' && (
          <WebLoginUserPass
            changeLoginType={() => setLoginType('OTP')}
            isFetchingLogin={isFetchingLogin}
            login={handleLogin}
          />
        )}
        {(loginType === 'OTP' || loginType === 'PHONE') && (
          <AuthWebRequestOtpEntry
            hasCallbackError={!!loginError}
            isLogin={loginType === 'PHONE'}
            onCompleteCallback={(value: string, code: string, region?: string) => {
              const data: LoginPayloadType = {
                code,
                region,
                value,
              }
              void handleLogin(data)
            }}
          />
        )}
      </Box>
    </Fade>
  )
}
