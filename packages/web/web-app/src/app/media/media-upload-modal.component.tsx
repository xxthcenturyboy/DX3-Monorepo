import { Box, Button, Divider, TextField, Typography } from '@mui/material'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'

import { MEDIA_MAX_FILE_SIZE_BYTES, MEDIA_MAX_FILES_PER_UPLOAD } from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { ErrorLottie } from '@dx3/web-libs/ui/lottie/error.lottie'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { useStrings, useTranslation } from '../i18n'
import type { MediaUploadModalPropsType } from './media-upload-modal.types'
import { UploadProgressComponent } from './media-web-upload-progress.component'

const DEFAULT_MAX_FILES = MEDIA_MAX_FILES_PER_UPLOAD

export const MediaUploadModal: React.FC<MediaUploadModalPropsType> = (props) => {
  const {
    closeDialog,
    config,
    isMobileWidth = false,
    onSuccess,
    onUpload,
    onUrlInsert,
    windowHeight = 400,
  } = props
  const t = useTranslation()
  const strings = useStrings([
    'CANCEL',
    'CLOSE',
    'MEDIA_IMAGE_URL_PLACEHOLDER',
    'MEDIA_INSERT_FROM_URL',
    'MEDIA_UPLOAD_CLICK_TO_SELECT',
    'MEDIA_UPLOAD_FAILED',
    'UPLOAD',
  ])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [urlInput, setUrlInput] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const maxFiles = config.maxFiles ?? DEFAULT_MAX_FILES
  const allowUrlInput = config.allowUrlInput ?? false
  const allowedMimeTypes = config.allowedMimeTypes
  const mediaTypeKey = config.mediaTypeKey ?? 'MEDIA_TYPE_FILES'
  const headerTitle = t('MEDIA_UPLOAD_HEADER', {
    mediaType: t(mediaTypeKey),
  })
  const enableDragAndDrop = !isMobileWidth
  const isImageOnly =
    isMobileWidth &&
    allowedMimeTypes.length > 0 &&
    allowedMimeTypes.every((m) => m.startsWith('image/'))

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      if (files.length > maxFiles) {
        return t('MEDIA_UPLOAD_MAX_FILES', { maxFiles: String(maxFiles) })
      }
      for (const file of files) {
        if (file.size > MEDIA_MAX_FILE_SIZE_BYTES) {
          return t('MEDIA_UPLOAD_FILE_EXCEEDS_SIZE', {
            fileName: file.name,
          })
        }
        const typeAllowed =
          isImageOnly && file.type.startsWith('image/')
            ? true
            : allowedMimeTypes.includes(file.type)
        if (!typeAllowed) {
          return t('MEDIA_UPLOAD_UNSUPPORTED_TYPE', {
            allowedTypes: allowedMimeTypes.join(', '),
            fileName: file.name,
          })
        }
      }
      return null
    },
    [allowedMimeTypes, isImageOnly, maxFiles, t],
  )

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return
    const files = selectedFiles

    const err = validateFiles(files)
    if (err) {
      setValidationError(err)
      return
    }

    setValidationError('')
    setUploadState('uploading')
    setUploadProgress(0)

    try {
      const results = await onUpload({
        files,
        public: config.public,
      })
      const allOk = results.every((r) => r.ok)
      if (allOk) {
        setUploadState('success')
        onSuccess(results)
        await sleep(800)
        closeDialog()
      } else {
        const msg = results.find((r) => !r.ok)?.msg ?? strings.MEDIA_UPLOAD_FAILED
        setErrorMessage(msg)
        setUploadState('error')
      }
    } catch (err) {
      setErrorMessage((err as Error).message ?? strings.MEDIA_UPLOAD_FAILED)
      setUploadState('error')
    }
  }, [config.public, closeDialog, onSuccess, onUpload, selectedFiles, strings.MEDIA_UPLOAD_FAILED, validateFiles])

  const handleClose = useCallback(() => {
    closeDialog()
    sleep(300).then(() => {
      setUploadState('idle')
      setErrorMessage('')
      setUrlInput('')
      setSelectedFiles([])
      setValidationError('')
      setUploadProgress(0)
    })
  }, [closeDialog])

  const handleInsertFromUrl = useCallback(() => {
    const trimmed = urlInput.trim()
    if (!trimmed || !onUrlInsert) return
    try {
      new URL(trimmed)
    } catch {
      setValidationError('Invalid URL')
      return
    }
    setValidationError('')
    onUrlInsert(trimmed)
    setUrlInput('')
    closeDialog()
  }, [closeDialog, onUrlInsert, urlInput])

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      const files = Array.from(fileList).slice(0, maxFiles)
      const err = validateFiles(files)
      if (err) {
        setValidationError(err)
        setSelectedFiles([])
        return
      }
      setValidationError('')
      setSelectedFiles(files)
    },
    [maxFiles, validateFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragActive(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles],
  )

  const renderContent = (): React.ReactNode => {
    if (uploadState === 'success') {
      return (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          justifyContent="center"
          windowHeight={windowHeight}
        >
          <SuccessLottie complete={() => {}} />
        </CustomDialogContent>
      )
    }

    if (uploadState === 'error') {
      return (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          justifyContent="center"
          windowHeight={windowHeight}
        >
          <ErrorLottie complete={() => {}} />
          <Typography
            color="error"
            sx={{ mt: 2, textAlign: 'center' }}
            variant="body1"
          >
            {errorMessage}
          </Typography>
          <Button
            onClick={handleClose}
            sx={{ mt: 2 }}
            variant="outlined"
          >
            {strings.CLOSE}
          </Button>
        </CustomDialogContent>
      )
    }

    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent="flex-start"
        maxWidth="500px"
        windowHeight={windowHeight}
      >
        <Typography
          component="h2"
          sx={{ mb: 2 }}
          variant="h6"
        >
          {headerTitle}
        </Typography>
        {allowUrlInput && onUrlInsert && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <TextField
              fullWidth
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={strings.MEDIA_IMAGE_URL_PLACEHOLDER}
              size="small"
              value={urlInput}
              variant="outlined"
            />
            <Button
              disabled={!urlInput.trim()}
              onClick={handleInsertFromUrl}
              size="small"
              sx={{ mt: 1 }}
              variant="outlined"
            >
              {strings.MEDIA_INSERT_FROM_URL}
            </Button>
            <Divider sx={{ my: 2 }}>— or —</Divider>
          </Box>
        )}
        <Box
          onClick={() => inputRef.current?.click()}
          {...(enableDragAndDrop && {
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
          })}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
            p: 4,
            textAlign: 'center',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            accept={
              isImageOnly ? 'image/*' : allowedMimeTypes.join(',')
            }
            multiple={maxFiles > 1}
            onChange={handleInputChange}
            ref={inputRef}
            style={{ display: 'none' }}
            type="file"
          />
          <Typography
            color="text.secondary"
            variant="body1"
          >
            {enableDragAndDrop
              ? isDragActive
                ? t('MEDIA_UPLOAD_DROP_HERE')
                : t('MEDIA_UPLOAD_DRAG_OR_CLICK')
              : strings.MEDIA_UPLOAD_CLICK_TO_SELECT}
          </Typography>
          <Typography
            color="text.disabled"
            sx={{ mt: 1 }}
            variant="caption"
          >
            {t('MEDIA_UPLOAD_UP_TO_FILES', {
              allowedTypes: allowedMimeTypes.join(', '),
              maxFiles: String(maxFiles),
            })}
          </Typography>
        </Box>

        {validationError && (
          <Typography
            color="error"
            sx={{ mt: 2 }}
            variant="body2"
          >
            {validationError}
          </Typography>
        )}

        {uploadState === 'uploading' && (
          <Box sx={{ mt: 2, width: '100%' }}>
            <UploadProgressComponent
              color="secondary"
              value={uploadProgress}
            />
          </Box>
        )}

        {selectedFiles.length > 0 && uploadState === 'idle' && (
          <Typography
            sx={{ mt: 2 }}
            variant="body2"
          >
            {t('MEDIA_UPLOAD_FILES_SELECTED', {
              count: String(selectedFiles.length),
            })}
          </Typography>
        )}
      </CustomDialogContent>
    )
  }

  return (
    <Box
      component="div"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {renderContent()}
      {uploadState === 'idle' && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            mt: 2,
            width: '100%',
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
          >
            {strings.CANCEL}
          </Button>
          <Button
            disabled={selectedFiles.length === 0}
            onClick={handleUpload}
            variant="contained"
          >
            {strings.UPLOAD}
          </Button>
        </Box>
      )}
    </Box>
  )
}
