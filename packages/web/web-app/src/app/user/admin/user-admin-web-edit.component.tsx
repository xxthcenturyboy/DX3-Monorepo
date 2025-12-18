import {
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid2,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { grey, lightBlue } from '@mui/material/colors'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { ACCOUNT_RESTRICTIONS, type UserRoleUi } from '@dx3/models-shared'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { DialogAlert } from '@dx3/web-libs/ui/dialog/alert.dialog'
import { listSkeleton } from '@dx3/web-libs/ui/global/skeletons.ui'

import { WebConfigService } from '../../config/config-web.service'
import { NotificationSendDialog } from '../../notifications/notification-web-send.dialog'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectWindowHeight } from '../../ui/store/ui-web.selector'
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

type UserRestriction = {
  restriction: keyof typeof ACCOUNT_RESTRICTIONS
  isRestricted: boolean
}

export const UserAdminEdit: React.FC = () => {
  const user = useAppSelector((state) => selectUserFormatted(state))
  const sets = useAppSelector((state) => state.privileges.sets)
  const currentUser = useAppSelector((state) => state.userProfile)
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const [title, setTitle] = useState('User')
  const [restrictions, setRestrictions] = useState<UserRestriction[]>([])
  const [roles, setRoles] = useState<UserRoleUi[]>([])
  const ROUTES = WebConfigService.getWebRoutes()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
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
      isSuccess: _fetchUserSuccess,
      isUninitialized: _fetchUserUninitialized,
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
    void getUserData()
    setDocumentTitle(title)
    if (location?.pathname) {
      dispatch(userAdminActions.lastRouteSet(`${location.pathname}${location.search}`))
    }
    if (!sets || !sets.length) {
      void fetchPrivilegeSets()
    }

    return function cleanup() {
      dispatch(userAdminActions.userSet(undefined))
    }
  }, [location, sets, title])

  useEffect(() => {
    if (user) {
      setTitle(`User: ${user.username}`)
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
      if (privilegeError && 'error' in privilegeError) {
        dispatch(uiActions.apiDialogSet(privilegeError.error))
      }
    }
  }, [isLoadingPrivilegeSet, privilegeError, privilegeResponse])

  useEffect(() => {
    if (!isLoadingUser) {
      if (!userError) {
        dispatch(userAdminActions.userSet(userResponse))
      }
      if (userError) {
        'error' in userError && dispatch(uiActions.apiDialogSet(userError.error))
      }
    }
  }, [isLoadingUser, userError, userResponse])

  useEffect(() => {
    if (!isLoadingUpdateUser && !updateUserUninitialized) {
      if (updateUserError && 'error' in updateUserError) {
        dispatch(uiActions.apiDialogSet(updateUserError.error))
      }

      if (!updateUserError) {
        toast.success('User updated.')
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
    if (currentUser?.id === user?.id && !currentUser?.sa) {
      dispatch(
        uiActions.appDialogSet(
          <DialogAlert
            buttonText="Aw, shucks"
            closeDialog={() => dispatch(uiActions.appDialogSet(null))}
            message="You cannot edit your own privileges."
            windowHeight={windowHeight}
          />,
        ),
      )
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

  const renderDivider = (m?: string): JSX.Element => {
    return (
      <Divider
        sx={{
          margin: m ? m : '10px 0',
          width: '100%',
        }}
      />
    )
  }

  const renderDefaultChip = (): JSX.Element => {
    return (
      <Chip
        color="info"
        label="Default"
        sx={{
          height: '20px',
          marginRight: '12px',
        }}
      />
    )
  }

  const renderVerifiedChip = (): JSX.Element => {
    return (
      <Chip
        color="success"
        label="Verified"
        sx={{
          height: '20px',
          marginRight: '12px',
        }}
      />
    )
  }

  const renderEmailsPhones = (): JSX.Element => {
    return (
      <Grid2
        container
        direction="column"
        padding={MD_BREAK ? '10px' : '10px 24px'}
        width={MD_BREAK ? '100%' : '50%'}
      >
        {/** NAME */}
        <Grid2
          container
          margin="0 0 20px"
        >
          <Grid2 width={'100%'}>
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
                <Grid2
                  sx={(theme) => {
                    return {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.common.white,
                      padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                      textAlign: MD_BREAK ? 'center' : 'left',
                    }
                  }}
                >
                  <Typography fontWeight={700}>Name</Typography>
                </Grid2>
                <Grid2>
                  <Typography variant="body1">{user?.fullName}</Typography>
                </Grid2>
              </>
            )}
          </Grid2>
        </Grid2>

        {/** EMAILS */}
        <Grid2
          container
          direction={'column'}
          margin="0 0 20px"
        >
          <Grid2
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>Emails</Typography>
          </Grid2>

          {/* {renderDivider('0 0 10')} */}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid2
              container
              direction="column"
              justifyContent="space-between"
            >
              {user?.emails.map((email, _index) => {
                return (
                  <React.Fragment key={`email-${email.id}`}>
                    <Grid2
                      alignItems={MD_BREAK ? 'flex-start' : 'center'}
                      borderTop="1px solid lightgray"
                      container
                      direction={MD_BREAK ? 'column' : 'row'}
                      display="flex"
                      justifyContent={MD_BREAK ? 'flex-start' : 'space-between'}
                      padding="10px 0px 3px"
                      width="100%"
                    >
                      <Grid2
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="body1">{email.email}</Typography>
                      </Grid2>
                      {MD_BREAK && (
                        <>
                          <Grid2 padding={'4px 0 0'}>
                            <Typography variant="body1">{email.label}</Typography>
                          </Grid2>
                          <Grid2 padding={'4px 0'}>
                            {email.isVerified && renderVerifiedChip()}
                            {email.default && renderDefaultChip()}
                          </Grid2>
                        </>
                      )}
                      {!MD_BREAK && (
                        <Grid2>
                          {email.isVerified && renderVerifiedChip()}
                          {email.default && renderDefaultChip()}
                          {email.label}
                        </Grid2>
                      )}
                    </Grid2>
                  </React.Fragment>
                )
              })}
            </Grid2>
          )}
        </Grid2>

        {/** PHONES */}
        <Grid2
          container
          direction={'column'}
          margin="0 0 20px"
        >
          <Grid2
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>Phones</Typography>
          </Grid2>
          {/* {renderDivider('0 0 10')} */}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid2
              container
              direction="column"
              justifyContent="space-between"
            >
              {user?.phones.map((phone, _index) => {
                return (
                  <React.Fragment key={`phone-${phone.id}`}>
                    <Grid2
                      alignItems={MD_BREAK ? 'flex-start' : 'center'}
                      borderTop="1px solid lightgray"
                      container
                      direction={MD_BREAK ? 'column' : 'row'}
                      display="flex"
                      justifyContent={MD_BREAK ? 'flex-start' : 'space-between'}
                      padding="10px 0px 3px"
                      width="100%"
                    >
                      <Grid2
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="body1">
                          {phone.uiFormatted || phone.phoneFormatted}
                        </Typography>
                      </Grid2>
                      {MD_BREAK && (
                        <>
                          <Grid2 padding={'4px 0 0'}>
                            <Typography variant="body1">{phone.label}</Typography>
                          </Grid2>
                          <Grid2 padding={'4px 0'}>
                            {phone.isVerified && renderVerifiedChip()}
                            {phone.default && renderDefaultChip()}
                          </Grid2>
                        </>
                      )}
                      {!MD_BREAK && (
                        <Grid2>
                          {phone.isVerified && renderVerifiedChip()}
                          {phone.default && renderDefaultChip()}
                          <Typography
                            display={'inline-flex'}
                            variant="body1"
                          >
                            {phone.label}
                          </Typography>
                        </Grid2>
                      )}
                    </Grid2>
                  </React.Fragment>
                )
              })}
            </Grid2>
          )}
        </Grid2>
      </Grid2>
    )
  }

  const renderRolesRestrictions = (): JSX.Element => {
    return (
      <Grid2
        container
        direction="column"
        padding={MD_BREAK ? '10px' : '10px 24px'}
        width={MD_BREAK ? '100%' : '50%'}
      >
        {/** ROLES */}
        <Grid2
          container
          direction="column"
          margin="0 0 20px"
        >
          <Grid2
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>Roles</Typography>
          </Grid2>
          {renderDivider('0 0 10')}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid2
              container
              direction={'column'}
              justifyContent="space-between"
            >
              {roles.map((role, _index) => {
                return (
                  <Grid2
                    container
                    key={`role-${role.role}`}
                  >
                    <Grid2>
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
                    </Grid2>
                  </Grid2>
                )
              })}
            </Grid2>
          )}
        </Grid2>

        {/** RESTRICTIONS */}
        <Grid2
          container
          direction="column"
        >
          <Grid2
            sx={(theme) => {
              return {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                padding: MD_BREAK ? '4px 0' : '4px 4px 4px 8px',
                textAlign: MD_BREAK ? 'center' : 'left',
              }
            }}
          >
            <Typography fontWeight={700}>Restrictions</Typography>
          </Grid2>
          {renderDivider('0 0 10')}
          {isLoadingUser && listSkeleton(2, '48px')}
          {!isLoadingUser && (
            <Grid2
              container
              direction={'column'}
              justifyContent="space-between"
            >
              {restrictions.map((restriction, index) => {
                return (
                  <Grid2
                    container
                    key={`restriction-${restriction.restriction}`}
                  >
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={restriction.isRestricted}
                            className="Mui-checked-error"
                            onClick={() => console.log('clicked', restriction.restriction)}
                            size="large"
                          />
                        }
                        label={restriction.restriction}
                      />
                    </FormGroup>
                  </Grid2>
                )
              })}
            </Grid2>
          )}
        </Grid2>
      </Grid2>
    )
  }

  const renderActionArea = (): JSX.Element => {
    return (
      <Grid2>
        <Button
          color={'primary'}
          onClick={() => dispatch(uiActions.appDialogSet(<NotificationSendDialog user={user} />))}
          variant="contained"
        >
          Send Notification
        </Button>
      </Grid2>
    )
  }

  return (
    <ContentWrapper
      contentMarginTop={SM_BREAK ? '108px' : '64px'}
      headerColumnRightJustification={SM_BREAK ? 'flex-start' : 'flex-end'}
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
        <>
          {user?.optInBeta && (
            <Chip
              label="Opt-in Beta"
              sx={{
                backgroundColor: lightBlue[700],
                color: grey[50],
                margin: SM_BREAK ? '0 0 0 12px' : '0 12px 0 0',
              }}
            />
          )}
          {user?.restrictions && user.restrictions.length > 0 && (
            <Chip
              color="error"
              label="RESTRICTED"
            />
          )}
        </>
      }
      headerTitle={title}
      navigation={() => navigate(ROUTES.ADMIN.USER.LIST)}
    >
      <Paper elevation={2}>
        {/** Phones Emails Roles Restrictions */}
        <Grid2
          container
          direction={MD_BREAK ? 'column' : 'row'}
          justifyContent="flex-start"
          padding="20px"
          size={12}
        >
          {renderEmailsPhones()}
          {renderRolesRestrictions()}
        </Grid2>

        {/** Action Area */}
        <Grid2
          container
          direction={MD_BREAK ? 'column' : 'row'}
          justifyContent="flex-start"
          padding="20px"
          size={12}
        >
          {renderDivider('12px 0 12px')}
          {renderActionArea()}
        </Grid2>
      </Paper>
    </ContentWrapper>
  )
}
