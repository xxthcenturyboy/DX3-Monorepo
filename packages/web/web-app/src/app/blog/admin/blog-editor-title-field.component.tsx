import { TextField } from '@mui/material'
import type { FC } from 'react'

import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { blogEditorBodyActions } from './blog-admin-web-body.reducer'
import { selectBlogEditorTitle } from './blog-admin-web.selectors'

export type BlogEditorTitleFieldPropsType = {
  disabled?: boolean
}

/**
 * Isolated title field that subscribes to Redux. Prevents title changes from
 * re-rendering the parent editor (including the heavy MDXEditor).
 */
export const BlogEditorTitleFieldComponent: FC<BlogEditorTitleFieldPropsType> = ({
  disabled = false,
}) => {
  const dispatch = useAppDispatch()
  const title = useAppSelector(selectBlogEditorTitle)
  const strings = useStrings(['TITLE'])

  return (
    <TextField
      disabled={disabled}
      fullWidth
      label={strings.TITLE}
      margin="normal"
      onChange={(e) => dispatch(blogEditorBodyActions.titleSet(e.target.value))}
      required
      value={title}
      variant="outlined"
    />
  )
}
