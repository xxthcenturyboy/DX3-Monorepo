import { Chip, useMediaQuery, useTheme } from '@mui/material'
import { grey, lightBlue } from '@mui/material/colors'
import type * as React from 'react'
import { useNavigate } from 'react-router'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { WebConfigService } from '../../config/config-web.service'
import { useString, useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web.redux'
import { selectUserFormatted } from './user-admin-web.selectors'

export const UserAdminEditHeaderComponent: React.FC = () => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const username = useAppSelector((state) => state.userAdmin.user?.fullName)
  const titleString = useString('PAGE_TITLE_EDIT_USER')
  const title = username ? `${titleString} - ${username}` : titleString
  const user = useAppSelector((state) => selectUserFormatted(state))
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings(['OPT_IN_BETA', 'RESTRICTED'])

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
              label={strings.OPT_IN_BETA}
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
              label={strings.RESTRICTED.toUpperCase()}
            />
          )}
        </>
      }
      headerSubTitle={user ? user.createdAt : undefined}
      headerTitle={title}
      navigation={() => navigate(ROUTES.ADMIN.USER.LIST)}
    />
  )
}
