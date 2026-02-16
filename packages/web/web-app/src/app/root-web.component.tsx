import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { DialogApiError } from '@dx3/web-libs/ui/dialog/api-error.dialog'
import { GlobalAwaiter } from '@dx3/web-libs/ui/global/global-awaiter.component'
import { DRAWER_WIDTH, MEDIA_BREAK, STORAGE_KEYS_UI } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from './auth/auth-web.selector'
import { appBootstrap } from './config/bootstrap/app-bootstrap'
import { WebConfigService } from './config/config-web.service'
import { useAppDispatch, useAppSelector } from './store/store-web-redux.hooks'
import { AppNavBar } from './ui/menus/app-nav-bar.menu'
import { MenuNav } from './ui/menus/menu-nav'
import { WEB_APP_COLOR_PALETTE } from './ui/mui-themes/mui.palette'
import { getTheme } from './ui/mui-themes/mui-theme.service'
import { uiActions } from './ui/store/ui-web.reducer'
import {
  selectIsMobileWidth,
  selectWindowHeight,
  selectWindowWidth,
} from './ui/store/ui-web.selector'
import { TOAST_LOCATION, TOAST_TIMEOUT } from './ui/ui-web.consts'
import { useLazyGetProfileQuery } from './user/profile/user-profile-web.api'
import { userProfileActions } from './user/profile/user-profile-web.reducer'

