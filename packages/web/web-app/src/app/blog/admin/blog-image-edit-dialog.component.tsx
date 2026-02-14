import {
  closeImageDialog$,
  imageDialogState$,
  saveImage$,
} from '@mdxeditor/editor'
import { useCellValues, usePublisher } from '@mdxeditor/gurx'
import Close from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material'
import * as React from 'react'

import { useStrings } from '../../i18n'

/**
 * Custom image edit dialog for the blog editor.
 * Only Alt and Title fields - no upload/URL. Users add images via the toolbar.
 */
export const BlogImageEditDialog: React.FC = () => {
  const [state] = useCellValues(imageDialogState$)
  const saveImage = usePublisher(saveImage$)
  const closeImageDialog = usePublisher(closeImageDialog$)

  const strings = useStrings([
    'CANCEL',
    'CLOSE',
    'IMAGE_EDIT_ALT',
    'IMAGE_EDIT_DIALOG_TITLE',
    'IMAGE_EDIT_TITLE',
    'IMAGE_EDIT_USE_TOOLBAR',
    'SAVE',
  ])

  const [altText, setAltText] = React.useState('')
  const [title, setTitle] = React.useState('')

  React.useEffect(() => {
    if (state.type === 'editing') {
      setAltText(state.initialValues.altText ?? '')
      setTitle(state.initialValues.title ?? '')
    }
  }, [state])

  const handleClose = React.useCallback(() => {
    closeImageDialog()
    setAltText('')
    setTitle('')
  }, [closeImageDialog])

  const handleSave = React.useCallback(() => {
    if (state.type === 'editing') {
      saveImage({
        altText,
        src: state.initialValues.src ?? '',
        title,
      })
      handleClose()
    }
  }, [altText, handleClose, saveImage, state, title])

  const isDirty =
    state.type === 'editing' &&
    ((altText ?? '') !== (state.initialValues.altText ?? '') ||
      (title ?? '') !== (state.initialValues.title ?? ''))

  if (state.type === 'inactive') return null

  if (state.type === 'new') {
    return (
      <Dialog
        onClose={handleClose}
        open
      >
        <DialogTitle
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {strings.IMAGE_EDIT_DIALOG_TITLE}
          <Tooltip title={strings.CLOSE}>
            <IconButton
              aria-label={strings.CLOSE}
              onClick={handleClose}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>{strings.IMAGE_EDIT_USE_TOOLBAR}</Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
          >
            {strings.CANCEL}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog
      onClose={handleClose}
      open
    >
      <DialogTitle
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {strings.IMAGE_EDIT_DIALOG_TITLE}
        <Tooltip title={strings.CLOSE}>
          <IconButton
            aria-label={strings.CLOSE}
            onClick={handleClose}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, pt: 1 }}
        >
          <TextField
            fullWidth
            label={strings.IMAGE_EDIT_ALT}
            onChange={(e) => setAltText(e.target.value)}
            size="small"
            value={altText}
            variant="outlined"
          />
          <TextField
            fullWidth
            label={strings.IMAGE_EDIT_TITLE}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            value={title}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!isDirty}
          onClick={handleClose}
          variant="outlined"
        >
          {strings.CANCEL}
        </Button>
        <Button
          disabled={!isDirty}
          onClick={handleSave}
          variant="contained"
        >
          {strings.SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
