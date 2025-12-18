import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import React, { type ReactElement } from 'react'
import { BeatLoader } from 'react-spinners'

import {
  NOTIFICATION_LEVELS,
  type NotificationCreationParamTypes,
  type UserType,
} from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { uiActions } from '../ui/store/ui-web.reducer'
import { selectIsMobileWidth, selectWindowHeight } from '../ui/store/ui-web.selector'
import {
  useSendNotificationToAllMutation,
  useSendNotificationToUserMutation,
} from './notification-web.api'
import { SendNotificationForm } from './notification-web-dialog.ui'

type NotificationSendPropsType = {
  user?: UserType
}

export const NotificationSendDialog: React.FC<NotificationSendPropsType> = (
  props,
): ReactElement => {
  const [allSucceeded, setAllSucceeded] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [level, setLevel] = React.useState(NOTIFICATION_LEVELS.INFO)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [sendToMobile, setSendToMobile] = React.useState(
    !!props.user?.phones.find((phone) => phone.default && phone.isVerified),
  )
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windwoHeight = useAppSelector((state) => selectWindowHeight(state))
  const dispatch = useAppDispatch()
  const [
    requestSendNotificationToAll,
    {
      data: _sendToAllResponse,
      error: sendToAllError,
      isLoading: isLoadingSendToAll,
      isSuccess: _sendToAllSuccess,
      isUninitialized: sendToAllUninitialized,
    },
  ] = useSendNotificationToAllMutation()
  const [
    requestSendNotificationToUser,
    {
      data: _sendToUserResponse,
      error: sendToUserError,
      isLoading: isLoadingSendToUser,
      isSuccess: _sendToUserSuccess,
      isUninitialized: sendToUserUninitialized,
    },
  ] = useSendNotificationToUserMutation()

  // React.useEffect(() => {}, []);

  React.useEffect(() => {
    if (!isLoadingSendToUser && !sendToUserUninitialized) {
      if (!sendToUserError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        if ('error' in sendToUserError) {
          setErrorMessage(sendToUserError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [isLoadingSendToUser, sendToUserError, sendToUserUninitialized])

  React.useEffect(() => {
    if (!isLoadingSendToAll && !sendToAllUninitialized) {
      if (!sendToAllError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        if ('error' in sendToAllError) {
          setErrorMessage(sendToAllError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [isLoadingSendToAll, sendToAllError, sendToAllUninitialized])

  const handleClose = (): void => {
    dispatch(uiActions.appDialogSet(null))
  }

  const submitDisabled = (): boolean => {
    if (!message || isLoadingSendToAll || isLoadingSendToUser) {
      return true
    }

    return false
  }

  const handleSend = async (): Promise<void> => {
    if (!submitDisabled() && props.user?.id) {
      try {
        const payload: NotificationCreationParamTypes = {
          level,
          message,
          suppressPush: !sendToMobile,
          title,
          userId: props.user.id,
        }

        await requestSendNotificationToUser(payload)
      } catch (err) {
        logger.error((err as Error).message, err)
      }
    }
    if (!submitDisabled() && !props.user?.id) {
      try {
        const payload: Partial<NotificationCreationParamTypes> = {
          level,
          message,
          suppressPush: !sendToMobile,
          title,
        }

        await requestSendNotificationToAll(payload)
      } catch (err) {
        logger.error((err as Error).message, err)
      }
    }
  }

  const handleSetTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value)
  }

  const handleSetMessage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMessage(event.target.value)
  }

  const handleChangeLevel = (event: SelectChangeEvent<string>): void => {
    setLevel(event.target.value)
  }

  const renderFormContent = (): JSX.Element => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={isMobileWidth ? 'flex-start' : 'space-around'}
        windowHeight={windwoHeight}
      >
        <SendNotificationForm
          name="form-send-notification"
          onSubmit={handleSend}
        >
          {/** Title */}
          <FormControl
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            margin="normal"
            sx={{
              minWidth: 300,
            }}
          >
            <InputLabel htmlFor="input-title">Title</InputLabel>
            <OutlinedInput
              autoCapitalize="on"
              autoCorrect="on"
              fullWidth
              id="input-title"
              inputProps={{ maxLength: 30 }}
              label={'Title'}
              name="input-title"
              onChange={handleSetTitle}
              placeholder={'Title'}
              type="text"
              value={title || ''}
            />
            <span
              style={{
                fontSize: '0.75em',
                height: '2px',
                margin: '6px 6px 0',
              }}
            >
              {title.length ? `${30 - title.length} characters remaining.` : ''}
            </span>
          </FormControl>

          {/** Message */}
          <FormControl
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            margin="normal"
            sx={{
              minWidth: 300,
            }}
          >
            <InputLabel
              htmlFor="input-title"
              required
            >
              Message
            </InputLabel>
            <OutlinedInput
              autoCapitalize="on"
              autoCorrect="on"
              fullWidth
              id="input-message"
              inputProps={{ maxLength: 255 }}
              label={'Message'}
              multiline
              name="input-message"
              onChange={handleSetMessage}
              placeholder={'Message'}
              rows={4}
              // maxRows={4}
              type="text"
              value={message || ''}
            />
            <span
              style={{
                fontSize: '0.75em',
                margin: '6px',
              }}
            >
              {`${255 - message.length} characters remaining.`}
            </span>
          </FormControl>

          {/** Level */}
          <FormControl
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            margin="normal"
            variant="outlined"
          >
            <InputLabel htmlFor="level-select">Type</InputLabel>
            <Select
              id="level-select"
              label="Type"
              name="level-select"
              notched
              onChange={handleChangeLevel}
              value={level || ''}
            >
              {Object.values(NOTIFICATION_LEVELS).map((labelValue) => {
                return (
                  <MenuItem
                    key={labelValue}
                    value={labelValue}
                  >
                    {labelValue}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>

          {/** Send Push Notification */}
          <FormControlLabel
            control={
              <Checkbox
                checked={sendToMobile}
                onChange={() => setSendToMobile(!sendToMobile)}
                size="large"
              />
            }
            label="Send Push Notification To Phone"
          />
        </SendNotificationForm>
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
        {props.user ? `Send to: ${props.user.username}` : 'Send to all users'}
      </DialogTitle>
      {!allSucceeded && !showLottieError && renderFormContent()}
      {showLottieError && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windwoHeight}
        >
          <DialogError
            message={errorMessage}
            windowHeight={windwoHeight}
          />
        </CustomDialogContent>
      )}
      {allSucceeded && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windwoHeight}
        >
          <SuccessLottie complete={() => setTimeout(() => handleClose(), 500)} />
        </CustomDialogContent>
      )}
      {!allSucceeded && (
        <DialogActions
          style={{
            justifyContent: isMobileWidth ? 'center' : 'flex-end',
          }}
        >
          <Button
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? 'Close' : 'Cancel'}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleSend}
              variant="contained"
            >
              {isLoadingSendToAll || isLoadingSendToUser ? (
                <BeatLoader
                  color={themeColors.secondary}
                  margin="2px"
                  size={16}
                />
              ) : (
                'Send'
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
