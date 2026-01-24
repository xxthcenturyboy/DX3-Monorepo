import Menu from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  type ButtonOwnProps,
  Icon,
  IconButton,
  Slide,
  styled,
  Toolbar,
  useTheme,
} from '@mui/material'
import React from 'react'
import { Link, useLocation } from 'react-router'

import { DrawerMenuComponent } from '@dx3/web-libs/ui/dialog/drawer-menu.component'
import { DRAWER_WIDTH, MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { PublicMenu } from './public-menu.component'

const Logo = styled('img')`
  width: 36px;
`

/**
 * Simplified SSR-safe navbar for public pages.
 * Does not depend on Redux state (auth, userProfile, notifications, UI) or Socket.IO.
 * Always shows public navigation (FAQ, About, Blog, Login, Signup).
 * Matches the CSR navbar pattern for unauthenticated users.
 */
export const AppNavBarSsr: React.FC = () => {
  const { pathname } = useLocation()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings(['ABOUT', 'BLOG', 'FAQ', 'HOME', 'LOGIN', 'SIGNUP'])
  const theme = useTheme()
  const [publicMenuOpen, setPublicMenuOpen] = React.useState(false)
  // Always use 1920 as initial value for SSR/hydration consistency
  // Real window width is set in useEffect after hydration
  const [windowWidth, setWindowWidth] = React.useState(1920)
  const [mobileBreak, setMobileBreak] = React.useState(false)

  // Hardcoded logo URL for SSR (no Redux state)
  const logoUrl = '/assets/img/text-logo-square.png'

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  React.useEffect(() => {
    // Set real window width after hydration
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handlePublicMenuToggle = () => {
    setPublicMenuOpen(!publicMenuOpen)
  }

  const toggleMenuState = (): void => {
    setPublicMenuOpen(false)
  }

  const getAuthButtonColor = (type: 'login' | 'signup'): ButtonOwnProps['color'] => {
    if (theme.palette.mode === 'dark') {
      if (pathname === ROUTES.AUTH.LOGIN && type === 'login') {
        return 'primary'
      }

      if (pathname === ROUTES.AUTH.SIGNUP && type === 'signup') {
        return 'primary'
      }

      // @ts-expect-error - causes error, but it's ok
      return ''
    }

    if (theme.palette.mode === 'light') {
      if (pathname === ROUTES.AUTH.LOGIN && type === 'login') {
        return 'secondary'
      }

      if (pathname === ROUTES.AUTH.SIGNUP && type === 'signup') {
        return 'secondary'
      }

      return 'primary'
    }

    return 'inherit'
  }

  const getPublicNavButtonColor = (route: string): ButtonOwnProps['color'] => {
    if (theme.palette.mode === 'dark') {
      if (pathname === route) {
        return 'primary'
      }

      // @ts-expect-error - causes error, but it's ok
      return ''
    }

    if (theme.palette.mode === 'light') {
      if (pathname === route) {
        return 'secondary'
      }

      return 'primary'
    }

    return 'inherit'
  }

  const topPixel = mobileBreak ? 56 : 64

  return (
    <Box>
      <AppBar
        color="primary"
        elevation={2}
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
          <Link
            aria-label="home"
            style={{ alignItems: 'center', cursor: 'pointer', display: 'flex' }}
            to={ROUTES.MAIN}
          >
            <Icon
              color="inherit"
              sx={{
                display: 'flex',
                height: '1.75em',
                mr: 1,
                width: '1.75em',
              }}
            >
              <Logo src={logoUrl} />
            </Icon>
          </Link>
          {!mobileBreak && (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                gap: 1.5,
                ml: 2,
              }}
            >
              <Button
                color={getPublicNavButtonColor(ROUTES.FAQ)}
                component={Link}
                style={{
                  boxShadow: 'none',
                  padding: '6px 12px',
                }}
                to={ROUTES.FAQ}
                variant="contained"
              >
                {strings.FAQ}
              </Button>
              <Button
                color={getPublicNavButtonColor(ROUTES.ABOUT)}
                component={Link}
                style={{
                  boxShadow: 'none',
                  padding: '6px 12px',
                }}
                to={ROUTES.ABOUT}
                variant="contained"
              >
                {strings.ABOUT}
              </Button>
              <Button
                color={getPublicNavButtonColor(ROUTES.BLOG)}
                component={Link}
                style={{
                  boxShadow: 'none',
                  padding: '6px 12px',
                }}
                to={ROUTES.BLOG}
                variant="contained"
              >
                {strings.BLOG}
              </Button>
            </Box>
          )}
          {mobileBreak && (
            <Box
              sx={{
                flexGrow: 1,
              }}
            />
          )}
          <Slide
            direction="left"
            in={true}
            mountOnEnter
            unmountOnExit
          >
            <span>
              <Button
                color={getAuthButtonColor('login')}
                component={Link}
                style={{
                  boxShadow: 'none',
                  marginRight: '12px',
                  padding: '6px 12px',
                }}
                to={ROUTES.AUTH.LOGIN}
                variant="contained"
              >
                {strings.LOGIN}
              </Button>
              <Button
                color={getAuthButtonColor('signup')}
                component={Link}
                style={{
                  boxShadow: 'none',
                  padding: '6px 12px',
                }}
                to={ROUTES.AUTH.SIGNUP}
                variant="contained"
              >
                {strings.SIGNUP}
              </Button>
            </span>
          </Slide>
          {mobileBreak && (
            <IconButton
              aria-label="public menu"
              color="inherit"
              edge="end"
              onClick={handlePublicMenuToggle}
              size="large"
              sx={{
                ml: 1,
              }}
            >
              <Menu className="toolbar-icons" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <DrawerMenuComponent
        anchor={mobileBreak ? 'bottom' : 'left'}
        clickCloseMenu={toggleMenuState}
        open={publicMenuOpen}
        topPixel={topPixel}
        width={mobileBreak ? '100%' : `${DRAWER_WIDTH}px`}
        widthOuter={`${DRAWER_WIDTH}px`}
      >
        <PublicMenu
          closeMenu={toggleMenuState}
          mobileBreak={mobileBreak}
        />
      </DrawerMenuComponent>
    </Box>
  )
}
