import {
  cancelLinkEdit$,
  linkDialogState$,
  onWindowChange$,
  removeLink$,
  rootEditor$,
  showLinkTitleField$,
  switchFromPreviewToLinkEdit$,
  updateLink$,
} from '@mdxeditor/editor'
import { useCellValues, usePublisher } from '@mdxeditor/gurx'
import Close from '@mui/icons-material/Close'
import ContentCopy from '@mui/icons-material/ContentCopy'
import LinkOff from '@mui/icons-material/LinkOff'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Popper,
  TextField,
  Tooltip,
} from '@mui/material'
import * as React from 'react'

import { useStrings } from '../../i18n'

/**
 * Custom link edit popover for the blog editor.
 * Uses i18n strings and MUI components for URL, anchor text, link title.
 */
export const BlogLinkEditDialog: React.FC = () => {
  const [linkDialogState, rootEditor, showLinkTitleField] = useCellValues(
    linkDialogState$,
    rootEditor$,
    showLinkTitleField$,
  )
  const publishWindowChange = usePublisher(onWindowChange$)
  const updateLink = usePublisher(updateLink$)
  const cancelLinkEdit = usePublisher(cancelLinkEdit$)
  const switchFromPreviewToLinkEdit = usePublisher(switchFromPreviewToLinkEdit$)
  const removeLink = usePublisher(removeLink$)

  const strings = useStrings([
    'CANCEL',
    'CLOSE',
    'LINK_EDIT_ANCHOR_TEXT',
    'LINK_EDIT_ANCHOR_TEXT_PLACEHOLDER',
    'LINK_EDIT_COPIED',
    'LINK_EDIT_COPY_TO_CLIPBOARD',
    'LINK_EDIT_REMOVE_LINK',
    'LINK_EDIT_TITLE',
    'LINK_EDIT_TITLE_PLACEHOLDER',
    'LINK_EDIT_URL',
    'LINK_EDIT_URL_PLACEHOLDER',
    'SAVE',
  ])

  const [closed, setClosed] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [text, setText] = React.useState('')
  const [copyTooltipOpen, setCopyTooltipOpen] = React.useState(false)
  const hasSwitchedRef = React.useRef(false)
  const initialValuesRef = React.useRef({ text: '', title: '', url: '' })
  const linkDialogStateRef = React.useRef(linkDialogState)
  const rectRef = React.useRef({ height: 0, left: 0, top: 0, width: 0 })

  linkDialogStateRef.current = linkDialogState
  rectRef.current = linkDialogState.rectangle ?? rectRef.current

  React.useEffect(() => {
    const update = (): void => {
      publishWindowChange(true)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [publishWindowChange])

  React.useEffect(() => {
    if (linkDialogState.type === 'inactive') {
      hasSwitchedRef.current = false
      setClosed(false)
      return
    }
    if (linkDialogState.type === 'preview' && !hasSwitchedRef.current) {
      hasSwitchedRef.current = true
      switchFromPreviewToLinkEdit()
    }
  }, [linkDialogState.type, switchFromPreviewToLinkEdit])

  React.useEffect(() => {
    if (linkDialogState.type === 'edit' || linkDialogState.type === 'preview') {
      const u = (linkDialogState as { url?: string }).url ?? ''
      const t = (linkDialogState as { title?: string }).title ?? ''
      const txt = (linkDialogState as { text?: string }).text ?? ''
      initialValuesRef.current = { text: txt, title: t, url: u }
      setUrl(u)
      setTitle(t)
      setText(txt)
    }
  }, [linkDialogState])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      if (linkDialogState.type === 'edit') {
        cancelLinkEdit()
      } else if (rootEditor) {
        rootEditor.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cancelLinkEdit, linkDialogState.type, rootEditor])

  const handleClose = React.useCallback(() => {
    setClosed(true)
    if (rootEditor) {
      rootEditor.focus()
    }
    const state = linkDialogStateRef.current
    if (state.type === 'edit') {
      cancelLinkEdit()
    }
  }, [cancelLinkEdit, rootEditor])

  const handleCancel = React.useCallback(() => {
    handleClose()
  }, [handleClose])

  const handleSave = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      updateLink({ text: text.trim() || undefined, title: title.trim() || undefined, url: url.trim() || undefined })
    },
    [text, title, updateLink, url],
  )

  const handleCopyUrl = React.useCallback(() => {
    const urlToCopy =
      linkDialogState.type === 'edit'
        ? url
        : (linkDialogState as { url?: string }).url
    if (urlToCopy) {
      window.navigator.clipboard
        .writeText(urlToCopy)
        .then(() => {
          setCopyTooltipOpen(true)
          setTimeout(() => setCopyTooltipOpen(false), 1000)
        })
    }
  }, [linkDialogState, url])

  const isDirty =
    (url ?? '').trim() !== (initialValuesRef.current.url ?? '').trim() ||
    (title ?? '').trim() !== (initialValuesRef.current.title ?? '').trim() ||
    (text ?? '').trim() !== (initialValuesRef.current.text ?? '').trim()

  const virtualAnchor = React.useMemo(
    () => ({
      getBoundingClientRect: () => {
        const r = rectRef.current
        return new DOMRect(r.left, r.top, r.width, r.height)
      },
    }),
    [],
  )

  if (linkDialogState.type === 'inactive' || closed) return null

  return (
    <Popper
      anchorEl={virtualAnchor}
      key={linkDialogState.linkNodeKey}
      open
      placement="bottom-start"
      sx={{ zIndex: 1400 }}
    >
      <Paper elevation={8} sx={{ minWidth: 280, p: 2 }}>
        <Box
          component="form"
          onSubmit={handleSave}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
            <Tooltip title={strings.CLOSE}>
              <IconButton
                aria-label={strings.CLOSE}
                onClick={handleClose}
                size="small"
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip
              open={copyTooltipOpen}
              title={
                copyTooltipOpen
                  ? strings.LINK_EDIT_COPIED
                  : strings.LINK_EDIT_COPY_TO_CLIPBOARD
              }
            >
              <IconButton
                aria-label={strings.LINK_EDIT_COPY_TO_CLIPBOARD}
                onClick={handleCopyUrl}
                size="small"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={strings.LINK_EDIT_REMOVE_LINK}>
              <IconButton
                aria-label={strings.LINK_EDIT_REMOVE_LINK}
                onClick={() => removeLink()}
                size="small"
              >
                <LinkOff fontSize="small" />
              </IconButton>
            </Tooltip>
            </Box>
          </Box>
          <TextField
            fullWidth
            label={strings.LINK_EDIT_URL}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={strings.LINK_EDIT_URL_PLACEHOLDER}
            size="small"
            value={url ?? ''}
            variant="outlined"
          />
          <TextField
            fullWidth
            helperText={strings.LINK_EDIT_ANCHOR_TEXT_PLACEHOLDER}
            label={strings.LINK_EDIT_ANCHOR_TEXT}
            onChange={(e) => setText(e.target.value)}
            size="small"
            value={text ?? ''}
            variant="outlined"
          />
          {showLinkTitleField && (
            <TextField
              fullWidth
              helperText={strings.LINK_EDIT_TITLE_PLACEHOLDER}
              label={strings.LINK_EDIT_TITLE}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              value={title ?? ''}
              variant="outlined"
            />
          )}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button
              disabled={!isDirty}
              onClick={handleCancel}
              size="small"
              variant="outlined"
            >
              {strings.CANCEL}
            </Button>
            <Button
              disabled={!isDirty}
              size="small"
              type="submit"
              variant="contained"
            >
              {strings.SAVE}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Popper>
  )
}
