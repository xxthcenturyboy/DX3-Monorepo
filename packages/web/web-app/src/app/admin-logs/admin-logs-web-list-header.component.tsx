import Cached from '@mui/icons-material/Cached'
import { Grid, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { useStrings } from '../i18n'

type AdminLogsListHeaderComponentProps = {
  onRefresh: () => void
}

export const AdminLogsListHeaderComponent: React.FC<AdminLogsListHeaderComponentProps> = ({
  onRefresh,
}) => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const strings = useStrings(['ADMIN_LOGS_TITLE', 'TOOLTIP_REFRESH_LIST'])

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
        <Grid
          alignItems="center"
          container
          direction="row"
          justifyContent={SM_BREAK ? 'center' : 'flex-end'}
        >
          <IconButton
            color="primary"
            onClick={(event: React.SyntheticEvent) => {
              event.stopPropagation()
              onRefresh()
            }}
            sx={{
              boxShadow: 1,
              marginRight: SM_BREAK ? 0 : 3,
            }}
          >
            <Tooltip title={strings.TOOLTIP_REFRESH_LIST}>
              <Cached />
            </Tooltip>
          </IconButton>
        </Grid>
      }
      headerTitle={strings.ADMIN_LOGS_TITLE}
    />
  )
}
