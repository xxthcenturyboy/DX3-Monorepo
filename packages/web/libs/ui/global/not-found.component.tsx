import { Box, Button, Grid, Typography } from '@mui/material'
import type * as React from 'react'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { NotFoundLottie } from '../lottie/not-found.lottie'

type NotFoundComponentPropsType = {
  routingFn?: () => void
  buttonText?: string
  notFoundHeader?: string
  notFoundText?: string
}

export const NotFoundComponent: React.FC<NotFoundComponentPropsType> = ({
  routingFn,
  buttonText,
  notFoundHeader,
  notFoundText,
}) => {
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
        <NotFoundLottie />
        <Typography
          color="primary"
          variant="h1"
        >
          {notFoundHeader || 'Not Found'}
        </Typography>
        <Typography
          color="secondary"
          margin="15px"
          variant="h5"
        >
          {notFoundText || "We couldn't find what you were looking for."}
        </Typography>
        <Box margin="20px">
          <Button
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals
              routingFn ? routingFn() : history.back()
            }}
            variant="outlined"
          >
            {buttonText || 'Go Back'}
          </Button>
        </Box>
      </Grid>
    </StyledContentWrapper>
  )
}
