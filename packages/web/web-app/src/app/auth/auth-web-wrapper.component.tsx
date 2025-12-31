import { Box, Fade, Grid, Paper } from '@mui/material'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'

import { FADE_TIMEOUT_DUR, MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { WebConfigService } from '../config/config-web.service'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsUserProfileValid } from '../user/profile/user-profile-web.selectors'
import { WebLogin } from './auth-web-login.component'
import { Logo } from './auth-web-login.ui'
import { WebSignup } from './auth-web-signup.component'

export const WebAuthWrapper: React.FC<{ route: 'login' | 'signup' }> = ({ route }) => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const user = useAppSelector((state) => state.userProfile)
  const isProfileValid = useAppSelector((state) => selectIsUserProfileValid(state))
  const logo = useAppSelector((state) => state.ui.logoUrl)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const location = useLocation()
  const navigate = useNavigate()
  const lastPath = location.pathname
  const ROUTES = WebConfigService.getWebRoutes()

  React.useEffect(() => {
    // we're already logged in
    if (user && isProfileValid) {
      if (
        lastPath !== ROUTES.MAIN &&
        lastPath !== ROUTES.AUTH.LOGIN &&
        lastPath !== ROUTES.AUTH.SIGNUP
      ) {
        navigate(lastPath, { replace: true })
      }
      return
    }
  }, [isProfileValid, lastPath, user])

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box>
        <Grid
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
                minHeight: '592px',
                minWidth: windowWidth < 375 ? `${windowWidth - 40}px` : '330px',
                padding: mobileBreak ? '20px' : '40px',
                width: '100%',
              }
            }}
          >
            <Logo src={logo} />
            {route === 'login' && <WebLogin />}
            {route === 'signup' && <WebSignup />}
          </Paper>
        </Grid>
      </Box>
    </Fade>
  )
}
