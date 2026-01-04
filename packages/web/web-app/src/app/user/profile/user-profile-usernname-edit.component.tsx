import Edit from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

import { isUsernameValid, USERNAME_MIN_LENGTH } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { AuthWebRequestOtp } from '../../auth/auth-web-request-otp.component'
import { useI18n, useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import {
  useLazyGetUsernameAvailabilityQuery,
  useUpdateUsernameMutation,
} from './user-profile-web.api'
import { userProfileActions } from './user-profile-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { UpdateProfileNamesForm } from './user-profile-web-change-password.ui'

export const UserProfileEditUsername: React.FC = () => {
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const [editUsername, setEditUsername] = React.useState(false)
  const [didClickSave, setDidClickSave] = React.useState(false)
  const [usernameAvailable, setUsernameAvailable] = React.useState(false)
  const [availableFeedback, setAvailableFeedback] = React.useState('')
  const [nameUser, setNameUser] = React.useState('')
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const { t } = useI18n()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const strings = useStrings([
    'USERNAME',
    'CHECK_AVAILABLILITY',
    'EDIT',
    'ADD',
    'NO_DATA',
    'SAVE',
    'CANCEL',
    'PROFILE_UPDATED',
    'USERNAME_IS_AVAILABLE',
    'USERNAME_IS_UNAVAILABLE',
    'USERNAME_REQUIREMENT',
  ])
  const [
    requestUpdateUsername,
    {
      data: updateUsernameResponse,
      error: updateUsernameError,
      isLoading: isUpdatingUsername,
      isSuccess: updateUsernameSuccess,
      isUninitialized: updateUsernameUninitialized,
      reset: resetUpdateUsername,
    },
  ] = useUpdateUsernameMutation()
  const [
    requestUsernameAvailability,
    {
      data: usernameAvailableResponse,
      error: usernameAvailableError,
      isLoading: isCheckingUsernameAvailability,
      isSuccess: usernameAvailableSuccess,
      isUninitialized: usernameAvailableUninitialized,
      reset: resetUsernameAvailability,
    },
  ] = useLazyGetUsernameAvailabilityQuery()

  const resetState = (): void => {
    resetUpdateUsername()
    resetUsernameAvailability()
    setAvailableFeedback('')
    setUsernameAvailable(false)
    setEditUsername(false)
    setNameUser('')
    setUsernameAvailable(false)
    setDidClickSave(false)
  }

  React.useEffect(() => {
    if (!isCheckingUsernameAvailability && !usernameAvailableUninitialized) {
      if (usernameAvailableSuccess) {
        setUsernameAvailable(usernameAvailableResponse.available)
        setAvailableFeedback(
          usernameAvailableResponse.available
            ? strings.USERNAME_IS_AVAILABLE
            : strings.USERNAME_IS_UNAVAILABLE,
        )
        resetUsernameAvailability()
      }

      if (usernameAvailableError) {
        if ('error' in usernameAvailableError) {
          toast.error(usernameAvailableError.error)
        }
      }
    }
  }, [isCheckingUsernameAvailability, usernameAvailableError, usernameAvailableSuccess])

  React.useEffect(() => {
    if (!isUpdatingUsername && !updateUsernameUninitialized) {
      if (updateUsernameSuccess) {
        toast.success(strings.PROFILE_UPDATED)
        dispatch(
          userProfileActions.profileUpdated({
            ...profile,
            username: nameUser,
          }),
        )
        resetState()
      }

      if (updateUsernameError) {
        if ('error' in updateUsernameError) {
          toast.error(updateUsernameError.error)
        }
      }
    }
  }, [isUpdatingUsername, updateUsernameError, updateUsernameSuccess])

  const isAnyXhr = () => {
    return isCheckingUsernameAvailability || isUpdatingUsername
  }

  const isValidUsername = () => {
    return nameUser && isUsernameValid(nameUser)
  }

  const feedbackColor = () => {
    if (!isValidUsername()) {
      return theme.palette.info.main
    }

    if (usernameAvailable) {
      return theme.palette.success.main
    }

    if (!usernameAvailable) {
      return theme.palette.error.main
    }

    return theme.palette.primary.main
  }

  const submitDisabled = (): boolean => {
    if (!nameUser || isAnyXhr() || nameUser === profile.username || !isValidUsername()) {
      return true
    }

    return false
  }

  const handlelUpdateUsername = async (data: {
    code: string
    value: string
    region?: string
  }): Promise<void> => {
    try {
      await requestUpdateUsername({
        id: profile.id,
        payload: {
          otpCode: data.code,
          username: nameUser,
        },
      })
    } catch (err) {
      logger.error((err as Error).message, err)
    }
  }

  return (
    <>
      {editUsername && !didClickSave && (
        <Fade
          in={editUsername}
          timeout={FADE_TIMEOUT_DUR}
        >
          <UpdateProfileNamesForm
            action={() => {
              if (submitDisabled()) return

              void requestUsernameAvailability(nameUser)
            }}
          >
            <Grid
              container
              direction={SM_BREAK ? 'column' : 'row'}
              justifyContent={'flex-start'}
              size={12}
            >
              {/** Username */}
              <Grid
                padding="10px"
                size={{
                  xs: 12,
                }}
                width={'100%'}
              >
                <FormControl
                  disabled={isUpdatingUsername}
                  margin="normal"
                  style={{
                    width: '100%',
                  }}
                >
                  <InputLabel htmlFor="input-user-name">{strings.USERNAME}</InputLabel>
                  <OutlinedInput
                    autoCorrect="off"
                    disabled={isAnyXhr()}
                    fullWidth
                    id="input-user-name"
                    label={strings.USERNAME}
                    name="input-user-name"
                    onChange={(event) => {
                      setNameUser(event.target.value)
                      setAvailableFeedback('')
                      setUsernameAvailable(false)
                    }}
                    type="text"
                    value={nameUser}
                  />
                  <FormHelperText
                    id="input-user-name-helper-text"
                    sx={{ color: feedbackColor(), fontSize: '1.15em' }}
                  >
                    {nameUser && !isValidUsername()
                      ? t('USERNAME_REQUIREMENT', { count: USERNAME_MIN_LENGTH })
                      : availableFeedback}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/** Buttons */}
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
                  disabled={isAnyXhr()}
                  onClick={() => {
                    if (isAnyXhr()) return
                    resetState()
                  }}
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
                  {isCheckingUsernameAvailability ? (
                    <BeatLoader
                      color={theme.palette.secondary.main}
                      margin="2px"
                      size={16}
                    />
                  ) : (
                    strings.CHECK_AVAILABLILITY
                  )}
                </Button>
                <Button
                  color="primary"
                  disabled={!usernameAvailable}
                  onClick={() => {
                    if (isAnyXhr()) return
                    setDidClickSave(true)
                  }}
                  type="button"
                  variant="contained"
                >
                  {isUpdatingUsername ? (
                    <BeatLoader
                      color={theme.palette.secondary.main}
                      margin="2px"
                      size={16}
                    />
                  ) : (
                    strings.SAVE
                  )}
                </Button>
              </Grid>
            </Grid>
          </UpdateProfileNamesForm>
        </Fade>
      )}
      {editUsername && didClickSave && (
        <Fade
          in={didClickSave}
          timeout={FADE_TIMEOUT_DUR}
        >
          <Grid
            container
            direction={SM_BREAK ? 'column' : 'row'}
            justifyContent={'flex-end'}
            size={12}
          >
            <AuthWebRequestOtp
              hasCallbackError={!!usernameAvailableError}
              onCompleteCallback={(value: string, code: string, region?: string) => {
                void handlelUpdateUsername({
                  code,
                  region,
                  value,
                })
              }}
            />
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
                disabled={isAnyXhr()}
                onClick={() => {
                  if (isAnyXhr()) return
                  resetState()
                }}
                type="button"
                variant="contained"
              >
                {strings.CANCEL}
              </Button>
            </Grid>
          </Grid>
        </Fade>
      )}
      {!editUsername && (
        <Fade
          in={!editUsername}
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
              {!profile.sa && (
                <Tooltip title={strings.EDIT}>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setNameUser(profile.username)
                      setEditUsername(true)
                    }}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Grid
              marginTop={profile.sa ? '0px' : '-32px'}
              padding="10px"
              size={{
                xs: 12,
              }}
              width={'100%'}
            >
              <Typography>
                <strong>{strings.USERNAME}:</strong> {profile.username || strings.NO_DATA}
              </Typography>
            </Grid>
          </Grid>
        </Fade>
      )}
    </>
  )
}
