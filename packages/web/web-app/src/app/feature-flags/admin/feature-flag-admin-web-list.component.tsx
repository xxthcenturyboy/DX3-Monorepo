import AddIcon from '@mui/icons-material/Add'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
import Fab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import type React from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router'

import type { FeatureFlagType, GetFeatureFlagsListQueryType } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'
import { MODAL_ROOT_ELEM_ID, TIMEOUT_DUR_500 } from '@dx3/web-libs/ui/ui.consts'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useString } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectIsMobileWidth } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useLazyGetAdminFeatureFlagsQuery } from './feature-flag-admin-web.api'
import { featureFlagAdminActions } from './feature-flag-admin-web.reducer'
import {
  selectAdminFlagsFormatted,
  selectAdminFlagsListData,
} from './feature-flag-admin-web.selectors'
import { FeatureFlagAdminCreateDialog } from './feature-flag-admin-web-create.dialog'
import { FeatureFlagAdminEditDialog } from './feature-flag-admin-web-edit.dialog'
import { FeatureFlagAdminWebListService } from './feature-flag-admin-web-list.service'
import { FeatureFlagAdminListHeaderComponent } from './feature-flag-admin-web-list-header.component'

export const FeatureFlagAdminList: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const pageTitle = useString('FEATURE_FLAGS')

  // Selectors
  const filterValue = useAppSelector((state) => state.featureFlagsAdmin.filterValue)
  const limit = useAppSelector((state) => state.featureFlagsAdmin.limit || 10)
  const offset = useAppSelector((state) => state.featureFlagsAdmin.offset)
  const orderBy = useAppSelector((state) => state.featureFlagsAdmin.orderBy)
  const sortDir = useAppSelector((state) => state.featureFlagsAdmin.sortDir)
  const flags = useAppSelector(selectAdminFlagsFormatted)
  const flagRowData = useAppSelector(selectAdminFlagsListData)
  const flagsCount = useAppSelector((state) => state.featureFlagsAdmin.flagsCount)
  const isMobileWidth = useAppSelector(selectIsMobileWidth)

  // Local state
  const [isInitialized, setIsInitialized] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editFlag, setEditFlag] = useState<FeatureFlagType | null>(null)

  // Headers
  const flagsListHeaders = FeatureFlagAdminWebListService.getListHeaders()

  // API
  const [
    fetchFlagsList,
    { data: flagsListResponse, error: flagsListError, isFetching: isLoadingFlagsList },
  ] = useLazyGetAdminFeatureFlagsQuery()

  useEffect(() => {
    setDocumentTitle(pageTitle)
    if (!isLoadingFlagsList) {
      void fetchFlags()
    }

    if (location?.pathname) {
      dispatch(featureFlagAdminActions.lastRouteSet(location.pathname))
    }

    setIsFetching(false)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isLoadingFlagsList) {
      if (!flagsListError && flagsListResponse?.flags) {
        dispatch(featureFlagAdminActions.flagsListSet(flagsListResponse.flags))
        dispatch(featureFlagAdminActions.flagsCountSet(flagsListResponse.count))
        setIsFetching(false)
      }
      if (flagsListError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(flagsListError)))
        setIsFetching(false)
      }
    }
  }, [isLoadingFlagsList, flagsListError, flagsListResponse])

  const fetchFlags = async (searchValue?: string): Promise<void> => {
    setIsFetching(true)
    const params: GetFeatureFlagsListQueryType = {
      filterValue: searchValue !== undefined ? searchValue : filterValue,
      limit,
      offset,
      orderBy,
      sortDir,
    }
    await fetchFlagsList(params)
  }

  const clickRow = (data: TableRowType): void => {
    const flag = flags.find((f) => f.id === data.id)
    if (flag) {
      setEditFlag(flag)
    }
  }

  const handleOffsetChange = (newOffset: number) => {
    dispatch(featureFlagAdminActions.offsetSet(newOffset))
    void fetchFlags()
  }

  const handleLimitChange = (newLimit: number) => {
    dispatch(featureFlagAdminActions.limitSet(newLimit))
    dispatch(featureFlagAdminActions.offsetSet(0))
    void fetchFlags()
  }

  const handleSortChange = (fieldName: string): void => {
    if (fieldName === orderBy) {
      dispatch(featureFlagAdminActions.sortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
      void fetchFlags()
      return
    }

    dispatch(featureFlagAdminActions.orderBySet(fieldName))
    dispatch(featureFlagAdminActions.sortDirSet('ASC'))
    void fetchFlags()
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    void fetchFlags()
  }

  const handleEditSuccess = () => {
    setEditFlag(null)
    void fetchFlags()
  }

  const createDialog = createPortal(
    <CustomDialog
      body={
        <FeatureFlagAdminCreateDialog
          closeDialog={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      }
      closeDialog={() => setCreateDialogOpen(false)}
      isMobileWidth={isMobileWidth}
      open={createDialogOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const editDialog = createPortal(
    <CustomDialog
      body={
        <FeatureFlagAdminEditDialog
          closeDialog={() => setEditFlag(null)}
          flag={editFlag}
          onSuccess={handleEditSuccess}
        />
      }
      closeDialog={() => setEditFlag(null)}
      isMobileWidth={isMobileWidth}
      open={!!editFlag}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  return (
    <ContentWrapper
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <FeatureFlagAdminListHeaderComponent
        fetchFlags={fetchFlags}
        onCreateClick={() => setCreateDialogOpen(true)}
      />

      {/* Table */}
      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="flex-start"
        padding="18px 24px 6px"
        spacing={0}
      >
        <TableComponent
          changeLimit={handleLimitChange}
          changeOffset={handleOffsetChange}
          changeSort={handleSortChange}
          clickRow={clickRow}
          count={flagsCount || limit}
          header={flagsListHeaders}
          isInitialized={isInitialized}
          limit={limit}
          loading={isFetching}
          offset={offset}
          orderBy={orderBy}
          rows={flagRowData}
          sortDir={sortDir}
          tableName="FeatureFlags"
        />
      </Grid>

      {createDialog}
      {editDialog}
      <Zoom
        in={MD_BREAK}
        style={{
          transitionDelay: `${MD_BREAK ? TIMEOUT_DUR_500 : 0}ms`,
        }}
        timeout={TIMEOUT_DUR_500}
        unmountOnExit
      >
        <Fab
          aria-label="add feature flag"
          color="secondary"
          onClick={() => setCreateDialogOpen(true)}
          size="large"
          style={{
            bottom: 24,
            position: 'fixed',
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </ContentWrapper>
  )
}
