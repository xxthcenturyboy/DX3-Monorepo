import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Box, Button, Fade, FormControl, InputLabel, OutlinedInput, useTheme } from '@mui/material'
// import Zoom from '@mui/material/Zoom'
import React from 'react'
import { BeatLoader } from 'react-spinners'

import type { LoginPayloadType } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { authActions } from './auth-web.reducer'
import { LoginForm } from './auth-web-login.ui'

type WebLoginUserPassPropType = {
  changeLoginType: () => void
  isFetchingLogin: boolean
  login: (payload: LoginPayloadType) => Promise<void>
}

export const WebLoginUserPass: React.FC<WebLoginUserPassPropType> = React.forwardRef(
  (props, ref) => {
    const { isFetchingLogin } = props
    const [showPassword, setShowPassword] = React.useState(false)
    const username = useAppSelector((state) => state.auth.username)
    const password = useAppSelector((state) => state.auth.password)
    const strings = useStrings(['EMAIL', 'LOG_IN', 'LOGIN', 'PASSWORD', 'USERNAME'])
    const dispatch = useAppDispatch()
    const theme = useTheme()

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
          marginTop="12px"
          ref={ref}
          width="100%"
        >
          <LoginForm
            name="form-login"
            onSubmit={handleLogin}
          >
            <FormControl
              disabled={isFetchingLogin}
              margin="normal"
              variant="outlined"
            >
              <InputLabel htmlFor="input-username">{`${strings.USERNAME} / ${strings.EMAIL}`}</InputLabel>
              <OutlinedInput
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                fullWidth
                id="input-username"
                label={`${strings.USERNAME} / ${strings.EMAIL}`}
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
              <InputLabel htmlFor="input-password">{strings.PASSWORD}</InputLabel>
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
                label={strings.PASSWORD}
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
                marginTop: '24px',
              }}
              type="submit"
              variant="contained"
            >
              {isFetchingLogin ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="4px"
                  size={16}
                />
              ) : (
                strings.LOG_IN
              )}
            </Button>
          </LoginForm>
        </Box>
      </Fade>
    )
  },
)
