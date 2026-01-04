import { Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { LogoutButton } from '../../auth/auth-web-logout.button'
import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
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
  const strings = useStrings(['ACCOUNT_MENU', 'PROFILE'])

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
            {strings.ACCOUNT_MENU}
          </Typography>
        </Grid>
      </StyledAccountActionArea>
      <StyledAccountList>
        <StyledAccountMenuListItem onClick={goToProfile}>
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="flex-start"
          >
            <Grid mr={2}>
              <UserProfileAvatar
                size={{
                  height: 24,
                  width: 24,
                }}
              />
            </Grid>
            <Grid>
              <Typography variant="body2">{strings.PROFILE}</Typography>
            </Grid>
          </Grid>
        </StyledAccountMenuListItem>
        <LogoutButton
          context="APP_BAR"
          onLocalClick={props.clickCloseMenu}
        />
      </StyledAccountList>
    </StyledAccountnMenu>
  )
}
