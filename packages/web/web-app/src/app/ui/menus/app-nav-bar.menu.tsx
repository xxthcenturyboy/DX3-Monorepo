import AccountCircle from '@mui/icons-material/AccountCircle'
import Apps from '@mui/icons-material/Apps'
import Menu from '@mui/icons-material/Menu'
import MenuOpen from '@mui/icons-material/MenuOpen'
import Notifications from '@mui/icons-material/Notifications'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Icon,
  IconButton,
  Slide,
  styled,
  Toolbar,
  Typography,
} from '@mui/material'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'

import { APP_NAME } from '@dx3/models-shared'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { loginBootstrap } from '../../config/bootstrap/login-bootstrap'
import { WebConfigService } from '../../config/config-web.service'
import {
  selectNotificationCount,
  // useTestSocketsMutation
} from '../../notifications/notification-web.selectors'
import { NotificationsMenu } from '../../notifications/notifications.menu'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'
import { AccountMenu } from './app-menu-account.component'

const Logo = styled('img')`
  width: 36px;
`

export const AppNavBar: React.FC = () => {
  const [anchorElementAccountMenu, setAnchorElementAccountMenu] =
    React.useState<null | HTMLElement>(null)
  const [anchorElementNotificationMenu, setAnchorElementNotificaitonMenu] =
    React.useState<null | HTMLElement>(null)
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => selectIsAuthenticated(state))
  const userProfile = useAppSelector((state) => state.userProfile)
  // const userId = useAppSelector(state => state.userProfile.id);
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const logoUrl = useAppSelector((state) => state.ui.logoUrlSmall)
  const menuOpen = useAppSelector((state) => state.ui.menuOpen)
  const themeMode = useAppSelector((state) => state.ui.theme.palette?.mode)
  const notificationCount = useAppSelector((state) => selectNotificationCount(state))
  const ROUTES = WebConfigService.getWebRoutes()
  // const [requestTestNotifications] = useTestSocketsMutation();
  let didCallBootstrap = false

  React.useEffect(() => {
    if (isAuthenticated && userProfile && !didCallBootstrap) {
      loginBootstrap(userProfile, mobileBreak)
      didCallBootstrap = true
    }
  }, [isAuthenticated, userProfile])

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  const toggleMenuState = (): void => {
    if (isAuthenticated) {
      dispatch(uiActions.toggleMenuSet(!menuOpen))
      return
    }

    navigate(ROUTES.MAIN)
  }

  const goToLogin = (): void => {
    navigate(ROUTES.AUTH.LOGIN)
  }

  const handleClickAccountMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (mobileBreak) {
      return toggleMenuState()
    }

    setAnchorElementAccountMenu(event.currentTarget)
  }

  const handleCloseAccountMenu = (): undefined => {
    setAnchorElementAccountMenu(null)
    return undefined
  }

  const handleClickNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementNotificaitonMenu(event.currentTarget)
    dispatch(uiActions.toggleMobileNotificationsOpenSet(true))
  }

  const handleNotificationMenu = () => {
    setAnchorElementNotificaitonMenu(null)
    dispatch(uiActions.toggleMobileNotificationsOpenSet(false))
  }

  const hideLoginForRoutes = (): boolean => {
    return pathname.includes(ROUTES.AUTH.LOGIN)
  }

  return (
    <Box>
      <AppBar
        color={themeMode === 'dark' ? 'default' : 'primary'}
        elevation={2}
        enableColorOnDark
        position="static"
        sx={{
          '& .MuiAppBar': {
            root: {},
          },
          position: 'fixed',
          width: '100%',
          zIndex: 1200,
        }}
      >
        <Toolbar>
          {!mobileBreak && (
            <Slide
              direction="right"
              in={isAuthenticated}
              mountOnEnter
              unmountOnExit
            >
              <IconButton
                aria-label="menu"
                color="inherit"
                edge="start"
                onClick={toggleMenuState}
                size="large"
                sx={{
                  mr: 1,
                }}
              >
                {menuOpen ? (
                  <MenuOpen className="toolbar-icons" />
                ) : (
                  <Menu className="toolbar-icons" />
                )}
              </IconButton>
            </Slide>
          )}
          <Icon
            aria-label="menu"
            color="inherit"
            onClick={() => {
              if (!isAuthenticated) {
                navigate(ROUTES.MAIN)
              }
            }}
            sx={{
              cursor: !isAuthenticated ? 'pointer' : 'initial',
              display: 'flex',
              height: '1.75em',
              mr: 1,
              width: '1.75em',
            }}
          >
            <Logo src={logoUrl} />
          </Icon>
          {!mobileBreak ? (
            <Typography
              className="toolbar-app-name"
              component="div"
              sx={{
                flexGrow: 1,
              }}
              variant="h6"
            >
              {APP_NAME}
            </Typography>
          ) : (
            <div
              style={{
                flexGrow: 1,
              }}
            >
              <span>&nbsp;</span>
            </div>
          )}
          <Slide
            direction="left"
            in={isAuthenticated}
            mountOnEnter
            unmountOnExit
          >
            <span>
              <IconButton
                aria-controls="notification-menu-appbar"
                aria-haspopup="true"
                aria-label="show notifications"
                className="toolbar-icons"
                onClick={handleClickNotificationMenu}
                size="large"
              >
                <Badge
                  badgeContent={notificationCount}
                  color="info"
                >
                  <Notifications />
                </Badge>
              </IconButton>
              <IconButton
                aria-controls="account-menu-appbar"
                aria-haspopup="true"
                aria-label="account menu for current user"
                className="toolbar-icons"
                onClick={handleClickAccountMenu}
                size="large"
              >
                {mobileBreak ? <Apps /> : <AccountCircle />}
              </IconButton>
            </span>
          </Slide>
          {!isAuthenticated && !mobileBreak && !hideLoginForRoutes() && (
            <Button
              color="primary"
              onClick={goToLogin}
              variant="contained"
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <AccountMenu
        anchorElement={anchorElementAccountMenu}
        clickCloseMenu={handleCloseAccountMenu}
      />
      <NotificationsMenu
        anchorElement={anchorElementNotificationMenu}
        clickCloseMenu={handleNotificationMenu}
      />
    </Box>
  )
}
