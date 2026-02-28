import Edit from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import React from 'react'
import { toast } from 'react-toastify'

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useStrings } from '../../i18n'
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
  const strings = useStrings([
    'NAME',
    'FIRST_NAME',
    'LAST_NAME',
    'EDIT',
    'ADD',
    'NO_DATA',
    'PROFILE_UPDATED',
    'SAVE',
    'CANCEL',
  ])
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
        toast.success(strings.PROFILE_UPDATED)
        dispatch(
          userProfileActions.profileUpdated({
            ...profile,
            firstName: nameFirst,
            fullName: `${nameFirst} ${nameLast}`,
            lastName: nameLast,
          }),
        )
        setEditNames(false)
        setNameFirst('')
        setNameLast('')
        resetUpdateUser()
      }

      if (updateUserError) {
        toast.error(getErrorStringFromApiResponse(updateUserError))
      }

      dispatch(uiActions.awaitDialogOpenSet(false))
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
                  <InputLabel htmlFor="input-first-name">{strings.FIRST_NAME}</InputLabel>
                  <OutlinedInput
                    autoComplete="given-name"
                    autoCorrect="off"
                    fullWidth
                    id="input-first-name"
                    label={strings.FIRST_NAME}
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
                  <InputLabel htmlFor="input-last-name">{strings.LAST_NAME}</InputLabel>
                  <OutlinedInput
                    autoComplete="family-name"
                    autoCorrect="off"
                    fullWidth
                    id="input-last-name"
                    label={strings.LAST_NAME}
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
                direction={SM_BREAK ? 'column-reverse' : 'row'}
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
                  {strings.CANCEL}
                </Button>
                <Button
                  color="primary"
                  disabled={submitDisabled()}
                  type="submit"
                  variant="contained"
                >
                  {strings.SAVE}
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
              <Tooltip title={strings.EDIT}>
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
              </Tooltip>
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
                <strong>{strings.NAME}:</strong> {profile.fullName || strings.NO_DATA}
              </Typography>
            </Grid>
          </Grid>
        </Fade>
      )}
    </>
  )
}
