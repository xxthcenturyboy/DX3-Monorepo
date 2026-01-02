import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { createTheme, type Theme, ThemeProvider } from '@mui/material/styles'
import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Slide, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { sleep } from '@dx3/utils-shared'
import { DialogApiError } from '@dx3/web-libs/ui/dialog/api-error.dialog'
import { GlobalAwaiter } from '@dx3/web-libs/ui/global/global-awaiter.component'
import { getTheme, getThemePalette } from '@dx3/web-libs/ui/system/mui-themes/mui-theme.service'
import { DRAWER_WIDTH, MEDIA_BREAK, STORAGE_KEYS_UI } from '@dx3/web-libs/ui/system/ui.consts'

import { selectIsAuthenticated } from './auth/auth-web.selector'
import { appBootstrap } from './config/bootstrap/app-bootstrap'
import { WebConfigService } from './config/config-web.service'
import { useAppDispatch, useAppSelector } from './store/store-web-redux.hooks'
import { AppNavBar } from './ui/menus/app-nav-bar.menu'
import { MenuNav } from './ui/menus/menu-nav'
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
  const [themeStateLocal, setThemeStateLocal] = React.useState<Theme>(createTheme(getTheme()))
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

  const updateAppThemeStyle = (): void => {
    const nextTheme = createTheme(getTheme())
    const themeColors = getThemePalette()
    setThemeStateLocal(nextTheme)

    setAppFrameStyle({
      ...appFrameStyle,
      backgroundColor: themeColors.background,
    })
  }

  const getContentWrapperStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      height: `calc(100vh - ${topPixel}px)`, // Subtract width of header
      // padding: themeStateLocal.spacing(3),
      // paddingBottom: themeStateLocal.spacing(3),
      overflow: 'auto',
      position: 'relative',
      top: `${topPixel}px`,
      transition: themeStateLocal.transitions.create('margin', {
        duration: themeStateLocal.transitions.duration.leavingScreen,
        easing: themeStateLocal.transitions.easing.sharp,
      }),
    }

    let openStyles: React.CSSProperties = {}

    if (menuOpen && !menuBreak) {
      openStyles = {
        marginLeft: `${DRAWER_WIDTH}px`,
        transition: themeStateLocal.transitions.create('margin', {
          duration: themeStateLocal.transitions.duration.enteringScreen,
          easing: themeStateLocal.transitions.easing.easeOut,
        }),
      }
    }

    return {
      ...baseStyle,
      ...openStyles,
    }
  }

  const updateContentWrapperStyles = (): void => {
    const styles = getContentWrapperStyles()
    setContentWrapperStyle(styles)
  }

  React.useEffect(() => {
    updateAppThemeStyle()
    updateContentWrapperStyles()
  }, [])

  React.useEffect(() => {
    appBootstrap()

    dispatch(uiActions.windowSizeSet())
    const handleResize = () => {
      dispatch(uiActions.windowSizeSet())
    }
    window.addEventListener('resize', handleResize)

    if (!userProfile && canRedirect) {
      void fetchProfile()
    }

    updateAppThemeStyle()

    sleep(200).then(() => {
      setBootstrapped(true)
      dispatch(uiActions.bootstrapSet(true))
      // loginBootstrap();
    })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [canRedirect, userProfile])

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
      updateAppThemeStyle()
    }
  }, [themeState, bootstrapped])

  React.useEffect(() => {
    if (bootstrapped) {
      updateContentWrapperStyles()
      if (isAuthenticated) {
        localStorage.setItem(STORAGE_KEYS_UI.MENU_STATE, menuOpen ? 'OPEN' : 'CLOSED')
      }
    }
  }, [menuOpen, bootstrapped, isAuthenticated])

  React.useEffect(() => {
    mobileBreak ? setTopPixel(60) : setTopPixel(64)
  }, [mobileBreak])

  React.useEffect(() => {
    if (bootstrapped) {
      updateContentWrapperStyles()
    }
  }, [bootstrapped])

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  return (
    <ThemeProvider theme={themeStateLocal}>
      <Fade
        in={true}
        timeout={2000}
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
