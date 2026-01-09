import { Box, Fade, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import type { AccountCreationPayloadType } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR, MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { loginBootstrap } from '../config/bootstrap/login-bootstrap'
import { WebConfigService } from '../config/config-web.service'
import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useString, useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { userProfileActions } from '../user/profile/user-profile-web.reducer'
import { useCreateAccountMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'
import { AuthWebRequestOtp } from './auth-web-request-otp.component'

export const WebSignup: React.FC = () => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const stringSignup = useString('SIGNUP')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings(['SIGNUP_FOR_AN_ACCOUNT'])
  const [
    requstSignup,
    {
      data: signupResponse,
      error: signupError,
      isLoading: _isFetchingSignup,
      isSuccess: _signupSuccess,
    },
  ] = useCreateAccountMutation()

  React.useEffect(() => {
    setDocumentTitle(stringSignup)
  }, [stringSignup])

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  React.useEffect(() => {
    if (signupError) {
      if (signupError.code && signupError.code === '429') {
        navigate(ROUTES.LIMITED)
      }

      toast.error(getErrorStringFromApiResponse(signupError))
      dispatch(userProfileActions.profileInvalidated())

      return
    }
  }, [signupError])

  React.useEffect(() => {
    if (signupResponse) {
      const { accessToken, profile } = signupResponse
      dispatch(authActions.usernameUpdated(''))
      dispatch(authActions.passwordUpdated(''))
      dispatch(authActions.tokenAdded(accessToken))
      dispatch(authActions.setLogoutResponse(false))
      dispatch(userProfileActions.profileUpdated(profile))
      loginBootstrap(profile, mobileBreak)
      navigate(ROUTES.DASHBOARD.MAIN)
    }
  }, [signupResponse])

  const handleSignup = async (payload: AccountCreationPayloadType): Promise<void> => {
    await requstSignup(payload)
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
          {strings.SIGNUP_FOR_AN_ACCOUNT}
        </Typography>
        <AuthWebRequestOtp
          hasCallbackError={!!signupError}
          onCompleteCallback={(value: string, code: string, region?: string) => {
            const data: AccountCreationPayloadType = {
              code,
              region,
              value,
            }
            void handleSignup(data)
          }}
        />
      </Box>
    </Fade>
  )
}
