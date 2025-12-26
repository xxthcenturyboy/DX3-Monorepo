import { Button, useMediaQuery, useTheme } from '@mui/material'
import type * as React from 'react'

import { logger } from '@dx3/web-libs/logger'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web.redux'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UserProfileChangePasswordDialog } from './user-profile-web-change-password.dialog'

export const UserProfileHeaderComponent: React.FC = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const strings = useStrings(['PAGE_TITLE_USER_PROFILE', 'CHANGE_PASSWORD'])
  const title = profile.username
    ? `${strings.PAGE_TITLE_USER_PROFILE} - ${profile.username}`
    : strings.PAGE_TITLE_USER_PROFILE

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

  return (
    <ContentHeader
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
          {strings.CHANGE_PASSWORD}
        </Button>
      }
      headerTitle={title}
    />
  )
}
