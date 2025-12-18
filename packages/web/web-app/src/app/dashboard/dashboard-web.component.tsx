import { Grid2, Typography } from '@mui/material'
import * as React from 'react'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { WelcomeRobotLottie } from '@dx3/web-libs/ui/lottie/welcome-robot.lottie'

import { setDocumentTitle } from '../ui/ui-web-set-document-title'

export const Dashboard: React.FC = () => {
  React.useEffect(() => {
    setDocumentTitle('Dashboard')
  }, [])

  return (
    <ContentWrapper
      contentMarginTop={'64px'}
      headerColumnRightJustification={'flex-end'}
      headerColumnsBreaks={{
        left: {
          xs: 11,
        },
      }}
      headerTitle={'Dashboard'}
    >
      <Grid2
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
      </Grid2>
    </ContentWrapper>
  )
}
