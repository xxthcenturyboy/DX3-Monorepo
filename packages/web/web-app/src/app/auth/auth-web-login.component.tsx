import { Box, Fade, Grid2, Paper } from '@mui/material'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import type { LoginPayloadType } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR, MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { loginBootstrap } from '../config/bootstrap/login-bootstrap'
import { WebConfigService } from '../config/config-web.service'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { userProfileActions } from '../user/profile/user-profile-web.reducer'
import { selectIsUserProfileValid } from '../user/profile/user-profile-web.selectors'
import { useLoginMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'
import * as UI from './auth-web-login.ui'
import { WebLoginUserPass } from './auth-web-login-user-pass.component'
import { AuthWebRequestOtpEntry } from './auth-web-request-otp.component'

export const WebLogin: React.FC = () => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const [loginType, setLoginType] = React.useState<'USER_PASS' | 'OTP'>('USER_PASS')
  const user = useAppSelector((state) => state.userProfile)
  const isProfileValid = useAppSelector((state) => selectIsUserProfileValid(state))
  const logo = useAppSelector((state) => state.ui.logoUrl)
  // const windowHeight = useAppSelector(state => state.ui.windowHeight) || 0;
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const stringLogin = useAppSelector((state) => state.ui.strings.LOGIN)
  const location = useLocation()
  const navigate = useNavigate()
  const lastPath = location.pathname
  const dispatch = useAppDispatch()
  const ROUTES = WebConfigService.getWebRoutes()
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

    // we're already logged in
    if (user && isProfileValid) {
      if (lastPath !== ROUTES.MAIN && lastPath !== ROUTES.AUTH.LOGIN) {
        navigate(lastPath, { replace: true })
      }
      return
    }
  }, [ROUTES.AUTH.LOGIN, ROUTES.MAIN, isProfileValid, lastPath, stringLogin, user])

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
  }, [loginError, ROUTES.LIMITED])

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
  }, [ROUTES.DASHBOARD.MAIN, loginResponse])

  const handleLogin = async (payload: LoginPayloadType): Promise<void> => {
    await requestLogin(payload)
  }

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box>
        <Grid2
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{
            minHeight: mobileBreak ? 'unset' : '80vh',
          }}
        >
          <Paper
            elevation={mobileBreak ? 0 : 2}
            sx={(_theme) => {
              return {
                alignItems: 'center',
                backgroundColor: mobileBreak ? 'transparent' : undefined,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                maxWidth: '420px',
                minHeight: '500px',
                minWidth: windowWidth < 375 ? `${windowWidth - 40}px` : '330px',
                padding: mobileBreak ? '20px' : '40px',
                width: '100%',
              }
            }}
          >
            <UI.Logo src={logo} />
            {loginType === 'USER_PASS' && (
              <WebLoginUserPass
                changeLoginType={() => setLoginType('OTP')}
                isFetchingLogin={isFetchingLogin}
                login={handleLogin}
              />
            )}
            {loginType === 'OTP' && (
              <AuthWebRequestOtpEntry
                hasCallbackError={!!loginError}
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
          </Paper>
        </Grid2>
      </Box>
    </Fade>
  )
}
