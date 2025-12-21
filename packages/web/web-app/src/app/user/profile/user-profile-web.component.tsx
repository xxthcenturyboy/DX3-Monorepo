import { Box, Button, Divider, Grid, Paper, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'

import type { EmailType, MediaDataType, PhoneType } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { EmailList } from '../../email/email-web-list.component'
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
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

  React.useEffect(() => {
    setDocumentTitle('Profile')
  }, [])

  const toggleDarkMode = () => {
    if (appMode) {
      const nextMode = appMode === 'light' ? 'dark' : 'light'
      dispatch(uiActions.themeModeSet(nextMode))
    }
  }

  const addEmailToProfile = (email: EmailType) => {
    dispatch(userProfileActions.emailAddedToProfile(email))
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
                  handleChangeImage={() =>
                    dispatch(
                      uiActions.appDialogSet(
                        <UserProfileWebAvatarDialog avatarDataCallback={avatarDataCallback} />,
                      ),
                    )
                  }
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
                  Toggle Dark Mode
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </ContentWrapper>
  )
}
