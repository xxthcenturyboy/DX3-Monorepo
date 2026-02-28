import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import React, { type ReactElement } from 'react'
import { BeatLoader } from 'react-spinners'

import {
  NOTIFICATION_LEVELS,
  type NotificationCreationParamTypes,
  type UserType,
} from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useI18n, useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../ui/store/ui-web.selector'
import {
  useSendNotificationToAllMutation,
  useSendNotificationToUserMutation,
} from './notification-web.api'
import { SendNotificationForm } from './notification-web-dialog.ui'

type NotificationSendPropsType = {
  user?: UserType
  closeDialog: () => void
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
  const { t } = useI18n()
  const strings = useStrings([
    'CANCEL',
    'CLOSE',
    'MESSAGE',
    'SEND',
    'SEND_PUSH_TO_PHONE',
    'SEND_TO_ALL_USERS',
    'TITLE',
    'TYPE',
  ])
  const theme = useTheme()
  const [
    requestSendNotificationToAll,
    {
      data: _sendToAllResponse,
      error: sendToAllError,
      isLoading: isLoadingSendToAll,
      isSuccess: sendToAllSuccess,
      isUninitialized: sendToAllUninitialized,
    },
  ] = useSendNotificationToAllMutation()
  const [
    requestSendNotificationToUser,
    {
      data: _sendToUserResponse,
      error: sendToUserError,
      isLoading: isLoadingSendToUser,
      isSuccess: sendToUserSuccess,
      isUninitialized: sendToUserUninitialized,
    },
  ] = useSendNotificationToUserMutation()

  React.useEffect(() => {
    if (!isLoadingSendToUser && !sendToUserUninitialized) {
      if (sendToUserSuccess && !sendToUserError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        setErrorMessage(getErrorStringFromApiResponse(sendToUserError))
        setShowLottieError(true)
      }
    }
  }, [sendToUserSuccess, sendToUserError, sendToUserUninitialized, sendToUserSuccess])

  React.useEffect(() => {
    if (!isLoadingSendToAll && !sendToAllUninitialized) {
      if (sendToAllSuccess && !sendToAllError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        setErrorMessage(getErrorStringFromApiResponse(sendToAllError))
        setShowLottieError(true)
      }
    }
  }, [sendToAllSuccess, sendToAllError, sendToAllUninitialized])

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(() => {
      setAllSucceeded(false)
      setShowLottieError(false)
      setTitle('')
      setMessage('')
      setLevel(NOTIFICATION_LEVELS.INFO)
    })
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

  const renderFormContent = (): React.ReactElement => {
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
            <InputLabel htmlFor="input-title">{strings.TITLE}</InputLabel>
            <OutlinedInput
              autoCapitalize="on"
              autoCorrect="on"
              fullWidth
              id="input-title"
              inputProps={{ maxLength: 30 }}
              label={strings.TITLE}
              name="input-title"
              onChange={handleSetTitle}
              placeholder={strings.TITLE}
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
              {title.length > 0 ? t('CHARACTERS_REMAINING', { count: 30 - title.length }) : ''}
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
              {strings.MESSAGE}
            </InputLabel>
            <OutlinedInput
              autoCapitalize="on"
              autoCorrect="on"
              fullWidth
              id="input-message"
              inputProps={{ maxLength: 255 }}
              label={strings.MESSAGE}
              multiline
              name="input-message"
              onChange={handleSetMessage}
              placeholder={strings.MESSAGE}
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
              {t('CHARACTERS_REMAINING', { count: 255 - message.length })}
            </span>
          </FormControl>

          {/** Level */}
          <FormControl
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            margin="normal"
            variant="outlined"
          >
            <InputLabel htmlFor="level-select">{strings.TYPE}</InputLabel>
            <Select
              id="level-select"
              label={strings.TYPE}
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
            label={strings.SEND_PUSH_TO_PHONE}
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
        {props.user
          ? t('SEND_TO_USER', { username: props.user.username || '' })
          : strings.SEND_TO_ALL_USERS}
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
            disabled={isLoadingSendToAll || isLoadingSendToUser}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? strings.CLOSE : strings.CANCEL}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleSend}
              variant="contained"
            >
              {isLoadingSendToAll || isLoadingSendToUser ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="2px"
                  size={16}
                />
              ) : (
                strings.SEND
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
