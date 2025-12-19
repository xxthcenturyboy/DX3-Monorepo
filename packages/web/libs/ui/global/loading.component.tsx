import { Button, Grid, Typography } from '@mui/material'
import { BeatLoader } from 'react-spinners'

import { StyledContentWrapper } from '../content/content-wrapper.styled'
import { themeColors } from '../system/mui-overrides/styles'

type LoadingProps = {
  error?: Error
  timedOut?: boolean
  pastDelay?: boolean
  retry?: () => void
}

export const UiLoadingComponent = (props: LoadingProps): React.ReactElement | null => {
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
            color={themeColors.secondary}
            margin="2px"
            size={30}
          />
        </Grid>
      </StyledContentWrapper>
    )
  }

  return null
}
