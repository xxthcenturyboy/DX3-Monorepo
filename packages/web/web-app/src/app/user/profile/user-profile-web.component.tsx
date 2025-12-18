import { Button, Divider, Grid2, Paper, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'

import type { EmailType, MediaDataType, PhoneType } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
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
import { UserProfileChangePasswordDialog } from './user-profile-web-change-password.dialog'

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

  const handlePasswordReset = async (): Promise<void> => {
    const primaryEmail = profile?.emails.find((e) => e.default)
    if (primaryEmail) {
      try {
        dispatch(uiActions.appDialogSet(<UserProfileChangePasswordDialog userId={profile.id} />))
      } catch (err) {
        logger.error(err)
      }
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
    <ContentWrapper
      contentMarginTop={SM_BREAK ? '98px' : '56px'}
      headerColumnRightJustification={SM_BREAK ? 'center' : 'flex-end'}
      headerColumnsBreaks={{
        left: {
          sm: 6,
          xs: 12,
        },
        right: {
          sm: 6,
          xs: 12,
        },
      }}
      headerContent={
        <Button
          fullWidth={!!SM_BREAK}
          onClick={handlePasswordReset}
          size="small"
          variant="contained"
        >
          Change Password
        </Button>
      }
      headerTitle={`Profile: ${profile.username}`}
    >
      <Paper elevation={2}>
        <Grid2
          container
          justifyContent="flex-start"
          padding={SM_BREAK ? '16px' : '24px'}
        >
          <Grid2
            container
            direction={MD_BREAK ? 'column' : 'row'}
            justifyContent={'center'}
            size={12}
          >
            <Grid2
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
            </Grid2>
          </Grid2>
          <Divider
            sx={{
              margin: '24px 0 0 0',
              width: '100%',
            }}
          />

          <Grid2
            container
            direction={MD_BREAK ? 'column' : 'row'}
            justifyContent={'center'}
            size={12}
          >
            <Grid2
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
            </Grid2>
            <Grid2
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
            </Grid2>
          </Grid2>

          <Divider
            sx={{
              margin: '12px 0 12px 0',
              width: '100%',
            }}
          />
          <Grid2
            container
            direction={MD_BREAK ? 'column' : 'row'}
            justifyContent={'flex-start'}
            size={12}
          >
            <Grid2
              padding="10px"
              width={MD_BREAK ? '100%' : '50%'}
            >
              <Button
                onClick={toggleDarkMode}
                variant="outlined"
              >
                Toggle Dark Mode
              </Button>
            </Grid2>
          </Grid2>
        </Grid2>
      </Paper>
    </ContentWrapper>
  )
}
