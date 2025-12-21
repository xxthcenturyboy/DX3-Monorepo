import type * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import type { RootState } from '../store/store-web.redux'
import { useAppSelector } from '../store/store-web.redux'

export const DashboardHeaderComponent: React.FC = () => {
  const TITLE = useAppSelector((state: RootState) => state.ui.strings.Dashboard) || 'Dashboard'

  return (
    <ContentHeader
      headerColumnRightJustification={'flex-end'}
      headerColumnsBreaks={{
        left: {
          sm: 5,
        },
        right: {
          sm: 7,
        },
      }}
      headerContent={<></>}
      headerTitle={TITLE}
      tooltip={useAppSelector((state) => state.ui.strings.Dashboard)}
    />
  )
}
