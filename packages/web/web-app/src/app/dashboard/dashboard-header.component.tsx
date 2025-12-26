import type * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { useString } from '../i18n'

export const DashboardHeaderComponent: React.FC = () => {
  const title = useString('PAGE_TITLE_DASHBOARD')

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
      headerTitle={title}
    />
  )
}
