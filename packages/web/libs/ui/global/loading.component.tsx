import { Button, Grid, Typography, useTheme } from '@mui/material'
import { BeatLoader } from 'react-spinners'

import { StyledContentWrapper } from '../content/content-wrapper.styled'

type LoadingProps = {
  error?: Error
  timedOut?: boolean
  pastDelay?: boolean
  retry?: () => void
}

export const UiLoadingComponent = (props: LoadingProps): React.ReactElement | null => {
  const theme = useTheme()
  const handleRetry = (): void => {
    if (typeof props.retry === 'function') {
      props.retry()
    }
  }
  if (props.error) {
    return (
      <StyledContentWrapper>
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{ minHeight: '90vh' }}
        >
          <Button onClick={handleRetry}>retry</Button>
          <Typography>{props.error.message}</Typography>
        </Grid>
      </StyledContentWrapper>
    )
  }

  if (props.timedOut) {
    return (
      <StyledContentWrapper>
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{ minHeight: '90vh' }}
        >
          <Button onClick={handleRetry}>retry</Button>
          <Typography>timed out</Typography>
        </Grid>
      </StyledContentWrapper>
    )
  }

  if (props.pastDelay) {
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
          <BeatLoader
            color={theme.palette.secondary.main}
            margin="2px"
            size={30}
          />
        </Grid>
      </StyledContentWrapper>
    )
  }

  return null
}
