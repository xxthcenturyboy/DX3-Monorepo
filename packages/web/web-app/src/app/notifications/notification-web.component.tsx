import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'
import ReportIcon from '@mui/icons-material/Report'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import WarningIcon from '@mui/icons-material/Warning'
import WavingHandIcon from '@mui/icons-material/WavingHand'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import React from 'react'
import { toast } from 'react-toastify'
import { NIL as NIL_UUID } from 'uuid'

import { NOTIFICATION_LEVELS, type NotificationType } from '@dx3/models-shared'

import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { selectHasSuperAdminRole } from '../user/profile/user-profile-web.selectors'
import { useMarkAsDismissedMutation } from './notification-web.api'
import { notificationActions } from './notification-web.reducer'
import { StyledNotification } from './notification-web-menu.ui'

type NotificationMenuPropsType = {
  notification: NotificationType
}

export const NotificationComponent: React.FC<NotificationMenuPropsType> = (props) => {
  const { notification } = props
  const MAX_LEN = 100
  const isSuperAdmin = useAppSelector((state) => selectHasSuperAdminRole(state))
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const [
    requestDismiss,
    {
      data: _dismissResponse,
      error: dismissError,
      isLoading: isLoadingDismiss,
      isSuccess: _dismissSuccess,
      isUninitialized: dismissUninitialized,
    },
  ] = useMarkAsDismissedMutation()

  React.useEffect(() => {
    if (!isLoadingDismiss && !dismissUninitialized) {
      if (!dismissError) {
        dispatch(notificationActions.removeNotification(notification.id))
      } else {
        toast.error(getErrorStringFromApiResponse(dismissError))
      }
    }
  }, [isLoadingDismiss, dismissError, dismissUninitialized, notification.id])

  const renderIcon = (): React.ReactElement => {
    return (
      <>
        {notification.level === NOTIFICATION_LEVELS.DANGER && (
          <ReportIcon
            color="error"
            fontSize="large"
          />
        )}
        {notification.level === NOTIFICATION_LEVELS.INFO && (
          <InfoIcon
            color="info"
            fontSize="large"
          />
        )}
        {notification.level === NOTIFICATION_LEVELS.PRIMARY && (
          <WavingHandIcon
            color="primary"
            fontSize="large"
          />
        )}
        {notification.level === NOTIFICATION_LEVELS.SUCCESS && (
          <ThumbUpIcon
            color="success"
            fontSize="large"
          />
        )}
        {notification.level === NOTIFICATION_LEVELS.WARNING && (
          <WarningIcon
            color="warning"
            fontSize="large"
          />
        )}
      </>
    )
  }

  const getTitleColor = (): string => {
    switch (notification.level) {
      case NOTIFICATION_LEVELS.DANGER:
        return theme.palette.error.main
      case NOTIFICATION_LEVELS.INFO:
        return theme.palette.info.main
      case NOTIFICATION_LEVELS.PRIMARY:
        return theme.palette.primary.main
      case NOTIFICATION_LEVELS.SUCCESS:
        return theme.palette.success.main
      case NOTIFICATION_LEVELS.WARNING:
        return theme.palette.warning.main
      default:
        return theme.palette.primary.main
    }
  }

  const getTrimmedMessage = (): string => {
    if (notification.message.length < MAX_LEN) {
      return notification.message
    }

    return `${notification.message.substring(0, MAX_LEN)}...`
  }

  return (
    <StyledNotification isunread={notification.viewed ? 'false' : 'true'}>
      <Grid
        container
        direction="row"
        height={'100%'}
        width={'100%'}
      >
        {/** Icon */}
        <Grid
          alignItems="center"
          display="flex"
          width="15%"
        >
          {renderIcon()}
        </Grid>

        {/** Title and Message */}
        <Grid width="75%">
          <Grid
            container
            direction="column"
          >
            <Grid color={getTitleColor()}>
              <Typography variant="h6">{notification.title}</Typography>
            </Grid>
            <Grid>
              <Typography variant="body2">{getTrimmedMessage()}</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/** Dismiss Button */}
        {((notification.userId === NIL_UUID && isSuperAdmin) ||
          notification.userId !== NIL_UUID) && (
          <Grid
            alignItems="center"
            display="flex"
            justifyContent="flex-end"
            width="10%"
          >
            <IconButton
              onClick={() =>
                requestDismiss({
                  id: notification.id,
                  userId: notification.userId,
                })
              }
            >
              <ClearIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </StyledNotification>
  )
}
