import { Fade, Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { APP_NAME } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { useLazyGetShortlinkTargetQuery } from './shortlink-web.api'

export const ShortlinkComponent: React.FC = () => {
  const { token } = useParams() as { token: string }
  const theme = useTheme()
  const smBreak = useMediaQuery(theme.breakpoints.down('sm'))
  const [hasFetched, setHasFetched] = useState(false)
  const navigate = useNavigate()
  const [
    fetchShortlink,
    {
      data: shortlinkResponse,
      error: shortlinkError,
      isFetching: isLoadingShortlink,
      isSuccess: _shortlinkSuccess,
      isUninitialized: _shortlinkUninitialized,
    },
  ] = useLazyGetShortlinkTargetQuery()

  const routeToMain = () => {
    navigate('/')
  }

  useEffect(() => {
    if (!token) {
      routeToMain()
      return
    }

    void fetchShortlink({ id: token })
  }, [token])

  useEffect(() => {
    if (isLoadingShortlink) {
      setHasFetched(true)
    }
  }, [isLoadingShortlink])

  useEffect(() => {
    if (hasFetched && shortlinkError) {
      routeToMain()
    }
  }, [shortlinkError, hasFetched])

  useEffect(() => {
    if (hasFetched && !shortlinkError && shortlinkResponse) {
      navigate(shortlinkResponse, { replace: true })
    }
  }, [shortlinkResponse, hasFetched, shortlinkError])

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="center"
        spacing={0}
        style={{ minHeight: '80vh' }}
        wrap="nowrap"
      >
        <Typography
          align="center"
          color="primary"
          variant={smBreak ? 'h3' : 'h1'}
        >
          {APP_NAME}
        </Typography>
      </Grid>
    </Fade>
  )
}
