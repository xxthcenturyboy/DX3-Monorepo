import { Chip, useMediaQuery, useTheme } from '@mui/material'
import { grey, lightBlue } from '@mui/material/colors'
import type * as React from 'react'
import { useNavigate } from 'react-router'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { WebConfigService } from '../../config/config-web.service'
import type { RootState } from '../../store/store-web.redux'
import { useAppSelector } from '../../store/store-web.redux'
import { selectUserFormatted } from './user-admin-web.selectors'

export const UserAdminEditHeaderComponent: React.FC = () => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const username = useAppSelector((state) => state.userAdmin.user?.fullName)
  const TITLE_STRING =
    useAppSelector((state: RootState) => state.ui.strings.UserEditAdmin) || 'Edit User'
  const TITLE = username ? `${TITLE_STRING} - ${username}` : TITLE_STRING
  const user = useAppSelector((state) => selectUserFormatted(state))
  const ROUTES = WebConfigService.getWebRoutes()

  return (
    <ContentHeader
      headerColumnRightJustification={'flex-end'}
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
        <>
          {user?.optInBeta && (
            <Chip
              label="Opt-in Beta"
              sx={{
                backgroundColor: lightBlue[700],
                color: grey[50],
                margin: SM_BREAK ? '0 0 0 12px' : '0 12px 0 0',
              }}
            />
          )}
          {user?.restrictions && user.restrictions.length > 0 && (
            <Chip
              color="error"
              label="RESTRICTED"
            />
          )}
        </>
      }
      headerTitle={TITLE}
      navigation={() => navigate(ROUTES.ADMIN.USER.LIST)}
      tooltip={useAppSelector((state) => state.ui.strings.UserEditAdminTooltip)}
    />
  )
}
