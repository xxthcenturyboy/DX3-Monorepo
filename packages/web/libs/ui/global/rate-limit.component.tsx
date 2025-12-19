import { Grid, Typography } from '@mui/material'
import type * as React from 'react'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { StopwatchLottie } from '../lottie/stopwatch.lottie'

export const RateLimitComponent: React.FC = () => {
  return (
    <StyledContentWrapper>
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        style={{ minHeight: '80vh' }}
      >
        <StopwatchLottie />
        <Typography
          color="primary"
          variant="h1"
        >
          Timeout, Turbo
        </Typography>
        <Typography
          color="secondary"
          margin="15px"
          variant="h5"
        >
          You have made too many requests. Please wait several minutes before trying again.
        </Typography>
      </Grid>
    </StyledContentWrapper>
  )
}
