import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'
import { useNavigate } from 'react-router'

import {
  type GetSupportRequestsListQueryType,
  SUPPORT_CATEGORY_ARRAY,
  SUPPORT_STATUS,
  SUPPORT_STATUS_ARRAY,
  type SupportCategoryType,
  type SupportStatusType,
} from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableHeaderItem, TableRowType } from '@dx3/web-libs/ui/table/types'
import { DRAWER_WIDTH, MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useI18n } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { supportAdminActions } from '../store/support-admin-web.reducer'
import {
  selectAllRowsSelected,
  selectHasUnviewedSelected,
  selectSupportRequestWithUserRowData,
} from '../store/support-admin-web.selector'
import { supportActions } from '../store/support-web.reducer'
import { CATEGORY_LABEL_KEYS, STATUS_LABEL_KEYS, SUPPORT_ADMIN_ROUTES } from '../support.consts'
import {
  useBulkUpdateSupportStatusMutation,
  useLazyGetSupportRequestListQuery,
  useLazyGetSupportUnviewedCountQuery,
  useMarkAllSupportAsViewedMutation,
} from '../support-web.api'
import { SupportAdminWebListService } from './support-admin-list.service'
import { SupportAdminListHeaderComponent } from './support-admin-list-header.component'

export const SupportAdminListComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const windowWidth = useAppSelector((state) => state.ui?.windowWidth || 0)
  const menuOpen = useAppSelector((state) => state.ui?.menuOpen || false)
  const isMobileBar = windowWidth < MEDIA_BREAK.MOBILE
  const isDesktopWithMenu = windowWidth >= MEDIA_BREAK.MENU && menuOpen
  const [isFetching, setIsFetching] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(true)
  // Get state from Redux with fallback defaults for first load
  const categoryFilter = useAppSelector((state) => state.supportAdmin?.categoryFilter)
  const filterValue = useAppSelector((state) => state.supportAdmin?.filterValue ?? '')
  const limit = useAppSelector((state) => state.supportAdmin?.limit ?? 25)
  const offset = useAppSelector((state) => state.supportAdmin?.offset ?? 0)
  const orderBy = useAppSelector((state) => state.supportAdmin?.orderBy ?? 'createdAt')
  const sortDir = useAppSelector((state) => state.supportAdmin?.sortDir ?? 'DESC')
  const statusFilter = useAppSelector((state) => state.supportAdmin?.statusFilter)
  const selectedIds = useAppSelector((state) => state.supportAdmin?.selectedIds || [])
  const allSelected = useAppSelector((state) => selectAllRowsSelected(state))
  const hasUnviewedSelected = useAppSelector((state) => selectHasUnviewedSelected(state))
  const supportListHeaders = SupportAdminWebListService.getListHeaders()
  const supportRequestRowData = useAppSelector((state) =>
    selectSupportRequestWithUserRowData(state),
  )
  const supportRequestsCount = useAppSelector(
    (state) => state.supportAdmin?.supportRequestsWithUserCount,
  )
  const { t, translations: strings } = useI18n()
  const [
    fetchSupportRequestList,
    {
      data: supportRequestListData,
      error: supportRequestListError,
      isFetching: isLoadingSupportRequestList,
      isSuccess: _fetchSupportRequestListSuccess,
      isUninitialized: _fetchSupportRequestListUninitialized,
    },
  ] = useLazyGetSupportRequestListQuery()

  React.useEffect(() => {
    setDocumentTitle(strings.SUPPORT_REQUESTS)
    if (!isLoadingSupportRequestList) {
      void fetchSupportRequests()
      return
    }

    setIsFetching(false)
    setIsInitialized(true)

    return () => {
      dispatch(supportAdminActions.setSelectedIds([]))
      // dispatch(supportAdminActions.categoryFilterSet(''))
      // dispatch(supportAdminActions.statusFilterSet(''))
    }
  }, [])

  React.useEffect(() => {
    if (!isLoadingSupportRequestList) {
      if (!supportRequestListError && supportRequestListData?.rows) {
        dispatch(supportAdminActions.listWithUserSet(supportRequestListData?.rows || []))
        dispatch(supportAdminActions.supportRequestsWithUserCountSet(supportRequestListData?.count))
        setIsFetching(false)
      }
      if (supportRequestListError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(supportRequestListError)))
        setIsFetching(false)
      }
    }
  }, [
    isLoadingSupportRequestList,
    supportRequestListError,
    supportRequestListData?.count,
    supportRequestListData?.rows,
  ])

  const [markAllViewed] = useMarkAllSupportAsViewedMutation()
  const [bulkUpdateStatus] = useBulkUpdateSupportStatusMutation()
  const [fetchUnviewedCount] = useLazyGetSupportUnviewedCountQuery()

  const fetchSupportRequests = async (overrides?: {
    category?: SupportCategoryType | ''
    filterValue?: string
    limit?: number
    offset?: number
    orderBy?: string
    sortDir?: 'ASC' | 'DESC'
    status?: SupportStatusType | ''
  }): Promise<void> => {
    setIsFetching(true)
    // Use 'in' operator to check if key exists (allows empty string override)
    const currentCategory =
      overrides && 'category' in overrides ? overrides.category : categoryFilter
    const currentStatus = overrides && 'status' in overrides ? overrides.status : statusFilter
    const params: GetSupportRequestsListQueryType = {
      category: currentCategory !== '' ? currentCategory : undefined,
      filterValue: overrides?.filterValue !== undefined ? overrides.filterValue : filterValue,
      limit: overrides?.limit ?? limit,
      offset: overrides?.offset ?? offset,
      orderBy: overrides?.orderBy ?? orderBy,
      sortDir: overrides?.sortDir ?? sortDir,
      status: currentStatus !== '' ? currentStatus : undefined,
    }
    await fetchSupportRequestList(params)
  }

  const handleRowClick = (row: TableRowType) => {
    navigate(`${SUPPORT_ADMIN_ROUTES.DETAIL}/${row.id}`)
  }

  const handleChangeSort = (fieldName: string) => {
    const newSortDir = orderBy === fieldName ? (sortDir === 'ASC' ? 'DESC' : 'ASC') : 'DESC'
    const newOrderBy = fieldName

    if (orderBy === fieldName) {
      dispatch(supportAdminActions.sortDirSet(newSortDir))
    } else {
      dispatch(supportAdminActions.orderBySet(newOrderBy))
      dispatch(supportAdminActions.sortDirSet('DESC'))
    }

    void fetchSupportRequests({ orderBy: newOrderBy, sortDir: newSortDir })
  }

  const handleLimitChange = (newLimit: number) => {
    dispatch(supportAdminActions.limitSet(newLimit))
    void fetchSupportRequests({ limit: newLimit })
  }

  const handleOffsetChange = (newOffset: number) => {
    dispatch(supportAdminActions.offsetSet(newOffset))
    void fetchSupportRequests({ offset: newOffset })
  }

  const handleStatusFilterChange = (value: SupportStatusType | '') => {
    dispatch(supportAdminActions.statusFilterSet(value))
    dispatch(supportAdminActions.offsetSet(0))
    // Pass empty string explicitly so it's not treated as undefined
    void fetchSupportRequests({ offset: 0, status: value === '' ? '' : value })
  }

  const handleCategoryFilterChange = (value: SupportCategoryType | '') => {
    dispatch(supportAdminActions.categoryFilterSet(value))
    dispatch(supportAdminActions.offsetSet(0))
    // Pass empty string explicitly so it's not treated as undefined
    void fetchSupportRequests({ category: value === '' ? '' : value, offset: 0 })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && supportRequestRowData.length > 0) {
      dispatch(supportAdminActions.setSelectedIds(supportRequestRowData.map((r) => r.id)))
    } else {
      dispatch(supportAdminActions.setSelectedIds([]))
    }
  }

  const handleBulkMarkViewed = async () => {
    if (selectedIds.length === 0) return
    await markAllViewed()
    dispatch(supportAdminActions.setSelectedIds([]))
    void fetchSupportRequests()
    // Refetch the unviewed count and update the badge
    const result = await fetchUnviewedCount()
    if (result.data?.count !== undefined) {
      dispatch(supportActions.setUnviewedCount(result.data.count))
    }
  }

  const handleBulkClose = async () => {
    if (selectedIds.length === 0) return
    await bulkUpdateStatus({ ids: selectedIds, status: SUPPORT_STATUS.CLOSED })
    dispatch(supportAdminActions.setSelectedIds([]))
    void fetchSupportRequests()
  }

  const getCategoryLabel = (category: SupportCategoryType): string => {
    return strings[CATEGORY_LABEL_KEYS[category] as keyof typeof strings] || category
  }

  const getStatusLabel = (status: SupportStatusType): string => {
    return strings[STATUS_LABEL_KEYS[status] as keyof typeof strings] || status
  }

  // Update header with select all checkbox
  const headerWithCheckbox: TableHeaderItem[] = [
    {
      ...supportListHeaders[0],
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={selectedIds.length > 0 && !allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ) as unknown as string,
    },
    ...supportListHeaders.slice(1),
  ]

  return (
    <ContentWrapper
      contentHeight="calc(100vh - 80px)"
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <SupportAdminListHeaderComponent fetchRequests={fetchSupportRequests} />

      {/* Filters Panel */}
      <Grid
        alignItems={'center'}
        container
        direction={'row'}
        justifyContent={'center'}
        padding="18px 24px 6px"
        spacing={0}
      >
        <Grid
          mb={'24px'}
          size={12}
        >
          <Paper
            elevation={2}
            square={false}
            sx={(theme) => ({
              alignItems: 'center',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.background.paper
                  : theme.palette.grey[100],
              padding: theme.spacing(3, 2, 3, 2),
            })}
            variant="outlined"
          >
            <Grid
              alignItems={'center'}
              container
              direction={SM_BREAK ? 'column' : 'row'}
              gap={2}
              justifyContent={SM_BREAK ? 'center' : 'flex-start'}
            >
              {/* Status Filter */}
              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
              >
                <InputLabel>{strings.STATUS}</InputLabel>
                <Select
                  label={strings.STATUS}
                  onChange={(e) =>
                    handleStatusFilterChange(e.target.value as SupportStatusType | '')
                  }
                  value={statusFilter}
                >
                  <MenuItem value="">{strings.SUPPORT_FILTER_ALL_REQUESTS}</MenuItem>
                  {SUPPORT_STATUS_ARRAY.map((status) => (
                    <MenuItem
                      key={status}
                      value={status}
                    >
                      {getStatusLabel(status as SupportStatusType)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Category Filter */}
              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
              >
                <InputLabel>{strings.SUPPORT_CATEGORY}</InputLabel>
                <Select
                  label={strings.SUPPORT_CATEGORY}
                  onChange={(e) =>
                    handleCategoryFilterChange(e.target.value as SupportCategoryType | '')
                  }
                  value={categoryFilter}
                >
                  <MenuItem value="">{strings.SUPPORT_FILTER_ALL_CATEGORIES}</MenuItem>
                  {SUPPORT_CATEGORY_ARRAY.map((cat) => (
                    <MenuItem
                      key={cat}
                      value={cat}
                    >
                      {getCategoryLabel(cat as SupportCategoryType)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <Fade
          in={true}
          timeout={200}
        >
          <Paper
            elevation={3}
            sx={{
              alignItems: 'center',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '8px',
              bottom: '24px',
              color: 'white',
              display: 'flex',
              gap: 2,
              justifyContent: isMobileBar ? 'center' : undefined,
              left: isMobileBar
                ? '16px'
                : isDesktopWithMenu
                  ? `calc(50% + ${DRAWER_WIDTH / 2}px)`
                  : '50%',
              padding: '12px 24px',
              position: 'fixed',
              right: isMobileBar ? '16px' : undefined,
              transform: isMobileBar ? 'none' : 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <Typography variant="body2">
              {t('ITEMS_SELECTED', { count: selectedIds.length })}
            </Typography>
            {hasUnviewedSelected && (
              <Button
                color="inherit"
                onClick={handleBulkMarkViewed}
                size="small"
                variant="outlined"
              >
                {strings.SUPPORT_BULK_MARK_VIEWED}
              </Button>
            )}
            <Button
              color="inherit"
              onClick={handleBulkClose}
              size="small"
              variant="outlined"
            >
              {strings.SUPPORT_BULK_CLOSE}
            </Button>
          </Paper>
        </Fade>
      )}

      {/* Table */}
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="flex-start"
        padding="6px 24px 12px"
        spacing={0}
      >
        <TableComponent
          changeLimit={handleLimitChange}
          changeOffset={handleOffsetChange}
          changeSort={handleChangeSort}
          clickRow={handleRowClick}
          count={supportRequestsCount || limit}
          header={headerWithCheckbox}
          isInitialized={isInitialized}
          limit={limit}
          loading={isFetching}
          offset={offset}
          orderBy={orderBy}
          rows={supportRequestRowData}
          sortDir={sortDir}
          tableName="support-requests"
          themeMode={theme.palette.mode}
        />
      </Grid>
    </ContentWrapper>
  )
}
