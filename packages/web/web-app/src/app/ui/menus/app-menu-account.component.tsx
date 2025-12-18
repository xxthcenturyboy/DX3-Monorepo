import { Grid2 } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { LogoutButton } from '../../auth/auth-web-logout.button'
import { WebConfigService } from '../../config/config-web.service'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { UserProfileAvatar } from '../../user/profile/user-profile-web-avatar.component'
import {
  StyledAccountActionArea,
  StyledAccountList,
  StyledAccountMenuListItem,
  StyledAccountnMenu,
} from './app-menu-account.ui'

type AccountMenuPropsType = {
  anchorElement: HTMLElement | null
  clickCloseMenu: () => undefined
}

export const AccountMenu: React.FC<AccountMenuPropsType> = (props) => {
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const ROUTES = WebConfigService.getWebRoutes()
  const navigate = useNavigate()

  React.useEffect(() => {
    setMobileBreak(windowWidth < MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  const goToProfile = (): void => {
    navigate(ROUTES.USER_PROFILE.MAIN)
    props.clickCloseMenu()
  }

  return (
    <StyledAccountnMenu
      anchorEl={props.anchorElement}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      id="account-menu"
      keepMounted
      mobilebreak={mobileBreak.toString()}
      onClose={props.clickCloseMenu}
      open={Boolean(props.anchorElement)}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
    >
      <StyledAccountActionArea>
        <Grid2
          container
          direction="row"
          display="flex"
          justifyContent="center"
          margin="12px"
          width="auto"
        >
          <Typography
            color={themeColors.primary}
            fontWeight={700}
            variant="body1"
          >
            Account Menu
          </Typography>
        </Grid2>
      </StyledAccountActionArea>
      <StyledAccountList>
        <StyledAccountMenuListItem onClick={goToProfile}>
          <Grid2
            alignItems="center"
            container
            direction="row"
            justifyContent="flex-start"
          >
            <Grid2 mr={2}>
              <UserProfileAvatar
                size={{
                  height: 24,
                  width: 24,
                }}
              />
            </Grid2>
            <Grid2>
              <Typography variant="body2">Profile</Typography>
            </Grid2>
          </Grid2>
        </StyledAccountMenuListItem>
        <LogoutButton
          context="APP_BAR"
          onLocalClick={props.clickCloseMenu}
        />
      </StyledAccountList>
    </StyledAccountnMenu>
  )
}
