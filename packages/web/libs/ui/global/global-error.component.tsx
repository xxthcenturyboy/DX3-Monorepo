import { Box, Button, Grid2, Typography } from '@mui/material'
import type * as React from 'react'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { ErrorLottie } from '../lottie/error.lottie'

type GlobalErrorComponentPropsType = {
  routingFn?: () => void
  buttonText?: string
}

export const GlobalErrorComponent: React.FC<GlobalErrorComponentPropsType> = ({
  routingFn,
  buttonText,
}) => {
  return (
    <StyledContentWrapper>
      <Grid2
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        style={{ minHeight: '80vh' }}
      >
        <ErrorLottie />
        <Typography
          color="primary"
          variant="h1"
        >
          Ouch
        </Typography>
        <Typography
          color="secondary"
          margin="15px"
          variant="h5"
        >
          We encountered a fatal system fault.
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
      </Grid2>
    </StyledContentWrapper>
  )
}
