import { Grid, Typography } from '@mui/material'
import type * as React from 'react'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { BetaBadgeLottie } from '../lottie/beta-badge.lottie'

type BetaFeaturePropTypes = {
  comingSoon?: string
  message?: string
}

export const BetaFeatureComponent: React.FC<BetaFeaturePropTypes> = (props) => {
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
        <BetaBadgeLottie />
        <Typography
          color="primary"
          variant="h1"
        >
          {props.comingSoon || 'Coming Soon'}
        </Typography>
        <Typography
          color="secondary"
          margin="15px"
          variant="h5"
        >
          {props.message || 'This feature is not ready yet. Check back for updates.'}
        </Typography>
      </Grid>
    </StyledContentWrapper>
  )
}
