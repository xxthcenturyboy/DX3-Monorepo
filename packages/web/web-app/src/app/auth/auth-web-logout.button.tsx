import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Grid2, Typography } from '@mui/material'
import type React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { logger } from '@dx3/web-libs/logger'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'

import { WebConfigService } from '../config/config-web.service'
import { useAppDispatch } from '../store/store-web-redux.hooks'
import { StyledAccountMenuListItem } from '../ui/menus/app-menu-account.ui'
import { uiActions } from '../ui/store/ui-web.reducer'
import { useLogoutMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'

type LogoutButtonType = {
  context: 'APP_MENU' | 'APP_BAR'
  onLocalClick?: () => undefined
}

export const LogoutButton: React.FC<LogoutButtonType> = ({ context, onLocalClick }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [requestLogout] = useLogoutMutation()
  const ROUTES = WebConfigService.getWebRoutes()

  const logout = async (): Promise<void> => {
    if (onLocalClick && typeof onLocalClick === 'function') {
      onLocalClick()
    }

    try {
      dispatch(
        uiActions.appDialogSet(
          <ConfirmationDialog
            cancelText="Cancel"
            noAwait={true}
            // bodyMessage="Is it really time to go?"
            okText="Log Out"
            onComplete={async (isConfirmed: boolean) => {
              if (isConfirmed) {
                try {
                  const logoutResponse = await requestLogout().unwrap()
                  if (logoutResponse.loggedOut) {
                    dispatch(authActions.tokenRemoved())
                    dispatch(authActions.setLogoutResponse(true))
                    // toast.success('Logged out.');
                    navigate(ROUTES.AUTH.LOGIN)
                    setTimeout(() => dispatch(uiActions.appDialogSet(null)), 1500)
                    return
                  }
                  setTimeout(() => dispatch(uiActions.appDialogSet(null)), 1500)
                } catch (err) {
                  logger.error(err)
                  toast.warn('Could not complete the logout request.')
                }
              }

              if (!isConfirmed) {
                dispatch(uiActions.appDialogSet(null))
              }
            }}
          />,
        ),
      )
    } catch (err) {
      logger.error(err)
    }
  }

  if (context === 'APP_BAR') {
    return (
      <StyledAccountMenuListItem onClick={logout}>
        <Grid2
          alignItems="center"
          container
          direction="row"
          justifyContent="flex-start"
        >
          <Grid2 mr={2}>
            <LogoutIcon />
          </Grid2>
          <Grid2>
            <Typography variant="body2">Logout</Typography>
          </Grid2>
        </Grid2>
      </StyledAccountMenuListItem>
    )
  }

  if (context === 'APP_MENU') {
    return (
      <Button
        endIcon={<LogoutIcon />}
        onClick={logout}
      >
        Logout
      </Button>
    )
  }

  return <Button onClick={logout}>Logout</Button>
}
