import { Button, Fade, Grid2, Typography, useMediaQuery, useTheme } from '@mui/material'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { APP_DESCRIPTION, APP_NAME } from '@dx3/models-shared'
import { WelcomeRobotLottie } from '@dx3/web-libs/ui/lottie/welcome-robot.lottie'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { WebConfigService } from '../config/config-web.service'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

export const HomeComponent: React.FC = () => {
  const theme = useTheme()
  const smBreak = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  React.useEffect(() => {
    setDocumentTitle()
  }, [])

  const goToLogin = () => {
    const ROUTES = WebConfigService.getWebRoutes()
    if (ROUTES?.AUTH?.LOGIN) {
      navigate(ROUTES.AUTH.LOGIN)
    }
  }

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Grid2
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        sx={{
          minHeight: '80vh',
          padding: '24px',
        }}
        wrap="nowrap"
      >
        <WelcomeRobotLottie />
        <Typography
          align="center"
          color="primary"
          variant={smBreak ? 'h3' : 'h1'}
        >
          {APP_NAME}
        </Typography>
        <Typography
          align="center"
          color="secondary"
          margin="15px"
          variant="h5"
        >
          {APP_DESCRIPTION}
        </Typography>
        <Grid2
          flex={0}
          justifyContent="center"
          margin="20px"
          width={smBreak ? '100%' : 'auto'}
        >
          <Button
            fullWidth={smBreak}
            onClick={goToLogin}
            size="large"
            style={{
              minWidth: '200px',
            }}
            variant="contained"
          >
            Login
          </Button>
        </Grid2>
      </Grid2>
    </Fade>
  )
}
