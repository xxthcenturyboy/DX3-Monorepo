import { createSelector } from 'reselect'

import type { RootState } from '../../store/store-web.redux'

const getBlogEditorBodyState = (state: RootState) => state.blogEditorBody
const getBlogEditorListState = (state: RootState) => state.blogEditorList
const getBlogEditorSettingsState = (state: RootState) => state.blogEditorSettings

export const selectBlogEditorBodyDirty = createSelector(
  [getBlogEditorBodyState],
  (body) => body.title !== body.initialTitle || body.content !== body.initialContent,
)

export const selectBlogEditorContent = createSelector([getBlogEditorBodyState], (s) => s.content)

export const selectBlogEditorFilterValue = createSelector(
  [getBlogEditorListState],
  (s) => s.filterValue,
)

export const selectBlogEditorIsDirty = createSelector(
  [getBlogEditorBodyState],
  (body) => body.title !== body.initialTitle || body.content !== body.initialContent,
)

export const selectBlogEditorLimit = createSelector([getBlogEditorListState], (s) => s.limit)

export const selectBlogEditorOffset = createSelector([getBlogEditorListState], (s) => s.offset)

export const selectBlogEditorOrderBy = createSelector([getBlogEditorListState], (s) => s.orderBy)

export const selectBlogEditorSortDir = createSelector([getBlogEditorListState], (s) => s.sortDir)

export const selectBlogEditorStatus = createSelector([getBlogEditorListState], (s) => s.status)

/** Plain selector - no createSelector needed when passing through the full slice */
export const selectBlogEditorSettings = getBlogEditorSettingsState

export const selectBlogEditorTitle = createSelector([getBlogEditorBodyState], (s) => s.title)

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
