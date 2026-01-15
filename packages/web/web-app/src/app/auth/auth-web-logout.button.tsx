import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Grid, Typography } from '@mui/material'
import React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { WebConfigService } from '../config/config-web.service'
import { featureFlagsActions } from '../feature-flags/feature-flag-web.reducer'
import { FeatureFlagWebSockets } from '../feature-flags/feature-flag-web.sockets'
import { useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { StyledAccountMenuListItem } from '../ui/menus/app-menu-account.ui'
import { uiActions } from '../ui/store/ui-web.reducer'
import { selectIsMobileWidth } from '../ui/store/ui-web.selector'
import { useLogoutMutation } from './auth-web.api'
import { authActions } from './auth-web.reducer'

type LogoutButtonType = {
  context: 'APP_MENU' | 'APP_BAR'
  onLocalClick?: () => undefined
}

export const LogoutButton: React.FC<LogoutButtonType> = ({ context, onLocalClick }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [requestLogout] = useLogoutMutation()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings([
    'ARE_YOU_SURE_YOU_WANT_TO_LOG_OUT',
    'CANCEL',
    'CANCELING',
    'LOG_OUT',
    'LOGOUT',
    'COULD_NOT_LOGOUT',
  ])

  const logout = async (): Promise<void> => {
    if (onLocalClick && typeof onLocalClick === 'function') {
      onLocalClick()
    }

    setConfirmOpen(true)
  }

  const confirmModal = createPortal(
    <CustomDialog
      body={
        <ConfirmationDialog
          bodyMessage={strings.ARE_YOU_SURE_YOU_WANT_TO_LOG_OUT}
          cancellingText={strings.CANCELING}
          cancelText={strings.CANCEL}
          okText={strings.LOG_OUT}
          onComplete={async (isConfirmed: boolean) => {
            if (isConfirmed) {
              try {
                const logoutResponse = await requestLogout().unwrap()
                if (logoutResponse.loggedOut) {
                  dispatch(uiActions.toggleMenuSet(false))
                  // Disconnect feature flag sockets
                  if (FeatureFlagWebSockets.instance) {
                    FeatureFlagWebSockets.instance.disconnect()
                  }
                  sleep(500).then(() => {
                    setConfirmOpen(false)
                    dispatch(authActions.tokenRemoved())
                    dispatch(authActions.setLogoutResponse(true))
                    // Clear feature flags state
                    dispatch(featureFlagsActions.featureFlagsInvalidated())
                    navigate(ROUTES.AUTH.LOGIN)
                  })
                }
              } catch (err) {
                logger.error(err)
                toast.warn(strings.COULD_NOT_LOGOUT)
              }
            }

            if (!isConfirmed) {
              setConfirmOpen(false)
            }
          }}
        />
      }
      closeDialog={() => setConfirmOpen(false)}
      isMobileWidth={isMobileWidth}
      open={confirmOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

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
        {confirmModal}
      </StyledAccountMenuListItem>
    )
  }

  if (context === 'APP_MENU') {
    return (
      <>
        <Button
          endIcon={<LogoutIcon />}
          onClick={logout}
        >
          {strings.LOG_OUT}
        </Button>
        {confirmModal}
      </>
    )
  }

  return (
    <>
      <Button onClick={logout}>{strings.LOG_OUT}</Button>
      {confirmModal}
    </>
  )
}
