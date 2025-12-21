import { Button, useMediaQuery, useTheme } from '@mui/material'
import type * as React from 'react'

import { logger } from '@dx3/web-libs/logger'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import type { RootState } from '../../store/store-web.redux'
import { useAppDispatch, useAppSelector } from '../../store/store-web.redux'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UserProfileChangePasswordDialog } from './user-profile-web-change-password.dialog'

export const UserProfileHeaderComponent: React.FC = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const TITLE_STRING =
    useAppSelector((state: RootState) => state.ui.strings.UserProfile) || 'User Profile'
  const TITLE = profile.username ? `${TITLE_STRING} - ${profile.username}` : TITLE_STRING

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
          Change Password
        </Button>
      }
      headerTitle={TITLE}
    />
  )
}
