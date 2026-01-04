import { Button, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web.redux'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UserProfileChangePasswordDialog } from './user-profile-web-change-password.dialog'

export const UserProfileHeaderComponent: React.FC = () => {
  const [pwdResetOpen, setPwdResetOpen] = React.useState(false)
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const strings = useStrings(['PAGE_TITLE_USER_PROFILE', 'CHANGE_PASSWORD', 'CREATE_PASSWORD'])
  const title = profile.username
    ? `${strings.PAGE_TITLE_USER_PROFILE} - ${profile.username}`
    : strings.PAGE_TITLE_USER_PROFILE

  const passwordResetModal = createPortal(
    <CustomDialog
      body={
        <UserProfileChangePasswordDialog
          closeDialog={() => setPwdResetOpen(false)}
          userId={profile.id}
        />
      }
      closeDialog={() => setPwdResetOpen(false)}
      isMobileWidth={SM_BREAK}
      open={pwdResetOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const handlePasswordReset = async (): Promise<void> => {
    const primaryEmail = profile?.emails.find((e) => e.default)
    if (primaryEmail) {
      setPwdResetOpen(true)
    } else {
      toast.info('You need to add a primary email before you can change your password')
    }
  }

  return (
    <>
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
            {profile.emails.length ? strings.CHANGE_PASSWORD : strings.CREATE_PASSWORD}
          </Button>
        }
        headerTitle={title}
      />
      {passwordResetModal}
    </>
  )
}
