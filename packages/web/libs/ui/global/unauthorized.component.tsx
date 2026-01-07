// import React from 'react';
import { Grid, Typography } from '@mui/material'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { AccessDeniedLottie } from '../lottie/access-denied.lottie'

type UnauthorizedPropTypes = {
  error?: Error
  message?: string
}

export const UnauthorizedComponent = (props: UnauthorizedPropTypes): React.ReactElement | null => {
  const getBodyText = (): string => {
    if (props.error?.message) {
      return props.error.message
    }

    if (props.message) {
      return props.message
    }

    return 'You are not authorized to access this feature.'
  }

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
          {getBodyText()}
        </Typography>
        <AccessDeniedLottie loop={false} />
      </Grid>
    </StyledContentWrapper>
  )
}
