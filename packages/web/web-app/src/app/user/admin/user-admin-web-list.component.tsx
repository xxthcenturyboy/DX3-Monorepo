import { Button, Grid, useMediaQuery, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-toastify'

import type { GetUsersListQueryType } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { CollapsiblePanel } from '@dx3/web-libs/ui/content/content-collapsible-panel'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { DialogAlert } from '@dx3/web-libs/ui/dialog/alert.dialog'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'

import { WebConfigService } from '../../config/config-web.service'
import { useSendNotificationAppUpdateMutation } from '../../notifications/notification-web.api'
import { NotificationSendDialog } from '../../notifications/notification-web-send.dialog'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectWindowHeight } from '../../ui/store/ui-web.selector'
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
  const usersListHeaders = UserAdminWebListService.getListHeaders()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const ROUTES = WebConfigService.getWebRoutes()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
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
    setDocumentTitle('Admin Users')
    if (!users || users.length === 0) {
      void fetchUsers()
    }
    if (location?.pathname) {
      dispatch(userAdminActions.lastRouteSet(location.pathname))
    }
    if (users?.length) {
      setIsInitialized(true)
    }
  }, [location?.pathname, users])

  useEffect(() => {
    if (isInitialized && !isLoadingUserList) {
      void fetchUsers()
      return
    }

    setIsFetching(false)
  }, [])

  useEffect(() => {
    if (!isLoadingUserList) {
      if (!userListError && userListResponse?.rows) {
        dispatch(userAdminActions.listSet(userListResponse?.rows || []))
        dispatch(userAdminActions.userCountSet(userListResponse?.count))
        setIsFetching(false)
      }
      if (userListError) {
        'error' in userListError && dispatch(uiActions.apiDialogSet(userListError.error))
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
    if (user?.username === 'admin' && currentUser?.id !== user.id) {
      dispatch(
        uiActions.appDialogSet(
          <DialogAlert
            buttonText="Got it."
            closeDialog={() => dispatch(uiActions.appDialogSet(null))}
            message="You cannot edit the admin account."
            windowHeight={windowHeight}
          />,
        ),
      )
      return
    }

    navigate(`${ROUTES.ADMIN.USER.DETAIL}/${data.id}`)
  }

  const handleOffsetChange = (offset: number) => {
    dispatch(userAdminActions.offsetSet(offset))
  }

  const handleLimitChange = (limit: number) => {
    dispatch(userAdminActions.limitSet(limit))
  }

  const handleSortChange = (fieldName: string): void => {
    if (fieldName === orderBy) {
      dispatch(userAdminActions.sortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
      return
    }

    dispatch(userAdminActions.orderBySet(fieldName))
    dispatch(userAdminActions.sortDirSet('ASC'))
  }

  const handleSendAppUpdateClick = async (): Promise<void> => {
    try {
      dispatch(
        uiActions.appDialogSet(
          <ConfirmationDialog
            bodyMessage="Send App Update to All Users?"
            cancelText="Cancel"
            noAwait={true}
            okText="Send"
            onComplete={async (isConfirmed: boolean) => {
              if (isConfirmed) {
                try {
                  const appUpdateResponse = await requestSendAppUpdate().unwrap()
                  if (appUpdateResponse.success) {
                    setTimeout(() => dispatch(uiActions.appDialogSet(null)), 1000)
                    return
                  }
                  setTimeout(() => dispatch(uiActions.appDialogSet(null)), 1000)
                } catch (err) {
                  logger.error(err)
                  toast.error(
                    'Could not send the app update notification. Check logs for more info.',
                  )
                }
              }

              if (!isConfirmed) {
                dispatch(uiActions.appDialogSet(null))
              }
            }}
          />,
        ),
      )
    } catch (err) {
      logger.error(err)
    }
  }

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
        padding="12px 24px 6px"
        spacing={0}
      >
        {/* Actions */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="Actions"
            panelId="panel-user-admin-actions"
          >
            <Grid
              alignItems={'center'}
              container
              direction={SM_BREAK ? 'column' : 'row'}
              justifyContent={SM_BREAK ? 'center' : 'flex-start'}
            >
              <Button
                color={'primary'}
                onClick={() => dispatch(uiActions.appDialogSet(<NotificationSendDialog />))}
                sx={{
                  margin: SM_BREAK ? '0 0 12px' : '0 12px 0',
                  minWidth: '262px',
                }}
                variant="contained"
              >
                Send Notification To All Users
              </Button>

              {(currentUser.a || currentUser.sa) && (
                <Button
                  color="info"
                  onClick={handleSendAppUpdateClick}
                  sx={{
                    margin: SM_BREAK ? '0' : '0',
                    minWidth: '262px',
                  }}
                  variant="contained"
                >
                  Send Web App Update
                </Button>
              )}
            </Grid>
          </CollapsiblePanel>
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
    </ContentWrapper>
  )
}
