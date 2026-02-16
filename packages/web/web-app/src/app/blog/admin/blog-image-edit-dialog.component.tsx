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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
    'IMAGE_ALIGN_CENTER',
    'IMAGE_ALIGN_LEFT',
    'IMAGE_ALIGN_RIGHT',
    'IMAGE_EDIT_ALT',
    'IMAGE_EDIT_ALIGNMENT',
    'IMAGE_EDIT_DIALOG_TITLE',
    'IMAGE_EDIT_TITLE',
    'IMAGE_EDIT_USE_TOOLBAR',
    'SAVE',
  ])

  const [alignment, setAlignment] = React.useState<'left' | 'center' | 'right'>('left')
  const [altText, setAltText] = React.useState('')
  const [title, setTitle] = React.useState('')

  /** Parse title for alignment prefix: "align:center|rest" or "align:right|rest" */
  const parseTitleForAlignment = React.useCallback((raw: string) => {
    const alignMatch = raw?.match(/^align:(center|right)\|(.*)$/s)
    if (alignMatch) {
      return {
        alignment: alignMatch[1] as 'center' | 'right',
        title: alignMatch[2] ?? '',
      }
    }
    return { alignment: 'left' as const, title: raw ?? '' }
  }, [])

  React.useEffect(() => {
    if (state.type === 'editing') {
      setAltText(state.initialValues.altText ?? '')
      const { alignment: a, title: t } = parseTitleForAlignment(
        state.initialValues.title ?? '',
      )
      setAlignment(a)
      setTitle(t)
    }
  }, [parseTitleForAlignment, state])

  const handleClose = React.useCallback(() => {
    closeImageDialog()
    setAltText('')
    setTitle('')
  }, [closeImageDialog])

  const handleSave = React.useCallback(() => {
    if (state.type === 'editing') {
      const titleWithAlign =
        alignment === 'left' ? title : `align:${alignment}|${title}`
      saveImage({
        altText,
        src: state.initialValues.src ?? '',
        title: titleWithAlign,
      })
      handleClose()
    }
  }, [altText, alignment, handleClose, saveImage, state, title])

  const { alignment: initialAlign, title: initialTitle } =
    state.type === 'editing'
      ? (() => {
          const parsed = (state.initialValues.title ?? '').match(
            /^align:(center|right)\|(.*)$/s,
          )
          return {
            alignment: (parsed?.[1] as 'center' | 'right') ?? 'left',
            title: parsed?.[2] ?? state.initialValues.title ?? '',
          }
        })()
      : { alignment: 'left' as const, title: '' }
  const isDirty =
    state.type === 'editing' &&
    ((altText ?? '') !== (state.initialValues.altText ?? '') ||
      title !== initialTitle ||
      alignment !== initialAlign)

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
          <FormControl fullWidth size="small">
            <InputLabel id="blog-image-align-label">
              {strings.IMAGE_EDIT_ALIGNMENT}
            </InputLabel>
            <Select
              id="blog-image-align"
              label={strings.IMAGE_EDIT_ALIGNMENT}
              labelId="blog-image-align-label"
              onChange={(e) =>
                setAlignment(e.target.value as 'left' | 'center' | 'right')
              }
              value={alignment}
            >
              <MenuItem value="left">{strings.IMAGE_ALIGN_LEFT}</MenuItem>
              <MenuItem value="center">{strings.IMAGE_ALIGN_CENTER}</MenuItem>
              <MenuItem value="right">{strings.IMAGE_ALIGN_RIGHT}</MenuItem>
            </Select>
          </FormControl>
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
