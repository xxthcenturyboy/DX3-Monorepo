import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useParams } from 'react-router'
import { toast } from 'react-toastify'

import { ACCOUNT_RESTRICTIONS, type UserRoleUi } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { DialogAlert } from '@dx3/web-libs/ui/dialog/alert.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { listSkeleton } from '@dx3/web-libs/ui/global/skeletons.ui'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { useApiError } from '../../data/errors'
import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import type { CustomResponseErrorType } from '../../data/rtk-query'
import { useI18n, useStrings } from '../../i18n'
import { NotificationSendDialog } from '../../notifications/notification-web-send.dialog'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { UserSupportRequestsTabComponent } from '../../support/admin/user-support-requests-tab.component'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useLazyGetPrivilegeSetsQuery } from '../../user-privilege/user-privilege-web.api'
import { privilegeSetActions } from '../../user-privilege/user-privilege-web.reducer'
import { prepareRoleCheckboxes } from '../../user-privilege/user-privilege-web-checboxes.util'
import {
  useLazyGetUserAdminQuery,
  useUpdateUserRolesRestrictionsMutation,
} from './user-admin-web.api'
import { userAdminActions } from './user-admin-web.reducer'
import { selectUserFormatted } from './user-admin-web.selectors'
import { UserAdminEditHeaderComponent } from './user-admin-web-edit-header.component'

type UserRestriction = {
  restriction: keyof typeof ACCOUNT_RESTRICTIONS
  isRestricted: boolean
}

