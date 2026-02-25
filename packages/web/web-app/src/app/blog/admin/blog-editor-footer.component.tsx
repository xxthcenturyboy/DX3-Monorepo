import { Box, Button } from '@mui/material'
import type { FC } from 'react'
import { BeatLoader } from 'react-spinners'

import { useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { selectBlogEditorIsDirty, selectBlogEditorTitle } from './blog-admin-web.selectors'

export type BlogEditorFooterPropsType = {
  isNew?: boolean
  isReadOnly?: boolean
  isSaving?: boolean
  onCancel: () => void
  onSave: () => void
}

/**
 * Footer with Save/Cancel buttons. Subscribes to full isDirty (body + settings)
 * so that the main Editor can stay body-only. Keeps settings-driven re-renders
 * confined to this small component.
 */
export const BlogEditorFooterComponent: FC<BlogEditorFooterPropsType> = ({
  isNew = false,
  isReadOnly = false,
  isSaving = false,
  onCancel,
  onSave,
}) => {
  const isDirty = useAppSelector(selectBlogEditorIsDirty)
  const title = useAppSelector(selectBlogEditorTitle)
  const strings = useStrings(['CANCEL', 'CANCELING', 'CLOSE', 'CREATE', 'SAVE'])

  return (
    <Box
      display={'flex'}
      gap={'16px'}
      justifyContent={'flex-end'}
      marginTop={'24px'}
    >
      <Button
        disabled={isSaving || !isDirty || !title.trim() || !!isReadOnly}
        onClick={onSave}
        variant="contained"
      >
        {isSaving ? (
          <BeatLoader
            color="inherit"
            margin="2px"
            size={12}
          />
        ) : isNew ? (
          strings.CREATE
        ) : (
          strings.SAVE
        )}
      </Button>
      <Button
        disabled={isSaving}
        onClick={onCancel}
        title={isSaving ? strings.CANCELING : undefined}
        variant="outlined"
      >
        {isDirty ? strings.CANCEL : strings.CLOSE}
      </Button>
    </Box>
  )
}
