import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Box,
  Button,
  Fade,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material'
import Zoom from '@mui/material/Zoom'
import React from 'react'
import { BeatLoader } from 'react-spinners'

import type { LoginPayloadType } from '@dx3/models-shared'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { authActions } from './auth-web.reducer'
import * as UI from './auth-web-login.ui'

type WebLoginUserPassPropType = {
  changeLoginType: () => void
  isFetchingLogin: boolean
  login: (payload: LoginPayloadType) => Promise<void>
}

export const WebLoginUserPass: React.FC<WebLoginUserPassPropType> = React.forwardRef(
  (props, ref) => {
    const { isFetchingLogin } = props
    const [showPassword, setShowPassword] = React.useState(false)
    const [loginAttempts, setLoginAttempts] = React.useState(0)
    const username = useAppSelector((state) => state.auth.username)
    const password = useAppSelector((state) => state.auth.password)
    const S_LOGIN = useAppSelector((state) => state.ui.strings.LOGIN)
    const S_PASSWORD = useAppSelector((state) => state.ui.strings.PASSWORD)
    const S_USERNAME = useAppSelector((state) => state.ui.strings.USERNAME)
    const S_TRY_ANOTHER_METHOD = useAppSelector((state) => state.ui.strings.TRY_ANOTHER_WAY)
    const dispatch = useAppDispatch()

    const clearInputs = (): void => {
      dispatch(authActions.usernameUpdated(''))
      dispatch(authActions.passwordUpdated(''))
    }

    React.useEffect(() => {
      clearInputs()

      return function cleanup() {
        clearInputs()
      }
    }, [])

    const submitDisabled = (): boolean => {
      if (
        !username ||
        !password ||
        (username && !password) ||
        (username && password.length < 6)
        // || (!regexEmail.test(username))
      ) {
        return true
      }

      return false
    }

    const handleLogin = async (event: React.FormEvent): Promise<void> => {
      event.preventDefault()
      event.stopPropagation()

      if (submitDisabled()) {
        return
      }

      if (typeof username === 'string' && typeof password === 'string') {
        const data: LoginPayloadType = {
          password: password,
          value: username,
        }

        await props.login(data)
        setLoginAttempts(loginAttempts + 1)
      }
    }

    const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>): void => {
      dispatch(authActions.usernameUpdated(event.target.value))
    }

    const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>): void => {
      dispatch(authActions.passwordUpdated(event.target.value))
    }

    return (
      <Fade
        in={true}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Box
          ref={ref}
          width={'100%'}
        >
          <UI.Form
            name="form-login"
            onSubmit={handleLogin}
          >
            <FormControl
              disabled={isFetchingLogin}
              margin="normal"
              variant="outlined"
            >
              <InputLabel htmlFor="input-username">{S_USERNAME}</InputLabel>
              <OutlinedInput
                autoCapitalize="none"
                autoCorrect="off"
                fullWidth
                id="input-username"
                label={S_USERNAME}
                name="input-username"
                onChange={handleChangeUsername}
                // autoComplete="email"
                spellCheck={false}
                type="text"
                value={username}
              />
            </FormControl>
            <FormControl
              disabled={isFetchingLogin}
              margin="normal"
              variant="outlined"
            >
              <InputLabel htmlFor="input-password">{S_PASSWORD}</InputLabel>
              <OutlinedInput
                autoCapitalize="none"
                autoComplete="current-password"
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
                label={S_PASSWORD}
                name="input-password"
                onChange={handleChangePassword}
                spellCheck={false}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
            </FormControl>
            <Button
              disabled={submitDisabled()}
              fullWidth
              onClick={handleLogin}
              sx={{
                marginTop: '50px',
              }}
              type="submit"
              variant="contained"
            >
              {isFetchingLogin ? (
                <BeatLoader
                  color={themeColors.secondary}
                  margin="2px"
                  size={16}
                />
              ) : (
                S_LOGIN
              )}
            </Button>
          </UI.Form>
          {loginAttempts > 2 && (
            <Zoom in={true}>
              <Typography
                align="right"
                alignSelf="flex-end"
                color="primary"
                marginBottom={'0'}
                marginTop={'2em'}
                onClick={() => props.changeLoginType()}
                style={{ cursor: 'pointer' }}
                variant="subtitle2"
              >
                {S_TRY_ANOTHER_METHOD}
              </Typography>
            </Zoom>
          )}
        </Box>
      </Fade>
    )
  },
)
