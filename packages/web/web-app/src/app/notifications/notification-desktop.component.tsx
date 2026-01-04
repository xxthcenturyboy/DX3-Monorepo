import GradingIcon from '@mui/icons-material/Grading'
import { Fade, Grid, IconButton } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import React from 'react'
import { toast } from 'react-toastify'
import { TransitionGroup } from 'react-transition-group'
import { NIL as NIL_UUID } from 'uuid'

import { NoDataLottie } from '@dx3/web-libs/ui/lottie/no-data.lottie'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { selectHasSuperAdminRole } from '../user/profile/user-profile-web.selectors'
import { useMarkAllAsDismissedMutation } from './notification-web.api'
import { NotificationComponent } from './notification-web.component'
import { notificationActions } from './notification-web.reducer'
import { selectNotificationCount } from './notification-web.selectors'
import {
  StyledNotificationActionArea,
  StyledNotificationMenu,
  StyledNotificationsList,
} from './notification-web-menu.ui'

type NotificationsDesktopPropsType = {
  anchorElement: HTMLElement | null
  clickCloseMenu: () => void
}

export const NotificationsDesktop: React.FC<NotificationsDesktopPropsType> = (props) => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const systemNotifications = useAppSelector((state) => state.notification.system)
  const userNotifications = useAppSelector((state) => state.notification.user)
  const notificationCount = useAppSelector((state) => selectNotificationCount(state))
  const userId = useAppSelector((state) => state.userProfile.id)
  const isSuperAdmin = useAppSelector((state) => selectHasSuperAdminRole(state))
  const strings = useStrings(['NOTIFICATIONS', 'NOTIFICATIONS_WILL_APPEAR_HERE'])
  const dispatch = useAppDispatch()
  const [
    requestDismissAll,
    {
      data: _dismissAllResponse,
      error: dismissAllError,
      isLoading: isLoadingDismissAll,
      isSuccess: _dismissAllSuccess,
      isUninitialized: dismissAllUninitialized,
    },
  ] = useMarkAllAsDismissedMutation()

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  React.useEffect(() => {
    if (!isLoadingDismissAll && !dismissAllUninitialized) {
      if (!dismissAllError) {
        if (userNotifications.length) {
          dispatch(notificationActions.setUserNotifications([]))
        }
        if (systemNotifications.length && isSuperAdmin) {
          dispatch(notificationActions.setSystemNotifications([]))
        }
      } else {
        'error' in dismissAllError && toast.error(dismissAllError.error)
      }
    }
  }, [
    isLoadingDismissAll,
    dismissAllError,
    dismissAllUninitialized,
    isSuperAdmin,
    systemNotifications.length,
    userNotifications.length,
  ])

  return (
    <StyledNotificationMenu
      anchorEl={props.anchorElement}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      id="notification-menu"
      keepMounted
      mobilebreak={mobileBreak.toString()}
      onClose={props.clickCloseMenu}
      open={Boolean(props.anchorElement)}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
    >
      <StyledNotificationActionArea>
        <Grid
          container
          direction="row"
          display="flex"
          justifyContent="center"
          margin="12px"
          width="auto"
        >
          <Typography
            color="primary"
            fontWeight={700}
            variant="body1"
          >
            {strings.NOTIFICATIONS}
            {
              <Fade in={notificationCount > 0}>
                <span>{`: ${notificationCount || ''}`}</span>
              </Fade>
            }
          </Typography>
        </Grid>
      </StyledNotificationActionArea>
      <Collapse in={notificationCount === 0}>
        <Grid
          alignItems="center"
          container
          direction="column"
          display="flex"
          justifyContent="center"
          minHeight="100px"
        >
          {props.anchorElement && <NoDataLottie />}
          <Typography
            color="primary"
            mb={3}
            pl={4}
            pr={4}
            textAlign="center"
            variant="h6"
          >
            {strings.NOTIFICATIONS_WILL_APPEAR_HERE}
          </Typography>
        </Grid>
      </Collapse>
      <StyledNotificationsList maxHeight="80vh">
        <TransitionGroup>
          {systemNotifications.map((notification) => {
            return (
              <Collapse key={notification.id}>
                <NotificationComponent notification={notification} />
              </Collapse>
            )
          })}
        </TransitionGroup>
        <TransitionGroup>
          {userNotifications.map((notification) => {
            return (
              <Collapse key={notification.id}>
                <NotificationComponent notification={notification} />
              </Collapse>
            )
          })}
        </TransitionGroup>
      </StyledNotificationsList>
      <Collapse in={notificationCount > 0}>
        <StyledNotificationActionArea>
          <Grid
            container
            direction="row"
            display="flex"
            justifyContent="flex-end"
            margin="3px"
            width="auto"
          >
            <Grid>
              <IconButton
                color="info"
                onClick={async () => {
                  if (systemNotifications.length && isSuperAdmin) {
                    requestDismissAll({ userId: NIL_UUID })
                  }
                  if (userNotifications.length) {
                    requestDismissAll({ userId })
                  }
                }}
              >
                <GradingIcon />
              </IconButton>
            </Grid>
          </Grid>
        </StyledNotificationActionArea>
      </Collapse>
    </StyledNotificationMenu>
  )
}
