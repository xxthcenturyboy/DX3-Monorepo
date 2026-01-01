import Edit from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import { toast } from 'react-toastify'

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { useUpdateUserMutation } from './user-profile-web.api'
import { userProfileActions } from './user-profile-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UpdateProfileNamesForm } from './user-profile-web-change-password.ui'

export const UserProfileEditNames: React.FC = () => {
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const [editNames, setEditNames] = React.useState(false)
  const [nameFirst, setNameFirst] = React.useState('')
  const [nameLast, setNameLast] = React.useState('')
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const [
    requestUpdateUser,
    {
      data: _updateUserResponse,
      error: updateUserError,
      isLoading: isLoadingUpdateUser,
      isSuccess: updateUserSuccess,
      isUninitialized: updateUserUninitialized,
      reset: resetUpdateUser,
    },
  ] = useUpdateUserMutation()

  React.useEffect(() => {
    if (!isLoadingUpdateUser && !updateUserUninitialized) {
      if (updateUserSuccess) {
        toast.success('Profile updated')
        dispatch(
          userProfileActions.profileUpdated({
            ...profile,
            firstName: nameFirst,
            fullName: `${nameFirst} ${nameLast}`,
            lastName: nameLast,
          }),
        )
        dispatch(uiActions.awaitDialogOpenSet(false))
        setEditNames(false)
        setNameFirst('')
        setNameLast('')
        resetUpdateUser()
      }

      if (updateUserError) {
        if ('error' in updateUserError) {
          toast.error(updateUserError.error)
        }
      }
    }
  }, [isLoadingUpdateUser, updateUserError, updateUserSuccess])

  const submitDisabled = (): boolean => {
    if (!(nameFirst && nameLast) || isLoadingUpdateUser) {
      return true
    }

    if (nameFirst === profile.firstName && nameLast === profile.lastName) {
      return true
    }

    return false
  }

  return (
    <>
      {editNames && (
        <Fade
          in={editNames}
          timeout={FADE_TIMEOUT_DUR}
        >
          <UpdateProfileNamesForm
            action={() => {
              dispatch(uiActions.awaitDialogOpenSet(true))
              requestUpdateUser({
                firstName: nameFirst,
                id: profile.id,
                lastName: nameLast,
              })
            }}
          >
            <Grid
              container
              direction={SM_BREAK ? 'column' : 'row'}
              justifyContent={'center'}
              size={12}
            >
              {/** First Name */}
              <Grid
                padding="10px"
                size={{
                  sm: 6,
                  xs: 12,
                }}
                width={'100%'}
              >
                <FormControl
                  disabled={isLoadingUpdateUser}
                  margin="normal"
                  style={{
                    width: '100%',
                  }}
                >
                  <InputLabel htmlFor="input-first-name">First Name</InputLabel>
                  <OutlinedInput
                    autoCorrect="off"
                    fullWidth
                    id="input-first-name"
                    label={'First Name'}
                    name="input-first-name"
                    onChange={(event) => setNameFirst(event.target.value)}
                    type="text"
                    value={nameFirst}
                  />
                </FormControl>
              </Grid>

              {/** Last Name */}
              <Grid
                padding="10px"
                size={{
                  sm: 6,
                  xs: 12,
                }}
                width={'100%'}
              >
                <FormControl
                  disabled={isLoadingUpdateUser}
                  margin="normal"
                  style={{
                    width: '100%',
                  }}
                >
                  <InputLabel htmlFor="input-last-name">Last Name</InputLabel>
                  <OutlinedInput
                    autoCorrect="off"
                    fullWidth
                    id="input-last-name"
                    label={'Last Name'}
                    name="input-last-name"
                    onChange={(event) => setNameLast(event.target.value)}
                    type="text"
                    value={nameLast}
                  />
                </FormControl>
              </Grid>

              {/** Submit Button */}
              <Grid
                container
                direction={SM_BREAK ? 'column' : 'row'}
                justifyContent={SM_BREAK ? 'center' : 'flex-end'}
                padding={SM_BREAK ? '12px' : '0 12px'}
                size={12}
                spacing={2}
              >
                <Button
                  color="primary"
                  onClick={() => setEditNames(false)}
                  type="button"
                  variant="contained"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={submitDisabled()}
                  type="submit"
                  variant="contained"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </UpdateProfileNamesForm>
        </Fade>
      )}
      {!editNames && (
        <Fade
          in={!editNames}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid
            container
            direction={SM_BREAK ? 'column' : 'row'}
            justifyContent={'flex-end'}
            size={12}
          >
            <Box
              alignSelf={'flex-end'}
              display={'flex'}
              marginTop={'12px'}
            >
              <IconButton
                color="primary"
                onClick={() => {
                  setNameFirst(profile.firstName)
                  setNameLast(profile.lastName)
                  setEditNames(true)
                }}
                size="small"
              >
                <Edit />
              </IconButton>
            </Box>

            <Grid
              marginTop={'-32px'}
              padding="10px"
              size={{
                xs: 12,
              }}
              width={'100%'}
            >
              <Typography>
                <strong>First Name:</strong> {profile.firstName}
              </Typography>
            </Grid>

            <Grid
              padding="10px"
              size={{
                xs: 12,
              }}
              width={'100%'}
            >
              <Typography>
                <strong>Last Name:</strong> {profile.lastName}
              </Typography>
            </Grid>
          </Grid>
        </Fade>
      )}
    </>
  )
}
