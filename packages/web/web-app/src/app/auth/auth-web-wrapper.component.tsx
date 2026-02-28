import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import React from 'react'

import { BORDER_RADIUS, FADE_TIMEOUT_DUR, MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useAppSelector } from '../store/store-web-redux.hooks'
import { WebLogin } from './auth-web-login.component'
import { Logo } from './auth-web-login.ui'
import { WebSignup } from './auth-web-signup.component'

export const WebAuthWrapper: React.FC<{ route: 'login' | 'signup' }> = ({ route }) => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const logo = useAppSelector((state) => state.ui.logoUrl)
  const logoDark = useAppSelector((state) => state.ui.logoUrlSmall)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box height="100%">
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{
            height: '100%',
            minHeight: mobileBreak ? 'unset' : '80vh',
          }}
        >
          <Paper
            elevation={mobileBreak ? 0 : 2}
            sx={(theme) => {
              return {
                alignItems: 'center',
                background:
                  theme.palette.mode === 'light'
                    ? theme.palette.background.default
                    : theme.palette.background.paper,
                borderRadius: SM_BREAK ? 0 : BORDER_RADIUS,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                maxWidth: '420px',
                minHeight: mobileBreak ? '100%' : '592px',
                minWidth: windowWidth < 375 ? `${windowWidth - 40}px` : '330px',
                padding: mobileBreak ? '20px' : '40px',
                width: '100%',
              }
            }}
          >
            <Logo src={theme.palette.mode === 'dark' ? logoDark : logo} />
            {route === 'login' && <WebLogin />}
            {route === 'signup' && <WebSignup />}
          </Paper>
        </Grid>
      </Box>
    </Fade>
  )
}
