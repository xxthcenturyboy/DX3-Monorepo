import { Button, Grid, Slider, useMediaQuery, useTheme } from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import type { AxiosProgressEvent } from 'axios'
import React, { type ReactElement } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { BeatLoader } from 'react-spinners'

import type { MediaDataType } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'
import { APP_COLOR_PALETTE, themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { useUploadAvatarMutation } from '../../media/media-web.api'
import type { MediaWebAvatarUploadParamsType } from '../../media/media-web.types'
import { UploadProgressComponent } from '../../media/media-web-upload-progress.component'
import { useAppDispatch, useAppSelector } from '../../store/store-web.redux'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'

type UserProfileWebAvatarPropTypes = {
  avatarDataCallback: (data: Partial<MediaDataType>) => void
}

export const UserProfileWebAvatarDialog: React.FC<UserProfileWebAvatarPropTypes> = (
  props,
): ReactElement => {
  const [allSucceeded, setAllSucceeded] = React.useState(false)
  const [showLottieError, setShowLottieError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [imageSource, setImageSource] = React.useState<File | string>('')
  const [scale, setScale] = React.useState(1.2)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [processStarted, setProcessStarted] = React.useState(false)
  const [imageMeta, setImageMeta] = React.useState<{
    name: string
    type: string
  } | null>(null)
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const windowHeight = useAppSelector((state) => selectWindowHeight(state))
  const avatarEditorRef = React.useRef<null | AvatarEditor>(null)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const [
    uplodAvatar,
    {
      data: uploadAvatarResponse,
      error: uploadAvatarError,
      isLoading: isUploadingdAvatar,
      isSuccess: uploadAvatarSuccess,
      isUninitialized: uploadAvatarUninitialized,
    },
  ] = useUploadAvatarMutation()

  React.useEffect(() => {
    if (!isUploadingdAvatar && !uploadAvatarUninitialized) {
      if (!uploadAvatarError) {
        setShowLottieError(false)
        setAllSucceeded(true)
      } else {
        if ('error' in uploadAvatarError) {
          setErrorMessage(uploadAvatarError.error)
        }
        setShowLottieError(true)
      }
    }
  }, [isUploadingdAvatar, uploadAvatarError, uploadAvatarUninitialized])

  React.useEffect(() => {
    const avatarData = Array.isArray(uploadAvatarResponse) ? uploadAvatarResponse[0] : null
    if (
      uploadAvatarSuccess &&
      props.avatarDataCallback &&
      typeof props.avatarDataCallback === 'function' &&
      avatarData &&
      avatarData.ok &&
      avatarData.data
    ) {
      props.avatarDataCallback(avatarData.data)
    }
  }, [uploadAvatarSuccess, uploadAvatarResponse])

  const handleClose = (): void => {
    dispatch(uiActions.appDialogSet(null))
  }

  const submitDisabled = (): boolean => {
    return !imageSource || isUploadingdAvatar || processStarted
  }

  const uploadProgressHandler = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.lengthComputable && progressEvent.total) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setUploadProgress(percentCompleted)
    }
  }

  const handleCreate = async (): Promise<void> => {
    if (!submitDisabled()) {
      if (avatarEditorRef.current) {
        setProcessStarted(true)
        const canvas = avatarEditorRef.current.getImage()
        if (canvas) {
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              try {
                const payload: MediaWebAvatarUploadParamsType = {
                  file: blob,
                  fileName: imageMeta?.name || 'no-name-profile-image',
                  uploadProgressHandler,
                }
                void uplodAvatar(payload)
                setProcessStarted(false)
              } catch (err) {
                logger.error((err as Error).message, err)
                setUploadProgress(0)
                setProcessStarted(false)
              }
            }
          })
        }
      }
    }
  }

  const renderFormContent = (): React.ReactElement => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={SM_BREAK ? 'flex-start' : 'space-around'}
        maxWidth={SM_BREAK ? undefined : '100%'}
        windowHeight={windowHeight}
      >
        <Grid
          alignItems={'center'}
          container
          display={'flex'}
          flexDirection={'column'}
          flexWrap={'nowrap'}
        >
          <Grid
            display={'flex'}
            justifyContent={'center'}
            size={12}
          >
            <AvatarEditor
              border={SM_BREAK ? 30 : 50}
              borderRadius={200}
              height={SM_BREAK ? 290 : 390}
              image={imageSource}
              ref={(ref) => {
                avatarEditorRef.current = ref
              }}
              scale={scale}
              style={{
                background: APP_COLOR_PALETTE.PRIMARY[900],
                borderRadius: '20px',
              }}
              width={SM_BREAK ? 290 : 390}
            />
          </Grid>

          <Grid
            display={'flex'}
            justifyContent={'center'}
            mt={2}
            size={12}
            width={SM_BREAK ? '100%' : '400px'}
          >
            <Slider
              color="secondary"
              disabled={!imageSource || isUploadingdAvatar || processStarted}
              max={2}
              min={1}
              onChange={(_event, value) => setScale(value as number)}
              step={0.1}
              value={scale}
            />
          </Grid>

          <Grid
            display={'flex'}
            justifyContent={'center'}
            mb={2}
            mt={2}
            size={12}
            width={'100%'}
          >
            <Button
              component="label"
              disabled={isUploadingdAvatar || processStarted}
              fullWidth={SM_BREAK}
              variant="contained"
            >
              Choose Image
              <input
                accept=".jpg, .jpeg, .png"
                hidden
                id="profile_pic"
                name="profile_pic"
                onChange={(event) => {
                  const files = event.target.files
                  if (files) {
                    setImageMeta({
                      name: files[0].name,
                      type: files[0].type,
                    })
                    setImageSource(URL.createObjectURL(files[0]))
                  }
                }}
                type="file"
              />
            </Button>
          </Grid>
        </Grid>

        <Grid
          alignItems={'center'}
          container
          display={'flex'}
          flexDirection={'column'}
          flexWrap={'nowrap'}
        >
          <Grid
            minHeight={'24px'}
            size={12}
            width={'100%'}
          >
            {isUploadingdAvatar && (
              <UploadProgressComponent
                color="secondary"
                value={uploadProgress}
              />
            )}
          </Grid>
        </Grid>
      </CustomDialogContent>
    )
  }

  return (
    <DialogWrapper>
      <DialogTitle
        style={{
          textAlign: 'center',
        }}
      >
        {`Avatar `}
      </DialogTitle>
      {!allSucceeded && !showLottieError && renderFormContent()}
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
            disabled={isUploadingdAvatar}
            onClick={handleClose}
            variant="outlined"
          >
            {showLottieError ? 'Close' : 'Cancel'}
          </Button>
          {!showLottieError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleCreate}
              variant="contained"
            >
              {isUploadingdAvatar ? (
                <BeatLoader
                  color={themeColors.secondary}
                  margin="2px"
                  size={16}
                />
              ) : (
                'Update'
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}
