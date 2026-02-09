import {
  Alert,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import { type GetLogsQueryType, LOG_EVENT_TYPE_ARRAY, type LogEventType } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'

import { useI18n } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { useLazyGetAdminLogsQuery, useLazyGetAdminLogsStatusQuery } from './admin-logs-web.api'
import { adminLogsActions } from './admin-logs-web.reducer'
import { selectAdminLogsState, selectLogsListData } from './admin-logs-web.selectors'
import { AdminLogsWebListService } from './admin-logs-web-list.service'
import { AdminLogsListHeaderComponent } from './admin-logs-web-list-header.component'

export const AdminLogsListComponent: React.FC = () => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const { translations: strings } = useI18n()
  const dispatch = useAppDispatch()

  // Redux state
  const {
    eventTypeFilter,
    isAvailable,
    limit,
    logsCount,
    offset,
    orderBy,
    sortDir,
    successFilter,
  } = useAppSelector(selectAdminLogsState)
  const logsRows = useAppSelector(selectLogsListData)

  // Local loading state (not persisted)
  const [isFetching, setIsFetching] = useState(true)

  const [fetchStatus] = useLazyGetAdminLogsStatusQuery()
  const [fetchLogs] = useLazyGetAdminLogsQuery()

  const logsListHeaders = useMemo(() => AdminLogsWebListService.getListHeaders(), [])

  useEffect(() => {
    setDocumentTitle(strings.ADMIN_LOGS_TITLE)
    void checkStatusAndFetch()
  }, [])

  const checkStatusAndFetch = async () => {
    const statusResult = await fetchStatus()
    if (statusResult.data?.isAvailable) {
      dispatch(adminLogsActions.isAvailableSet(true))
      await fetchLogsData()
    } else {
      dispatch(adminLogsActions.isAvailableSet(false))
      setIsFetching(false)
    }
  }

  const fetchLogsData = async (overrides?: Partial<GetLogsQueryType>) => {
    setIsFetching(true)
    const params: GetLogsQueryType = {
      eventType:
        overrides?.eventType !== undefined ? overrides.eventType : eventTypeFilter || undefined,
      limit: overrides?.limit ?? limit,
      offset: overrides?.offset ?? offset,
      orderBy: overrides?.orderBy ?? orderBy,
      sortDir: overrides?.sortDir ?? sortDir,
      success:
        overrides?.success !== undefined
          ? overrides.success
          : successFilter === ''
            ? undefined
            : successFilter,
    }

    const result = await fetchLogs(params)
    if (result.data) {
      dispatch(adminLogsActions.logsCountSet(result.data.count))
      dispatch(adminLogsActions.logsSet(result.data.rows))
    }
    setIsFetching(false)
  }

  const handleChangeSort = (fieldName: string) => {
    const newSortDir = orderBy === fieldName ? (sortDir === 'ASC' ? 'DESC' : 'ASC') : 'DESC'
    const newOrderBy = fieldName
    dispatch(adminLogsActions.orderBySet(newOrderBy))
    dispatch(adminLogsActions.sortDirSet(newSortDir))
    void fetchLogsData({ orderBy: newOrderBy, sortDir: newSortDir })
  }

  const handleLimitChange = (newLimit: number) => {
    dispatch(adminLogsActions.limitSet(newLimit))
    void fetchLogsData({ limit: newLimit })
  }

  const handleOffsetChange = (newOffset: number) => {
    dispatch(adminLogsActions.offsetSet(newOffset))
    void fetchLogsData({ offset: newOffset })
  }

  const handleEventTypeFilterChange = (value: LogEventType | '') => {
    dispatch(adminLogsActions.eventTypeFilterSet(value))
    dispatch(adminLogsActions.offsetSet(0))
    void fetchLogsData({ eventType: value || undefined, offset: 0 })
  }

  const handleSuccessFilterChange = (value: boolean | '') => {
    dispatch(adminLogsActions.successFilterSet(value))
    dispatch(adminLogsActions.offsetSet(0))
    void fetchLogsData({ offset: 0, success: value === '' ? undefined : value })
  }

  if (isAvailable === false) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <AdminLogsListHeaderComponent onRefresh={() => void fetchLogsData()} />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          padding="24px"
        >
          <Alert
            severity="warning"
            sx={{ maxWidth: '600px', width: '100%' }}
          >
            <Typography variant="body1">{strings.ADMIN_LOGS_UNAVAILABLE}</Typography>
          </Alert>
        </Grid>
      </ContentWrapper>
    )
  }

  if (isAvailable === null) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <AdminLogsListHeaderComponent onRefresh={() => void fetchLogsData()} />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          padding="48px"
        >
          <CircularProgress />
        </Grid>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper
      contentHeight="calc(100vh - 80px)"
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <AdminLogsListHeaderComponent onRefresh={() => void fetchLogsData()} />

      {/* Filters Panel */}
      <Grid
        alignItems="center"
        container
        direction="row"
        justifyContent="center"
        padding="18px 24px 6px"
        spacing={0}
      >
        <Grid
          mb="24px"
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
              alignItems="center"
              container
              direction={SM_BREAK ? 'column' : 'row'}
              gap={2}
              justifyContent={SM_BREAK ? 'center' : 'flex-start'}
            >
              {/* Event Type Filter */}
              <FormControl
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel>{strings.ADMIN_LOGS_EVENT_TYPE}</InputLabel>
                <Select
                  label={strings.ADMIN_LOGS_EVENT_TYPE}
                  onChange={(e) => handleEventTypeFilterChange(e.target.value as LogEventType | '')}
                  value={eventTypeFilter}
                >
                  <MenuItem value="">{strings.ADMIN_LOGS_ALL_EVENTS}</MenuItem>
                  {LOG_EVENT_TYPE_ARRAY.map((eventType) => (
                    <MenuItem
                      key={eventType}
                      value={eventType}
                    >
                      {eventType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Success Filter */}
              <FormControl
                size="small"
                sx={{ minWidth: 150 }}
              >
                <InputLabel>{strings.STATUS}</InputLabel>
                <Select
                  label={strings.STATUS}
                  onChange={(e) => {
                    const val = e.target.value
                    handleSuccessFilterChange(val === '' ? '' : val === 'true')
                  }}
                  value={successFilter === '' ? '' : String(successFilter)}
                >
                  <MenuItem value="">{strings.ADMIN_LOGS_ALL_STATUS}</MenuItem>
                  <MenuItem value="true">{strings.ADMIN_LOGS_SUCCESS}</MenuItem>
                  <MenuItem value="false">{strings.ADMIN_LOGS_ERROR}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

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
          count={logsCount}
          header={logsListHeaders}
          isInitialized={true}
          limit={limit}
          loading={isFetching}
          offset={offset}
          orderBy={orderBy}
          rows={logsRows}
          sortDir={sortDir}
          tableName="admin-logs"
          themeMode={theme.palette.mode}
        />
      </Grid>
    </ContentWrapper>
  )
}
