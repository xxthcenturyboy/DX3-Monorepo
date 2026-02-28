import ClearIcon from '@mui/icons-material/Clear'
import GradingIcon from '@mui/icons-material/Grading'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import React from 'react'
import { toast } from 'react-toastify'
import { TransitionGroup } from 'react-transition-group'
import { NIL as NIL_UUID } from 'uuid'

import { DrawerMenuComponent } from '@dx3/web-libs/ui/dialog/drawer-menu.component'
import {
  CloseViewItem,
  StyledBottomContainer,
  StyledBottomItem,
  StyledList,
} from '@dx3/web-libs/ui/dialog/drawer-menu.ui'
import { NoDataLottie } from '@dx3/web-libs/ui/lottie/no-data.lottie'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { selectHasSuperAdminRole } from '../user/profile/user-profile-web.selectors'
import { useMarkAllAsDismissedMutation } from './notification-web.api'
import { NotificationComponent } from './notification-web.component'
import { notificationActions } from './notification-web.reducer'
import { selectNotificationCount } from './notification-web.selectors'
import { StyledNotificationsList } from './notification-web-menu.ui'

type NotificationsMobilePropsType = {
  clickCloseMenu: () => void
}

export const NotificationsMobile: React.FC<NotificationsMobilePropsType> = (props) => {
  const open = useAppSelector((state) => state.ui.mobileNotiicationsOpen)
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
  const topPixel = mobileBreak ? 36 : 42

  React.useEffect(() => {
    setMobileBreak(windowWidth <= MEDIA_BREAK.MOBILE)
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
        toast.error(getErrorStringFromApiResponse(dismissAllError))
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
    <DrawerMenuComponent
      anchor="bottom"
      clickCloseMenu={props.clickCloseMenu}
      open={open}
      topPixel={topPixel}
      width="100%"
      widthOuter="100%"
    >
      <StyledList>
        <CloseViewItem justifcation="space-between">
          <Typography
            color="default"
            fontWeight={700}
            textAlign="center"
            variant="h6"
          >
            {strings.NOTIFICATIONS}
            {notificationCount > 0 && <span>{`: ${notificationCount || ''}`}</span>}
          </Typography>
          <IconButton
            color="default"
            onClick={props.clickCloseMenu}
            style={{
              padding: 0,
            }}
          >
            <ClearIcon
              style={{
                fontSize: '26px',
              }}
            />
          </IconButton>
        </CloseViewItem>
        <Collapse in={notificationCount === 0}>
          <Grid
            alignItems="center"
            container
            direction="column"
            display="flex"
            justifyContent="center"
            minHeight="100px"
          >
            <NoDataLottie />
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
        <StyledNotificationsList>
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
      </StyledList>
      <Collapse in={notificationCount > 0}>
        <StyledBottomContainer width="100%">
          <Divider key="dismiss-all-divider" />
          <StyledBottomItem key="dismiss-all-item">
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
          </StyledBottomItem>
        </StyledBottomContainer>
      </Collapse>
    </DrawerMenuComponent>
  )
}
