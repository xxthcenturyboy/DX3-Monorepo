import { createSelector } from 'reselect'

import type { RootState } from '../../store/store-web.redux'
import type { BlogEditorStateType } from './blog-admin-web.types'

const getBlogEditorState = (state: RootState): BlogEditorStateType => state.blogEditor

export const selectBlogEditorContent = createSelector(
  [getBlogEditorState],
  (s) => s.content,
)

export const selectBlogEditorFilterValue = createSelector(
  [getBlogEditorState],
  (s) => s.filterValue,
)

export const selectBlogEditorIsDirty = createSelector(
  [getBlogEditorState],
  (s) => s.title !== s.initialTitle || s.content !== s.initialContent,
)

export const selectBlogEditorLimit = createSelector([getBlogEditorState], (s) => s.limit)

export const selectBlogEditorOffset = createSelector([getBlogEditorState], (s) => s.offset)

export const selectBlogEditorOrderBy = createSelector([getBlogEditorState], (s) => s.orderBy)

export const selectBlogEditorSortDir = createSelector([getBlogEditorState], (s) => s.sortDir)

export const selectBlogEditorStatus = createSelector([getBlogEditorState], (s) => s.status)

export const selectBlogEditorTitle = createSelector([getBlogEditorState], (s) => s.title)

/**
 * Selector for RTK Query params - use with useGetBlogAdminPostsQuery
 */
export const selectBlogEditorQueryParams = createSelector(
  [
    selectBlogEditorFilterValue,
    selectBlogEditorLimit,
    selectBlogEditorOffset,
    selectBlogEditorOrderBy,
    selectBlogEditorSortDir,
    selectBlogEditorStatus,
  ],
  (filterValue, limit, offset, orderBy, sortDir, status) => ({
    filterValue: filterValue || undefined,
    limit,
    offset,
    orderBy,
    sortDir,
    status: status || undefined,
  }),
)