export const UserAdminEdit: React.FC = () => {
  const user = useAppSelector((state) => selectUserFormatted(state))
  const sets = useAppSelector((state) => state.privileges.sets)
  const currentUser = useAppSelector((state) => state.userProfile)
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const [title, setTitle] = useState('User')
  const [alertRoleOpen, setAlertRoleOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [restrictions, setRestrictions] = useState<UserRestriction[]>([])
  const [roles, setRoles] = useState<UserRoleUi[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const dispatch = useAppDispatch()
  const { id } = useParams<{ id: string }>()
  const { getErrorMessage } = useApiError()
  const location = useLocation()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const { t } = useI18n()
  const strings = useStrings([
    'DEFAULT',
    'EMAILS',
    'NAME',
    'NO_DATA',
    'OK',
    'PHONES',
    'RESTRICTIONS',
    'ROLES',
    'SEND_NOTIFICATION',
    'SUPPORT_REQUESTS',
    'USER_TITLE',
    'USER_UPDATED',
    'USERNAME',
    'VERIFIED',
    'YOU_CANNOT_EDIT_ROLES',
  ])
  const [
    fetchPrivilegeSets,
    {
      data: privilegeResponse,
      error: privilegeError,
      isFetching: isLoadingPrivilegeSet,
      isSuccess: _privilegeSetSuccess,
      isUninitialized: _privilegeSetUninitialized,
    },
  ] = useLazyGetPrivilegeSetsQuery()
  const [
    fetchUser,
    {
      data: userResponse,
      error: userError,
      isFetching: isLoadingUser,
      isSuccess: fetchUserSuccess,
      isUninitialized: fetchUserUninitialized,
    },
  ] = useLazyGetUserAdminQuery()
  const [
    fetchUserRolesRestrictionsUpdate,
    {
      data: _updateUserResponse,
      error: updateUserError,
      isLoading: isLoadingUpdateUser,
      isSuccess: _updateUserSuccess,
      isUninitialized: updateUserUninitialized,
    },
  ] = useUpdateUserRolesRestrictionsMutation()

  useEffect(() => {
    setDocumentTitle(title)

    void getUserData()

    return function cleanup() {
      dispatch(userAdminActions.userSet(undefined))
    }
  }, [])

  useEffect(() => {
    if (location?.pathname) {
      dispatch(userAdminActions.lastRouteSet(`${location.pathname}${location.search}`))
    }
    if (!sets || !sets.length) {
      void fetchPrivilegeSets()
    }
  }, [location, sets, title])

  useEffect(() => {
    if (user) {
      setTitle(t('USER_TITLE', { name: user.username || '' }))
      setupRestrictions()
      setupRoles()
    }
  }, [user])

  useEffect(() => {
    if (user && sets) {
      setupRoles()
    }
  }, [sets, user])

  useEffect(() => {
    if (!isLoadingPrivilegeSet) {
      if (!privilegeError && privilegeResponse) {
        dispatch(privilegeSetActions.setPrivileges(privilegeResponse))
      }

      if (privilegeError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(privilegeError)))
      }
    }
  }, [isLoadingPrivilegeSet, privilegeError, privilegeResponse])

  useEffect(() => {
    if (!fetchUserUninitialized) {
      if (fetchUserSuccess && !userError && userResponse) {
        dispatch(userAdminActions.userSet(userResponse))
      }

      if (userError) {
        dispatch(uiActions.apiDialogSet(getErrorStringFromApiResponse(userError)))
      }
    }
  }, [fetchUserSuccess, userError])

  useEffect(() => {
    if (!isLoadingUpdateUser && !updateUserUninitialized) {
      if (updateUserError) {
        const msg = getErrorMessage(
          updateUserError?.code || null,
          (updateUserError as CustomResponseErrorType)?.localizedMessage,
        )
        dispatch(uiActions.apiDialogSet(msg))
      }

      if (!updateUserError) {
        toast.success(strings.USER_UPDATED)
      }
    }
  }, [isLoadingUpdateUser, updateUserError, updateUserUninitialized])

  const getUserData = async (): Promise<void> => {
    if (id) {
      await fetchUser(id)
    }
  }

  const setupRestrictions = (): void => {
    const keys = Object.keys(ACCOUNT_RESTRICTIONS) as (keyof typeof ACCOUNT_RESTRICTIONS)[]
    const userRestrictions: UserRestriction[] = []
    if (user?.restrictions && Array.isArray(user.restrictions)) {
      for (const key of keys) {
        const thisRestriction = ACCOUNT_RESTRICTIONS[key]
        userRestrictions.push({
          isRestricted: user.restrictions.indexOf(thisRestriction) > -1,
          restriction: thisRestriction as keyof typeof ACCOUNT_RESTRICTIONS,
        })
      }
    }

    setRestrictions(userRestrictions)
  }

  const setupRoles = (): void => {
    if (sets && user) {
      const roleCheckboxes = prepareRoleCheckboxes(sets, user)
      setRoles(roleCheckboxes)
    }
  }

  const handleRoleClick = async (clickedRole: string): Promise<void> => {
    if (!currentUser?.sa) {
      setAlertRoleOpen(true)
      return
    }

    if (user?.roles && Array.isArray(user.roles)) {
      let nextRoles = [...new Set(user.roles)]
      if (user.roles.indexOf(clickedRole) > -1) {
        nextRoles = user?.roles.filter((role) => role !== clickedRole)
      } else {
        nextRoles.push(clickedRole)
      }

      const updateData = {
        ...user,
        roles: nextRoles,
      }

      dispatch(userAdminActions.userSet(updateData))
      setupRoles()
      void fetchUserRolesRestrictionsUpdate({
        id: user.id,
        roles: nextRoles,
      })
    }
  }

  const renderDivider = (m?: string): React.ReactElement => {
    return (
      <Divider
        sx={{
          margin: m ? m : '10px 0',
          width: '100%',
        }}
      />
    )
  }

  const renderDefaultChip = (): React.ReactElement => {
    return (
      <Chip
        color="info"
        label={strings.DEFAULT}
        sx={{
          height: '20px',
          marginRight: '12px',
        }}
      />
    )
  }

  const renderVerifiedChip = (): React.ReactElement => {
    return (
      <Chip
        color="success"
        label={strings.VERIFIED}
        sx={{
          height: '20px',
          marginRight: '12px',
        }}
      />
    )
  }

  const renderEmailsPhones = (): React.ReactElement => {
    return (
      <Grid
        container
        direction="column"
        padding={MD_BREAK ? '10px' : '10px 24px'}
        width={MD_BREAK ? '100%' : '50%'}
      >
        {/** USERNAME */}
        <Grid
          container
          margin="0 0 20px"
        >
          <Grid width={'100%'}>
            {isLoadingUser && (
              <Skeleton
                animation="wave"
                style={{
                  height: '56px',
                  width: '100%',
                }}
                variant="text"
              />
            )}
            {!isLoadingUser && (
              <>
                <Grid
                  sx={(theme) => {
                    return {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.common.white,
                      padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                      textAlign: MD_BREAK ? 'center' : 'left',
                    }
                  }}
                >
                  <Typography fontWeight={700}>{strings.USERNAME}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="body1">{user?.username || strings.NO_DATA}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        {/** NAME */}
        <Grid
          container
          margin="0 0 20px"
        >
          <Grid width={'100%'}>
            {isLoadingUser && (
              <Skeleton
                animation="wave"
                style={{
                  height: '56px',
                  width: '100%',
                }}
                variant="text"
              />
            )}
            {!isLoadingUser && (
              <>
                <Grid
                  sx={(theme) => {
                    return {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.common.white,
                      padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                      textAlign: MD_BREAK ? 'center' : 'left',
                    }
                  }}
                >
                  <Typography fontWeight={700}>{strings.NAME}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="body1">{user?.fullName || strings.NO_DATA}</Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        {/** EMAILS */}
        <Grid
          container
          direction={'column'}
          margin="0 0 20px"
        >
          <Grid
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>{strings.EMAILS}</Typography>
          </Grid>

          {/* {renderDivider('0 0 10')} */}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid
              container
              direction="column"
              justifyContent="space-between"
            >
              {user?.emails.map((email, _index) => {
                return (
                  <React.Fragment key={`email-${email.id}`}>
                    <Grid
                      alignItems={MD_BREAK ? 'flex-start' : 'center'}
                      borderTop="1px solid lightgray"
                      container
                      direction={MD_BREAK ? 'column' : 'row'}
                      display="flex"
                      justifyContent={MD_BREAK ? 'flex-start' : 'space-between'}
                      padding="10px 0px 3px"
                      width="100%"
                    >
                      <Grid
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="body1">{email.email}</Typography>
                      </Grid>
                      {MD_BREAK && (
                        <>
                          <Grid padding={'4px 0 0'}>
                            <Typography variant="body1">{email.label}</Typography>
                          </Grid>
                          <Grid padding={'4px 0'}>
                            {email.isVerified && renderVerifiedChip()}
                            {email.default && renderDefaultChip()}
                          </Grid>
                        </>
                      )}
                      {!MD_BREAK && (
                        <Grid>
                          {email.isVerified && renderVerifiedChip()}
                          {email.default && renderDefaultChip()}
                          {email.label}
                        </Grid>
                      )}
                    </Grid>
                  </React.Fragment>
                )
              })}
            </Grid>
          )}
        </Grid>

        {/** PHONES */}
        <Grid
          container
          direction={'column'}
          margin="0 0 20px"
        >
          <Grid
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>{strings.PHONES}</Typography>
          </Grid>
          {/* {renderDivider('0 0 10')} */}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid
              container
              direction="column"
              justifyContent="space-between"
            >
              {user?.phones.map((phone, _index) => {
                return (
                  <React.Fragment key={`phone-${phone.id}`}>
                    <Grid
                      alignItems={MD_BREAK ? 'flex-start' : 'center'}
                      borderTop="1px solid lightgray"
                      container
                      direction={MD_BREAK ? 'column' : 'row'}
                      display="flex"
                      justifyContent={MD_BREAK ? 'flex-start' : 'space-between'}
                      padding="10px 0px 3px"
                      width="100%"
                    >
                      <Grid
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="body1">{phone.uiFormatted}</Typography>
                      </Grid>
                      {MD_BREAK && (
                        <>
                          <Grid padding={'4px 0 0'}>
                            <Typography variant="body1">{phone.label}</Typography>
                          </Grid>
                          <Grid padding={'4px 0'}>
                            {phone.isVerified && renderVerifiedChip()}
                            {phone.default && renderDefaultChip()}
                          </Grid>
                        </>
                      )}
                      {!MD_BREAK && (
                        <Grid>
                          {phone.isVerified && renderVerifiedChip()}
                          {phone.default && renderDefaultChip()}
                          <Typography
                            display={'inline-flex'}
                            variant="body1"
                          >
                            {phone.label}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </React.Fragment>
                )
              })}
            </Grid>
          )}
        </Grid>
      </Grid>
    )
  }

  const renderRolesRestrictions = (): React.ReactElement => {
    return (
      <Grid
        container
        direction="column"
        padding={MD_BREAK ? '10px' : '10px 24px'}
        width={MD_BREAK ? '100%' : '50%'}
      >
        {/** ROLES */}
        <Grid
          container
          direction="column"
          margin="0 0 20px"
        >
          <Grid
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>{strings.ROLES}</Typography>
          </Grid>
          {renderDivider('0 0 10')}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid
              container
              direction={'column'}
              justifyContent="space-between"
            >
              {roles.map((role, _index) => {
                return (
                  <Grid
                    container
                    key={`role-${role.role}`}
                  >
                    <Grid>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={role.hasRole}
                              onClick={() => void handleRoleClick(role.role)}
                              size="large"
                            />
                          }
                          label={role.role}
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Grid>

        {/** RESTRICTIONS */}
        <Grid
          container
          direction="column"
        >
          <Grid
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>{strings.RESTRICTIONS}</Typography>
          </Grid>
          {renderDivider('0 0 10')}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid
              container
              direction={'column'}
              justifyContent="space-between"
            >
              {restrictions.map((restriction, index) => {
                return (
                  <Grid
                    container
                    key={`restriction-${restriction.restriction}`}
                  >
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={restriction.isRestricted}
                            className="Mui-checked-error"
                            onClick={() => logger.log('clicked', restriction.restriction)}
                            size="large"
                          />
                        }
                        label={restriction.restriction}
                      />
                    </FormGroup>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Grid>
      </Grid>
    )
  }

  const alertRoleModal = createPortal(
    <CustomDialog
      body={
        <DialogAlert
          buttonText={strings.OK}
          closeDialog={() => setAlertRoleOpen(false)}
          message={strings.YOU_CANNOT_EDIT_ROLES}
          windowHeight={windowHeight}
        />
      }
      closeDialog={() => setAlertRoleOpen(false)}
      isMobileWidth={isMobileWidth}
      open={alertRoleOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const notificationModal = createPortal(
    <CustomDialog
      body={
        <NotificationSendDialog
          closeDialog={() => setNotificationOpen(false)}
          user={user}
        />
      }
      closeDialog={() => setNotificationOpen(false)}
      isMobileWidth={isMobileWidth}
      open={notificationOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  const renderActionArea = (): React.ReactElement => {
    return (
      <Grid>
        <Button
          color={'primary'}
          onClick={() => setNotificationOpen(true)}
          variant="contained"
        >
          {strings.SEND_NOTIFICATION}
        </Button>
        {notificationModal}
      </Grid>
    )
  }

  return (
    <ContentWrapper
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '82px' : '82px'}
      spacerDiv={true}
    >
      <UserAdminEditHeaderComponent />
      <Box
        padding="24px"
        width={'100%'}
      >
        <Paper elevation={2}>
          {/** Username, Name, Phones, Emails, Roles, and Restrictions */}
          <Grid
            container
            direction={MD_BREAK ? 'column' : 'row'}
            justifyContent="flex-start"
            padding="20px"
            size={12}
          >
            {renderEmailsPhones()}
            {renderRolesRestrictions()}
          </Grid>

          {/** Action Area */}
          <Grid
            container
            direction={MD_BREAK ? 'column' : 'row'}
            justifyContent="flex-start"
            padding="20px"
            size={12}
          >
            {renderDivider('12px 0 12px')}
            {renderActionArea()}
          </Grid>
        </Paper>

        {/** Tabs Section */}
        {id && (
          <Paper elevation={2} sx={{ marginTop: '24px' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                onChange={(_e, newValue) => setActiveTab(newValue)}
                value={activeTab}
              >
                <Tab label={strings.SUPPORT_REQUESTS} />
              </Tabs>
            </Box>
            {activeTab === 0 && <UserSupportRequestsTabComponent userId={id} />}
          </Paper>
        )}
      </Box>
      {alertRoleModal}
    </ContentWrapper>
  )
}
