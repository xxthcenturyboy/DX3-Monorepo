import { Box, Button, Divider, Grid, Paper, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { createPortal } from 'react-dom'

import type { EmailType, MediaDataType, PhoneType } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/system/ui.consts'

import { EmailList } from '../../email/email-web-list.component'
import { useStrings } from '../../i18n'
import { Phonelist } from '../../phone/phone-web-list.component'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { userProfileActions } from './user-profile-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UserProfileAvatar } from './user-profile-web-avatar.component'
import { UserProfileWebAvatarDialog } from './user-profile-web-avatar.dialog'
import { UserProfileHeaderComponent } from './user-profile-web-header.component'

export const UserProfile: React.FC = () => {
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const appMode = useAppSelector((state) => state.ui.theme.palette?.mode)
  const [avatarDialogOpen, setAvatarDialogOpen] = React.useState(false)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const strings = useStrings(['PAGE_TITLE_PROFILE', 'TOGGLE_DARK_MODE'])

  React.useEffect(() => {
    setDocumentTitle(strings.PAGE_TITLE_PROFILE)
  }, [strings.PAGE_TITLE_PROFILE])

  const toggleDarkMode = () => {
    if (appMode) {
      const nextMode = appMode === 'light' ? 'dark' : 'light'
      dispatch(uiActions.themeModeSet(nextMode))
    }
  }

  const addEmailToProfile = (email: EmailType) => {
    if (email) {
      dispatch(userProfileActions.emailAddedToProfile(email))
    }
  }

  const removeEmailFromProfile = (email: EmailType) => {
    dispatch(userProfileActions.emailRemovedFromProfile(email.id))
  }

  const addPhoneToProfile = (phone: PhoneType) => {
    dispatch(userProfileActions.phoneAddedToProfile(phone))
  }

  const removePhoneFromProfile = (phone: PhoneType) => {
    dispatch(userProfileActions.phoneRemovedFromProfile(phone.id))
  }

  const avatarDataCallback = (data: Partial<MediaDataType>) => {
    if (data.id === undefined) {
      return
    }
    dispatch(userProfileActions.profileImageUpdate(data.id))
  }

  const avatarDialogtModal = createPortal(
    <CustomDialog
      body={
        <UserProfileWebAvatarDialog
          avatarDataCallback={avatarDataCallback}
          closeDialog={() => setAvatarDialogOpen(false)}
        />
      }
      closeDialog={() => setAvatarDialogOpen(false)}
      isMobileWidth={SM_BREAK}
      open={avatarDialogOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  return (
    <ContentWrapper contentTopOffset={SM_BREAK ? '98px' : '56px'}>
      <UserProfileHeaderComponent />
      <Box
        padding="24px"
        width={'100%'}
      >
        <Paper elevation={2}>
          <Grid
            container
            justifyContent="flex-start"
            padding={SM_BREAK ? '16px' : '24px'}
          >
            <Grid
              container
              direction={MD_BREAK ? 'column' : 'row'}
              justifyContent={'center'}
              size={12}
            >
              <Grid
                alignItems={'center'}
                justifyContent={'center'}
                paddingTop={'12px'}
                size={12}
                width={'100%'}
              >
                <UserProfileAvatar
                  fontSize="6rem"
                  handleChangeImage={() => setAvatarDialogOpen(true)}
                  justifyContent="center"
                  size={{
                    height: 142,
                    width: 142,
                  }}
                />
              </Grid>
            </Grid>
            <Divider
              sx={{
                margin: '24px 0 0 0',
                width: '100%',
              }}
            />

            <Grid
              container
              direction={MD_BREAK ? 'column' : 'row'}
              justifyContent={'center'}
              size={12}
            >
              <Grid
                padding="10px"
                size={{
                  lg: 6,
                  sm: 12,
                }}
                width={'100%'}
              >
                <EmailList
                  emailDataCallback={addEmailToProfile}
                  emailDeleteCallback={removeEmailFromProfile}
                  emails={profile.emails}
                  userId={profile.id}
                />
              </Grid>
              <Grid
                padding="10px"
                size={{
                  lg: 6,
                  sm: 12,
                }}
                width={'100%'}
              >
                <Phonelist
                  phoneDataCallback={addPhoneToProfile}
                  phoneDeleteCallback={removePhoneFromProfile}
                  phones={profile.phones}
                  userId={profile.id}
                />
              </Grid>
            </Grid>

            <Divider
              sx={{
                margin: '12px 0 12px 0',
                width: '100%',
              }}
            />
            <Grid
              container
              direction={MD_BREAK ? 'column' : 'row'}
              justifyContent={'flex-start'}
              size={12}
            >
              <Grid
                padding="10px"
                width={MD_BREAK ? '100%' : '50%'}
              >
                <Button
                  onClick={toggleDarkMode}
                  variant="outlined"
                >
                  {strings.TOGGLE_DARK_MODE}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      {avatarDialogtModal}
    </ContentWrapper>
  )
}
