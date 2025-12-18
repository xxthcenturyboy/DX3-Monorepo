import Cached from '@mui/icons-material/Cached'
import {
  Button,
  FilledInput,
  FormControl,
  Grid2,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import type { GetUsersListQueryType } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { CollapsiblePanel } from '@dx3/web-libs/ui/content/content-collapsible-panel'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { DialogAlert } from '@dx3/web-libs/ui/dialog/alert.dialog'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { useFocus } from '@dx3/web-libs/ui/system/hooks/use-focus.hook'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'
import { debounce } from '@dx3/web-libs/utils/debounce'

import { WebConfigService } from '../../config/config-web.service'
import { useSendNotificationAppUpdateMutation } from '../../notifications/notification-web.api'
import { NotificationSendDialog } from '../../notifications/notification-web-send.dialog'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectWindowHeight } from '../../ui/store/ui-web.selector'
import { DEBOUNCE } from '../../ui/ui-web.consts'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useLazyGetUserAdminListQuery } from './user-admin-web.api'
import { userAdminActions } from './user-admin-web.reducer'
import { selectUsersFormatted, selectUsersListData } from './user-admin-web.selectors'
import { UserAdminWebListService } from './user-admin-web-list.service'

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
  const [searchInputRef, _setSearchInputRef] = useFocus()
  const ROUTES = WebConfigService.getWebRoutes()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
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

  const debounceFetch = useRef(
    debounce((value: string) => {
      void fetchUsers(value)
    }, DEBOUNCE),
  ).current

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

  const refreshTableData = async (): Promise<void> => {
    await fetchUsers()
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

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value !== filterValue) {
      debounceFetch(value)
    }
    dispatch(userAdminActions.filterValueSet(value))
    // setSearchInputRef(); // may not be necessary
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
      contentMarginTop={SM_BREAK ? '124px' : '74px'}
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
        <Grid2
          alignItems="center"
          container
          direction={SM_BREAK ? 'column-reverse' : 'row'}
          justifyContent={SM_BREAK ? 'center' : 'flex-end'}
          style={{
            marginRight: MD_BREAK ? '0px' : '24px',
          }}
        >
          {/* Filter */}
          <Grid2
            alignItems={'center'}
            display={'flex'}
            justifyContent={'center'}
            sx={{
              minWidth: SM_BREAK ? '' : '360px',
              width: SM_BREAK ? '100%' : '360px',
            }}
          >
            <FormControl
              margin="none"
              style={{
                marginRight: SM_BREAK ? '24px' : '24px',
                marginTop: 0,
                width: SM_BREAK ? '300px' : '100%',
              }}
            >
              <FilledInput
                autoCorrect="off"
                fullWidth
                hiddenLabel
                id="input-filter"
                name="input-filter"
                onChange={handleFilterValueChange}
                placeholder={'Filter'}
                ref={searchInputRef}
                size="small"
                type="search"
                value={filterValue}
              />
            </FormControl>
            <span>
              <IconButton
                color="primary"
                onClick={(event: React.SyntheticEvent) => {
                  event.stopPropagation()
                  void refreshTableData()
                }}
                sx={{
                  boxShadow: 1,
                }}
              >
                <Tooltip title="Refresh List">
                  <Cached />
                </Tooltip>
              </IconButton>
            </span>
          </Grid2>
          {/* New User */}
          {/* <Grid2
            style={{
              width: SM_BREAK ? '100%' : '',
              marginBottom: SM_BREAK ? '20px' : ''
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`${ROUTES.ADMIN.USER.DETAIL}`)}
              disabled={userGetXhr}
              fullWidth={SM_BREAK}
            >
              Create User
            </Button>
          </Grid2> */}
        </Grid2>
      }
      headerTitle={'User List'}
    >
      <Grid2
        alignItems={'center'}
        container
        direction={'row'}
        justifyContent={'center'}
        spacing={0}
      >
        {/* Actions */}
        <Grid2
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="Actions"
            panelId="panel-user-admin-actions"
          >
            <Grid2
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
            </Grid2>
          </CollapsiblePanel>
        </Grid2>
      </Grid2>

      {/** TABLE */}
      <Grid2
        alignItems="center"
        container
        direction="column"
        justifyContent="flex-start"
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
      </Grid2>
    </ContentWrapper>
  )
}
