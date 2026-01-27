import { Box, Chip, useTheme } from '@mui/material'
import * as React from 'react'
import { useNavigate } from 'react-router'

import type { GetSupportRequestsListQueryType } from '@dx3/models-shared'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { supportAdminActions } from '../store/support-admin-web.reducer'
import { selectUserTabSupportRequestRowData } from '../store/support-admin-web.selector'
import { useLazyGetSupportRequestListQuery } from '../support-web.api'
import { SUPPORT_ADMIN_ROUTES } from '../support.consts'
import { UserSupportRequestListService } from './user-support-requests-list.service'

type UserSupportRequestsTabProps = {
  userId: string
}

export const UserSupportRequestsTabComponent: React.FC<UserSupportRequestsTabProps> = ({
  userId,
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const [isFetching, setIsFetching] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Get state from Redux userTab
  const filterOpenOnly = useAppSelector(
    (state) => state.supportAdmin?.userTab?.filterOpenOnly ?? true,
  )
  const limit = useAppSelector((state) => state.supportAdmin?.userTab?.limit ?? 10)
  const offset = useAppSelector((state) => state.supportAdmin?.userTab?.offset ?? 0)
  const orderBy = useAppSelector((state) => state.supportAdmin?.userTab?.orderBy ?? 'createdAt')
  const sortDir = useAppSelector((state) => state.supportAdmin?.userTab?.sortDir ?? 'DESC')
  const supportRequestRowData = useAppSelector((state) => selectUserTabSupportRequestRowData(state))
  const supportRequestsCount = useAppSelector(
    (state) => state.supportAdmin?.userTab?.supportRequestsCount ?? 0,
  )

  const supportListHeaders = UserSupportRequestListService.getListHeaders()

  const strings = useStrings([
    'SUPPORT_CATEGORY_ISSUE',
    'SUPPORT_CATEGORY_NEW_FEATURE',
    'SUPPORT_CATEGORY_OTHER',
    'SUPPORT_CATEGORY_QUESTION',
    'SUPPORT_FILTER_ALL_REQUESTS',
    'SUPPORT_FILTER_OPEN_ONLY',
    'SUPPORT_REQUESTS',
    'SUPPORT_STATUS_CLOSED',
    'SUPPORT_STATUS_IN_PROGRESS',
    'SUPPORT_STATUS_OPEN',
    'SUPPORT_STATUS_RESOLVED',
  ])

  const [
    fetchSupportRequestList,
    {
      data: supportRequestListData,
      error: supportRequestListError,
      isFetching: isLoadingSupportRequestList,
    },
  ] = useLazyGetSupportRequestListQuery()

  const fetchSupportRequests = React.useCallback(async (): Promise<void> => {
    setIsFetching(true)
    const params: GetSupportRequestsListQueryType = {
      limit,
      offset,
      openOnly: filterOpenOnly,
      orderBy,
      sortDir,
      userId,
    }
    await fetchSupportRequestList(params)
  }, [fetchSupportRequestList, filterOpenOnly, limit, offset, orderBy, sortDir, userId])

  // Initial fetch and set userId
  React.useEffect(() => {
    dispatch(supportAdminActions.userTabUserIdSet(userId))
    void fetchSupportRequests()

    // Cleanup on unmount - reset userTab state
    return () => {
      dispatch(supportAdminActions.userTabReset())
    }
  }, [userId])

  // Re-fetch when filter/pagination changes
  React.useEffect(() => {
    if (isInitialized) {
      void fetchSupportRequests()
    }
  }, [filterOpenOnly, limit, offset, orderBy, sortDir])

  // Handle API response
  React.useEffect(() => {
    if (!isLoadingSupportRequestList) {
      if (!supportRequestListError && supportRequestListData?.rows) {
        dispatch(supportAdminActions.userTabListSet(supportRequestListData?.rows || []))
        dispatch(
          supportAdminActions.userTabSupportRequestsCountSet(supportRequestListData?.count || 0),
        )
        setIsFetching(false)
        setIsInitialized(true)
      }
      if (supportRequestListError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(supportRequestListError)))
        setIsFetching(false)
        setIsInitialized(true)
      }
    }
  }, [isLoadingSupportRequestList, supportRequestListError, supportRequestListData])

  const handleRowClick = (row: TableRowType) => {
    navigate(`${SUPPORT_ADMIN_ROUTES.DETAIL}/${row.id}`)
  }

  const handleChangeSort = (fieldName: string) => {
    if (orderBy === fieldName) {
      dispatch(supportAdminActions.userTabSortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      dispatch(supportAdminActions.userTabOrderBySet(fieldName))
      dispatch(supportAdminActions.userTabSortDirSet('DESC'))
    }
  }

  const handleLimitChange = (newLimit: number) => {
    dispatch(supportAdminActions.userTabLimitSet(newLimit))
  }

  const handleOffsetChange = (newOffset: number) => {
    dispatch(supportAdminActions.userTabOffsetSet(newOffset))
  }

  const handleFilterChange = (openOnly: boolean) => {
    dispatch(supportAdminActions.userTabFilterOpenOnlySet(openOnly))
    dispatch(supportAdminActions.userTabOffsetSet(0))
  }

  return (
    <Box padding="24px">
      {/* Filter Chips */}
      <Box
        display="flex"
        gap={1}
        marginBottom="16px"
      >
        <Chip
          color={filterOpenOnly ? 'primary' : 'default'}
          label={strings.SUPPORT_FILTER_OPEN_ONLY}
          onClick={() => handleFilterChange(true)}
          variant={filterOpenOnly ? 'filled' : 'outlined'}
        />
        <Chip
          color={!filterOpenOnly ? 'primary' : 'default'}
          label={strings.SUPPORT_FILTER_ALL_REQUESTS}
          onClick={() => handleFilterChange(false)}
          variant={!filterOpenOnly ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Table */}
      <TableComponent
        changeLimit={handleLimitChange}
        changeOffset={handleOffsetChange}
        changeSort={handleChangeSort}
        clickRow={handleRowClick}
        count={supportRequestsCount || limit}
        header={supportListHeaders}
        isInitialized={isInitialized}
        limit={limit}
        loading={isFetching}
        offset={offset}
        orderBy={orderBy}
        rows={supportRequestRowData}
        sortDir={sortDir}
        tableName="user-support-requests"
        themeMode={theme.palette.mode}
      />
    </Box>
  )
}
