import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import React, { type ReactElement } from 'react'
import { BeatLoader } from 'react-spinners'

import type { UpdatePasswordPayloadType } from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { useCheckPasswordStrengthMutation } from '../../auth/auth-web.api'
import { AuthWebRequestOtp } from '../../auth/auth-web-request-otp.component'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
import { useLazyGetProfileQuery, useUpdatePasswordMutation } from './user-profile-web.api'
import { userProfileActions } from './user-profile-web.reducer'
import { selectProfileFormatted } from './user-profile-web.selectors'
import { ChangePasswordForm } from './user-profile-web-change-password.ui'

type UserProfileChangePasswordPropsType = {
  closeDialog: () => void
  userId: string
}

export const UserProfileChangePasswordDialog: React.FC<UserProfileChangePasswordPropsType> = (
  props,
): ReactElement => {
  const [allSucceeded, setAllSucceeded] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPasswordStrong, setIsPasswordStrong] = React.useState(false)
  const [passwordStrengthMessage, setPasswordStrengthMessage] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [passwordConfirm, setPasswordConfirm] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const dispatch = useAppDispatch()
  const strings = useStrings([
    'CANCEL',
    'CHANGE_PASSWORD',
    'CLOSE',
    'CONFIRM_PASSWORD',
    'CREATE_PASSWORD',
    'PASSWORD',
    'UPDATE',
  ])
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const [
    requestPasswordStrength,
    {
      data: checkStrengthResponse,
      error: checkStrengthError,
      isLoading: isLoadingCheckStrength,
      isSuccess: _checkStrengthSuccess,
      isUninitialized: checkStrengthUninitialized,
    },
  ] = useCheckPasswordStrengthMutation()
  const [
    requestUpdatePassword,
    {
      data: _updatePasswordResponse,
      error: updatePasswordlError,
      isLoading: isLoadingUpdatePassword,
      isSuccess: updatePasswordSuccess,
      isUninitialized: updatePasswordUninitialized,
    },
  ] = useUpdatePasswordMutation()
  const [
    requestGetProfile,
    {
      data: getProfileResponse,
      error: getProfileError,
      isLoading: isLoadingGetProfile,
      isSuccess: getProfileSuccess,
      isUninitialized: getProfileUninitialized,
    },
  ] = useLazyGetProfileQuery()

  React.useEffect(() => {
    if (!props.userId) {
      handleClose()
    }
  }, [props.userId])

  React.useEffect(() => {
    if (!isLoadingUpdatePassword && !updatePasswordUninitialized) {
      if (updatePasswordSuccess) {
        setShowLottieError(false)

        if (!profile.hasSecuredAccount) {
          void requestGetProfile()
          return
        }

        setAllSucceeded(true)
      }

      if (updatePasswordlError) {
        if ('error' in updatePasswordlError) {
          setErrorMessage(updatePasswordlError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [
    isLoadingUpdatePassword,
    updatePasswordUninitialized,
    updatePasswordlError,
    updatePasswordSuccess,
  ])

  React.useEffect(() => {
    if (!isLoadingGetProfile && !getProfileUninitialized) {
      if (
        getProfileSuccess &&
        getProfileResponse.profile &&
        typeof getProfileResponse.profile !== 'string'
      ) {
        dispatch(userProfileActions.profileUpdated(getProfileResponse.profile))
      }

      setShowLottieError(false)
      setAllSucceeded(true)
    }
  }, [isLoadingGetProfile, getProfileUninitialized, getProfileError, getProfileSuccess])

  React.useEffect(() => {
    if (!isLoadingCheckStrength && !checkStrengthUninitialized) {
      if (!checkStrengthError) {
        setShowLottieError(false)
        if (checkStrengthResponse.score >= 3) {
          setIsPasswordStrong(true)
        }
        if (checkStrengthResponse.score < 3) {
          setIsPasswordStrong(false)
          setPasswordStrengthMessage(
            `${checkStrengthResponse.feedback.warning} ${checkStrengthResponse.feedback.suggestions}`,
          )
        }
      } else {
        if ('error' in checkStrengthError) {
          setErrorMessage(checkStrengthError.error)
        }
        setShowLottieError(true)
        setIsPasswordStrong(false)
      }
    }
  }, [
    isLoadingCheckStrength,
    checkStrengthError,
    checkStrengthResponse?.feedback.suggestions,
    checkStrengthResponse?.feedback.warning,
    checkStrengthResponse?.score,
    checkStrengthUninitialized,
  ])

  const reset = () => {
    setAllSucceeded(false)
    setShowLottieError(false)
    setIsPasswordStrong(false)
    setPasswordStrengthMessage('')
    setPassword('')
    setPasswordConfirm('')
    setErrorMessage('')
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

  const submitDisabled = (): boolean => {
    if (!(password && passwordConfirm) || password !== passwordConfirm || isLoadingCheckStrength) {
      return true
    }

    return false
  }

  const handleUpdatePassword = async (data: {
    code: string
    value: string
    region?: string
  }): Promise<void> => {
    try {
      const payload: UpdatePasswordPayloadType = {
        id: props.userId,
        otp: {
          code: data.code,
          id: data.value,
          method: data.region ? 'PHONE' : 'EMAIL',
        },
        password,
        passwordConfirm,
      }

      await requestUpdatePassword(payload)
    } catch (err) {
      logger.error((err as Error).message, err)
    }
  }

  const handleSubmitPassword = async (): Promise<void> => {
    if (!submitDisabled() && props.userId) {
      if (!isPasswordStrong) {
        try {
          await requestPasswordStrength({ password })
        } catch (err) {
          logger.error((err as Error).message, err)
        }
      }
    }
  }

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value)
  }

  const handleChangePasswordConfirm = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPasswordConfirm(event.target.value)
  }

  const renderFormContent = (): React.ReactElement => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={SM_BREAK ? 'flex-start' : 'space-around'}
        windowHeight={windowHeight}
      >
        <ChangePasswordForm
          name="form-change-password"
          onSubmit={handleSubmitPassword}
        >
          <FormControl
            disabled={isLoadingCheckStrength}
            margin="normal"
            style={{
              minWidth: 300,
            }}
          >
            <InputLabel htmlFor="input-password">{strings.PASSWORD}</InputLabel>
            <OutlinedInput
              autoComplete="new-password"
              autoCorrect="off"
              endAdornment={
                showPassword ? (
                  <Visibility
                    color="primary"
                    onClick={() => setShowPassword(false)}
                    sx={{
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <VisibilityOff
                    color="primary"
                    onClick={() => setShowPassword(true)}
                    sx={{
                      cursor: 'pointer',
                    }}
                  />
                )
              }
              fullWidth
              id="input-password"
              label={strings.PASSWORD}
              name="input-password"
              onChange={handleChangePassword}
              type={showPassword ? 'text' : 'password'}
              value={password || ''}
            />
          </FormControl>
          <FormControl
            disabled={isLoadingCheckStrength}
            margin="normal"
            style={{
              minWidth: 300,
            }}
          >
            <InputLabel htmlFor="input-password-confirm">{strings.CONFIRM_PASSWORD}</InputLabel>
            <OutlinedInput
              autoComplete="new-password"
              autoCorrect="off"
              endAdornment={
                showPassword ? (
                  <Visibility
                    color="primary"
                    onClick={() => setShowPassword(false)}
                    sx={{
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <VisibilityOff
                    color="primary"
                    onClick={() => setShowPassword(true)}
                    sx={{
                      cursor: 'pointer',
                    }}
                  />
                )
              }
              fullWidth
              id="input-password-confirm"
              label={strings.CONFIRM_PASSWORD}
              name="input-password-confirm"
              onChange={handleChangePasswordConfirm}
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirm || ''}
            />
          </FormControl>
        </ChangePasswordForm>
        {!isPasswordStrong && passwordStrengthMessage && (
          <Typography variant="h6">{passwordStrengthMessage}</Typography>
        )}
      </CustomDialogContent>
    )
  }

  return (
    <DialogWrapper maxWidth={400}>
      <DialogTitle
        style={{
          textAlign: 'center',
        }}
      >
        {profile.emails.length ? strings.CHANGE_PASSWORD : strings.CREATE_PASSWORD}
      </DialogTitle>
      {!allSucceeded && !showLottieError && !isPasswordStrong && renderFormContent()}
      {!allSucceeded && !showLottieError && isPasswordStrong && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <AuthWebRequestOtp
            hasCallbackError={!!updatePasswordlError}
            onCompleteCallback={(value: string, code: string, region?: string) => {
              void handleUpdatePassword({
                code,
                region,
                value,
              })
            }}
          />
        </CustomDialogContent>
      )}
      {showLottieError && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <DialogError
            message={errorMessage}
            windowHeight={windowHeight}
          />
        </CustomDialogContent>
      )}
      {allSucceeded && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <SuccessLottie complete={handleClose} />
        </CustomDialogContent>
      )}
      {!allSucceeded && (
        <DialogActions
          style={{
            justifyContent: isMobileWidth ? 'center' : 'flex-end',
          }}
        >
          <Button
            disabled={isLoadingCheckStrength || isLoadingUpdatePassword}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? strings.CLOSE : strings.CANCEL}
          </Button>
          {!showLottieError && !isPasswordStrong && (
            <Button
              disabled={submitDisabled()}
              onClick={handleSubmitPassword}
              variant="contained"
            >
              {isLoadingCheckStrength ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="2px"
                  size={16}
                />
              ) : (
                strings.UPDATE
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