export const Root: React.FC = () => {
  const [bootstrapped, setBootstrapped] = React.useState(false)
  const [menuBreak, setMenuBreak] = React.useState(false)
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const [topPixel, setTopPixel] = React.useState(64)
  const [appFrameStyle, setAppFrameStyle] = React.useState<React.CSSProperties>({
    height: '100vh',
    zIndex: 1,
  })
  const [contentWrapperStyle, setContentWrapperStyle] = React.useState<React.CSSProperties>({})
  const dispatch = useAppDispatch()
  const userProfile = useAppSelector((state) => state.userProfile)
  const menuOpen = useAppSelector((state) => state.ui.menuOpen)
  const themeState = useAppSelector((state) => state.ui.theme)
  const isAuthenticated = useAppSelector((state) => selectIsAuthenticated(state))
  const logoutResponse = useAppSelector((state) => state.auth.logoutResponse)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state)) || 0
  const windowWidth = useAppSelector((state) => selectWindowWidth(state)) || 0
  const dialogAwaiterMessage = useAppSelector((state) => state.ui.awaitDialogMessage)
  const dialogAwaiterOpen = useAppSelector((state) => state.ui.awaitDialogOpen)
  const dialogErrorMessage = useAppSelector((state) => state.ui.apiDialogError)
  const dialogErrorOpen = useAppSelector((state) => state.ui.apiDialogOpen)
  // const toastTheme: ToastifyTheme = useAppSelector((state: RootState) => state.ui.theme.palette || 'color');
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const ROUTES = WebConfigService.getWebRoutes()
  const NO_REDICRET_ROUTES = WebConfigService.getNoRedirectRoutes()
  const canRedirect = !NO_REDICRET_ROUTES.some((route) => pathname === route)
  const [fetchProfile, { data: profileResponse, isSuccess: fetchProfileSuccess }] =
    useLazyGetProfileQuery()
  const theme = React.useMemo(() => {
    const nextTheme = createTheme(getTheme())
    setAppFrameStyle({
      ...appFrameStyle,
      backgroundColor: nextTheme.palette.background.default,
    })
    return nextTheme
  }, [themeState])

  const updateContentWrapperStyles = (): void => {
    const getContentWrapperStyles = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        height: `calc(100vh - ${topPixel}px)`, // Subtract width of header
        overflow: 'auto',
        position: 'relative',
        top: `${topPixel}px`,
        transition: theme.transitions.create('margin', {
          duration: theme.transitions.duration.leavingScreen,
          easing: theme.transitions.easing.sharp,
        }),
      }

      let openStyles: React.CSSProperties = {}

      if (menuOpen && !menuBreak) {
        openStyles = {
          marginLeft: `${DRAWER_WIDTH}px`,
          transition: theme.transitions.create('margin', {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeOut,
          }),
        }
      }

      return {
        ...baseStyle,
        ...openStyles,
      }
    }

    const styles = getContentWrapperStyles()
    setContentWrapperStyle(styles)
  }

  React.useEffect(() => {
    updateContentWrapperStyles()
  }, [])

  // Bootstrap and resize listener: run once on mount only.
  // Re-running on navigation caused appBootstrap (i18n) to re-execute and slowed nav.
  React.useEffect(() => {
    appBootstrap()
    dispatch(uiActions.windowSizeSet())
    const handleResize = () => {
      dispatch(uiActions.windowSizeSet())
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    setBootstrapped(true)
    dispatch(uiActions.bootstrapSet(true))
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [dispatch])

  // Fetch profile when on a redirect route and profile is missing.
  React.useEffect(() => {
    if (!userProfile && canRedirect) {
      void fetchProfile()
    }
  }, [canRedirect, fetchProfile, userProfile])

  React.useEffect(() => {
    if (logoutResponse) {
      dispatch(uiActions.toggleMenuSet(false))
      dispatch(userProfileActions.profileInvalidated())
      canRedirect && navigate(ROUTES.MAIN)
    }
  }, [logoutResponse, canRedirect])

  React.useEffect(() => {
    if (
      fetchProfileSuccess &&
      profileResponse.profile &&
      typeof profileResponse.profile !== 'string'
    ) {
      dispatch(userProfileActions.profileUpdated(profileResponse.profile))
    }
  }, [fetchProfileSuccess, profileResponse?.profile])

  React.useEffect(() => {
    if (bootstrapped) {
      updateContentWrapperStyles()
      if (isAuthenticated) {
        localStorage.setItem(STORAGE_KEYS_UI.MENU_STATE, menuOpen ? 'OPEN' : 'CLOSED')
        if (theme.palette.mode === 'light') {
          setAppFrameStyle({
            ...appFrameStyle,
            backgroundColor: theme.palette.background.default,
          })
        }
      }
    }
  }, [menuOpen, bootstrapped, isAuthenticated])

  React.useEffect(() => {
    mobileBreak ? setTopPixel(57) : setTopPixel(64)
  }, [mobileBreak])

  React.useEffect(() => {
    if (bootstrapped) {
      updateContentWrapperStyles()
    }
  }, [bootstrapped])

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
    if (
      theme.palette.mode === 'light' &&
      (pathname === ROUTES.AUTH.LOGIN || pathname === ROUTES.AUTH.SIGNUP)
    ) {
      setAppFrameStyle({
        ...appFrameStyle,
        backgroundColor: WEB_APP_COLOR_PALETTE.BACKGROUND.LIGHT.PAPER,
      })
    }
  }, [windowWidth])

  return (
    <ThemeProvider theme={theme}>
      <Fade
        in={true}
        timeout={300}
      >
        <Box
          flexGrow={1}
          style={appFrameStyle}
        >
          {isAuthenticated && <MenuNav />}
          <AppNavBar />
          <Box style={contentWrapperStyle}>
            <Outlet />
          </Box>
        </Box>
      </Fade>
      <DialogApiError
        closeDialog={() => dispatch(uiActions.apiDialogSet(''))}
        isMobileWidth={isMobileWidth}
        message={dialogErrorMessage || ''}
        open={dialogErrorOpen}
        windowHeight={windowHeight}
      />
      <GlobalAwaiter
        message={dialogAwaiterMessage || ''}
        open={dialogAwaiterOpen}
      />
      <ToastContainer
        autoClose={TOAST_TIMEOUT}
        closeOnClick
        position={TOAST_LOCATION}
        theme={'colored'}
        transition={Slide}
      />
    </ThemeProvider>
  )
}
