import { Box, Fade, Grid } from '@mui/material'
import React from 'react'

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsUserProfileValid } from '../user/profile/user-profile-web.selectors'
import { AuthWebRequestOtpLoggedIn } from './auth-web-request-otp-logged-in.component'
import { AuthWebRequestOtpLoggedOut } from './auth-web-request-otp-logged-out.component'

type AuthWebRequestOtpPropsType = {
  hasCallbackError: boolean
  onCompleteCallback: (value: string, code: string, region?: string) => void
  setHasSentOtp?: (value: boolean) => void
}

export const AuthWebRequestOtp: React.FC<AuthWebRequestOtpPropsType> = React.forwardRef(
  (props, ref) => {
    const isProfileValid = useAppSelector((state) => selectIsUserProfileValid(state))
    const logoutResponse = useAppSelector((state) => state.auth.logoutResponse)

    const renderFromLoggedIn = (): React.ReactElement => {
      return (
        <AuthWebRequestOtpLoggedIn
          hasCallbackError={props.hasCallbackError}
          onCompleteCallback={props.onCompleteCallback}
        />
      )
    }

    const renderFromLoggedout = (): React.ReactElement => {
      return (
        <AuthWebRequestOtpLoggedOut
          hasCallbackError={props.hasCallbackError}
          onCompleteCallback={props.onCompleteCallback}
          setHasSentOtp={props.setHasSentOtp}
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
            {isProfileValid && !logoutResponse && renderFromLoggedIn()}
            {!isProfileValid && renderFromLoggedout()}
          </Grid>
        </Box>
      </Fade>
    )
  },
)
