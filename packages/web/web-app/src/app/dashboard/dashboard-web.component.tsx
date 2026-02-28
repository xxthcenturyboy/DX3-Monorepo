import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { WelcomeRobotLottie } from '@dx3/web-libs/ui/lottie/welcome-robot.lottie'

import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { DashboardHeaderComponent } from './dashboard-header.component'

export const Dashboard: React.FC = () => {
  const strings = useStrings(['PAGE_TITLE_DASHBOARD', 'DASHBOARD_WELCOME'])

  React.useEffect(() => {
    setDocumentTitle(strings.PAGE_TITLE_DASHBOARD)
  }, [strings.PAGE_TITLE_DASHBOARD])
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
          {strings.DASHBOARD_WELCOME}
        </Typography>
      </Grid>
    </ContentWrapper>
  )
}
