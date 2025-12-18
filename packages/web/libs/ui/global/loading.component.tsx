import { Button, Grid2, Typography } from '@mui/material'
import { BeatLoader } from 'react-spinners'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { themeColors } from '../system/mui-overrides/styles'

type LoadingProps = {
  error?: Error
  timedOut?: boolean
  pastDelay?: boolean
  retry?: () => void
}

export const UiLoadingComponent = (props: LoadingProps): JSX.Element | null => {
  const handleRetry = (): void => {
    if (typeof props.retry === 'function') {
      props.retry()
    }
  }

  if (props.error) {
    return (
      <StyledContentWrapper>
        <Grid2
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{ minHeight: '90vh' }}
        >
          <Button onClick={handleRetry}>retry</Button>
          <Typography>{props.error.message}</Typography>
        </Grid2>
      </StyledContentWrapper>
    )
  }

  if (props.timedOut) {
    return (
      <StyledContentWrapper>
        <Grid2
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{ minHeight: '90vh' }}
        >
          <Button onClick={handleRetry}>retry</Button>
          <Typography>timed out</Typography>
        </Grid2>
      </StyledContentWrapper>
    )
  }

  if (props.pastDelay) {
    return (
      <StyledContentWrapper>
        <Grid2
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{
            minHeight: '90vh',
          }}
        >
          <BeatLoader
            color={themeColors.secondary}
            margin="2px"
            size={30}
          />
        </Grid2>
      </StyledContentWrapper>
    )
  }

  return null
}
