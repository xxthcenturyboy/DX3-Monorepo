import { Button, Grid, Paper, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import { type GetUsersListQueryType, USER_ROLE } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { DialogAlert } from '@dx3/web-libs/ui/dialog/alert.dialog'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { WebConfigService } from '../../config/config-web.service'
import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useString, useStrings } from '../../i18n'
import { useSendNotificationAppUpdateMutation } from '../../notifications/notification-web.api'
import { NotificationSendDialog } from '../../notifications/notification-web-send.dialog'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useLazyGetUserAdminListQuery } from './user-admin-web.api'
import { userAdminActions } from './user-admin-web.reducer'
import { selectUsersFormatted, selectUsersListData } from './user-admin-web.selectors'
import { UserAdminWebListService } from './user-admin-web-list.service'
import { UserAdminListHeaderComponent } from './user-admin-web-list-header.component'

export const UserAdminList: React.FC = () => {
  const filterValue = useAppSelector((state) => state.userAdmin.filterValue)
  const limit = useAppSelector((state) => state.userAdmin.limit || 10)
  const offset = useAppSelector((state) => state.userAdmin.offset)
  const orderBy = useAppSelector((state) => state.userAdmin.orderBy)
  const sortDir = useAppSelector((state) => state.userAdmin.sortDir)
  const users = useAppSelector((state) => selectUsersFormatted(state))
  const userRowData = useAppSelector((state) => selectUsersListData(state))
  const usersCount = useAppSelector((state) => state.userAdmin.usersCount)
  const currentUser = useAppSelector((state) => state.userProfile)
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const pageTitle = useString('PAGE_TITLE_ADMIN_USERS')
  const usersListHeaders = UserAdminWebListService.getListHeaders()
  const [isInitialized, setIsInitialized] = useState(true)
  const [isFetching, setIsFetching] = useState(true)
  const ROUTES = WebConfigService.getWebRoutes()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const strings = useStrings([
    'CANCEL',
    'CANCELING',
    'OK',
    'SEND',
    'SEND_APP_UPDATE',
    'SEND_APP_UPDATE_TO_ALL_USERS',
    'SEND_NOTIFICATION_TO_ALL_USERS',
    'THIS_ACCOUNT_CANNOT_BE_EDITED',
  ])
  const [
    fetchUserList,
    {
      data: userListResponse,
      error: userListError,
      isFetching: isLoadingUserList,
      isSuccess: _fetchUserListSuccess,
      isUninitialized: _fetchUserListUninitialized,
    },
  ] = useLazyGetUserAdminListQuery()
  const [
    requestSendAppUpdate,
    {
      data: _sendAppUpdateResponse,
      error: _sendAppUpdateError,
      isLoading: _isLoadingSendAppUpdate,
      isSuccess: _sendAppUpdateSuccess,
      isUninitialized: _sendAppUpdateUninitialized,
    },
  ] = useSendNotificationAppUpdateMutation()

  useEffect(() => {
    setDocumentTitle(pageTitle)
    if (!isLoadingUserList) {
      void fetchUsers()
      return
    }

    if (location?.pathname) {
      dispatch(userAdminActions.lastRouteSet(location.pathname))
    }

    setIsFetching(false)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isLoadingUserList) {
      if (!userListError && userListResponse?.rows) {
        dispatch(userAdminActions.listSet(userListResponse?.rows || []))
        dispatch(userAdminActions.userCountSet(userListResponse?.count))
        setIsFetching(false)
      }
      if (userListError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(userListError)))
        setIsFetching(false)
      }
    }
  }, [isLoadingUserList, userListError, userListResponse?.count, userListResponse?.rows])

  const fetchUsers = async (searchValue?: string): Promise<void> => {
    setIsFetching(true)
    const params: GetUsersListQueryType = {
      filterValue: searchValue !== undefined ? searchValue : filterValue,
      limit,
      offset,
      orderBy,
      sortDir,
    }
    await fetchUserList(params)
  }

  const clickRow = (data: TableRowType): void => {
    const user = users.find((user) => user.id === data.id)
    if (user?.roles?.includes(USER_ROLE.SUPER_ADMIN) && currentUser?.id !== user.id) {
      setAlertModalOpen(true)
      return
    }

    navigate(`${ROUTES.ADMIN.USER.DETAIL}/${data.id}`)
  }

  const handleOffsetChange = (offset: number) => {
    dispatch(userAdminActions.offsetSet(offset))
    void fetchUsers()
  }

  const handleLimitChange = (limit: number) => {
    dispatch(userAdminActions.limitSet(limit))
    void fetchUsers()
  }

  const handleSortChange = (fieldName: string): void => {
    if (fieldName === orderBy) {
      dispatch(userAdminActions.sortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
      void fetchUsers()
      return
    }

    dispatch(userAdminActions.orderBySet(fieldName))
    dispatch(userAdminActions.sortDirSet('ASC'))
    void fetchUsers()
  }

  const alertUserEditModal = createPortal(
    <CustomDialog
      body={
        <DialogAlert
          buttonText={strings.OK}
          closeDialog={() => setAlertModalOpen(false)}
          message={strings.THIS_ACCOUNT_CANNOT_BE_EDITED}
          windowHeight={windowHeight}
        />
      }
      closeDialog={() => setAlertModalOpen(false)}
      isMobileWidth={isMobileWidth}
      open={alertModalOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const confirmAppUpdateModal = createPortal(
    <CustomDialog
      body={
        <ConfirmationDialog
          bodyMessage={strings.SEND_APP_UPDATE_TO_ALL_USERS}
          cancellingText={strings.CANCELING}
          cancelText={strings.CANCEL}
          okText={strings.SEND}
          onComplete={async (isConfirmed: boolean) => {
            if (isConfirmed) {
              try {
                await requestSendAppUpdate().unwrap()
                setConfirmOpen(false)
              } catch (err) {
                logger.error(err)
                toast.error('Could not send the app update notification. Check logs for more info.')
              }
            }

            if (!isConfirmed) {
              setConfirmOpen(false)
            }
          }}
        />
      }
      closeDialog={() => setConfirmOpen(false)}
      isMobileWidth={isMobileWidth}
      open={confirmOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const notificationModal = createPortal(
    <CustomDialog
      body={<NotificationSendDialog closeDialog={() => setNotificationOpen(false)} />}
      closeDialog={() => setNotificationOpen(false)}
      isMobileWidth={isMobileWidth}
      open={notificationOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  return (
    <ContentWrapper
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <UserAdminListHeaderComponent fetchUsers={fetchUsers} />
      <Grid
        alignItems={'center'}
        container
        direction={'row'}
        justifyContent={'center'}
        padding="18px 24px 6px"
        spacing={0}
      >
        {/* Actions */}
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
              // boxShadow: theme.shadows[1],
              padding: theme.spacing(3, 2, 3, 2),
            })}
            variant="outlined"
          >
            <Grid
              alignItems={'center'}
              container
              direction={SM_BREAK ? 'column' : 'row'}
              justifyContent={SM_BREAK ? 'center' : 'flex-start'}
            >
              <Button
                color={'primary'}
                onClick={() => setNotificationOpen(true)}
                sx={{
                  margin: SM_BREAK ? '0 0 12px' : '0 12px 0',
                  minWidth: '262px',
                }}
                variant="contained"
              >
                {strings.SEND_NOTIFICATION_TO_ALL_USERS}
              </Button>

              {(currentUser.a || currentUser.sa) && (
                <Button
                  color="info"
                  onClick={() => setConfirmOpen(true)}
                  sx={{
                    margin: SM_BREAK ? '0' : '0',
                    minWidth: '262px',
                  }}
                  variant="contained"
                >
                  {strings.SEND_APP_UPDATE}
                </Button>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/** TABLE */}
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
          changeSort={handleSortChange}
          clickRow={clickRow}
          count={usersCount || limit}
          header={usersListHeaders}
          isInitialized={isInitialized}
          limit={limit}
          loading={isFetching}
          // maxHeight="272px"
          offset={offset}
          orderBy={orderBy}
          rows={userRowData}
          sortDir={sortDir}
          tableName="Users"
        />
      </Grid>
      {alertUserEditModal}
      {confirmAppUpdateModal}
      {notificationModal}
    </ContentWrapper>
  )
}
