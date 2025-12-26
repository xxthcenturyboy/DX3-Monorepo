import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Grid, Typography } from '@mui/material'
import type React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { logger } from '@dx3/web-libs/logger'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'

import { WebConfigService } from '../config/config-web.service'
import { useStrings } from '../i18n'
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
  const strings = useStrings(['CANCEL', 'LOG_OUT', 'LOGOUT', 'COULD_NOT_LOGOUT'])

  const logout = async (): Promise<void> => {
    if (onLocalClick && typeof onLocalClick === 'function') {
      onLocalClick()
    }

    try {
      dispatch(
        uiActions.appDialogSet(
          <ConfirmationDialog
            cancelText={strings.CANCEL}
            noAwait={true}
            // bodyMessage="Is it really time to go?"
            okText={strings.LOG_OUT}
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
                  toast.warn(strings.COULD_NOT_LOGOUT)
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
        <Grid
          alignItems="center"
          container
          direction="row"
          justifyContent="flex-start"
        >
          <Grid mr={2}>
            <LogoutIcon />
          </Grid>
          <Grid>
            <Typography variant="body2">{strings.LOGOUT}</Typography>
          </Grid>
        </Grid>
      </StyledAccountMenuListItem>
    )
  }

  if (context === 'APP_MENU') {
    return (
      <Button
        endIcon={<LogoutIcon />}
        onClick={logout}
      >
        {strings.LOGOUT}
      </Button>
    )
  }

  return <Button onClick={logout}>{strings.LOGOUT}</Button>
}
