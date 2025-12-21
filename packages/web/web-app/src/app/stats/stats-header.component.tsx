import { Cached } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import type * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import type { RootState } from '../store/store-web.redux'
import { useAppSelector } from '../store/store-web.redux'
import type { useLazyGetApiHealthzQuery } from './stats-web.api'

/**
 * Props type for StatsHeaderComponent
 * @property fetchApiStats - RTK Query lazy query trigger function from useLazyGetApiHealthzQuery
 */
type StatsHeaderComponentProps = {
  fetchApiStats: ReturnType<typeof useLazyGetApiHealthzQuery>[0]
}

export const StatsHeaderComponent: React.FC<StatsHeaderComponentProps> = (props) => {
  const TITLE = useAppSelector((state: RootState) => state.ui.strings.ApiHealth) || 'API Health'

  return (
    <ContentHeader
      headerColumnRightJustification={'flex-end'}
      headerColumnsBreaks={{
        left: {
          sm: 6,
        },
        right: {
          sm: 6,
        },
      }}
      headerContent={
        <Tooltip title="Refresh Data">
          <IconButton
            color="primary"
            onClick={(event: React.SyntheticEvent) => {
              event.stopPropagation()
              void props.fetchApiStats()
            }}
            sx={{
              boxShadow: 1,
            }}
          >
            <Cached />
          </IconButton>
        </Tooltip>
      }
      headerTitle={TITLE}
      tooltip={useAppSelector((state) => state.ui.strings.ApiHealthTooltip)}
    />
  )
}
