// import React from 'react';
import { Grid, Typography } from '@mui/material'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { AccessDeniedLottie } from '../lottie/access-denied.lottie'

type LoadingProps = {
  error?: Error
  timedOut?: boolean
  pastDelay?: boolean
  retry?: () => void
}

export const UnauthorizedComponent = (_props: LoadingProps): React.ReactElement | null => {
  return (
    <StyledContentWrapper>
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        style={{
          minHeight: '90vh',
        }}
      >
        <Typography
          align="center"
          color="primary"
          variant="h3"
        >
          You are not authorized to access this feature.
        </Typography>
        <AccessDeniedLottie loop={false} />
      </Grid>
    </StyledContentWrapper>
  )
}
