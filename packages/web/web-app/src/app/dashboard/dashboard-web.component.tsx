import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import * as React from 'react'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { WelcomeRobotLottie } from '@dx3/web-libs/ui/lottie/welcome-robot.lottie'

import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { DashboardHeaderComponent } from './dashboard-header.component'

export const Dashboard: React.FC = () => {
  React.useEffect(() => {
    setDocumentTitle('Dashboard')
  }, [])
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <ContentWrapper
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '61px' : '61px'}
    >
      <DashboardHeaderComponent />
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        style={{
          minHeight: '80vh',
        }}
        wrap="nowrap"
      >
        <WelcomeRobotLottie />
        <Typography
          align="center"
          color="secondary"
          margin="15px"
          variant="h5"
        >
          Have a look around.
        </Typography>
      </Grid>
    </ContentWrapper>
  )
}
