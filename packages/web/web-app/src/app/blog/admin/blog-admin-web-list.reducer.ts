import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { BlogPostStatusType } from '@dx3/models-shared'

const BLOG_EDITOR_LIST_ENTITY_NAME = 'blogEditorList'
const BLOG_EDITOR_DEFAULT_LIMIT = 25
const BLOG_EDITOR_DEFAULT_OFFSET = 0

export type BlogEditorListStateType = {
  filterValue: string
  limit: number
  offset: number
  orderBy: string
  sortDir: 'ASC' | 'DESC'
  status: BlogPostStatusType | ''
}

export const blogEditorListInitialState: BlogEditorListStateType = {
  filterValue: '',
  limit: BLOG_EDITOR_DEFAULT_LIMIT,
  offset: BLOG_EDITOR_DEFAULT_OFFSET,
  orderBy: 'createdAt',
  sortDir: 'DESC',
  status: '',
}

const blogEditorListSlice = createSlice({
  initialState: blogEditorListInitialState,
  name: BLOG_EDITOR_LIST_ENTITY_NAME,
  reducers: {
    filterValueSet(state, action: PayloadAction<string>) {
      state.filterValue = action.payload
    },
    limitSet(state, action: PayloadAction<number>) {
      state.limit = action.payload
    },
    offsetSet(state, action: PayloadAction<number>) {
      state.offset = action.payload
    },
    orderBySet(state, action: PayloadAction<string>) {
      state.orderBy = action.payload
    },
    sortDirSet(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortDir = action.payload
    },
    statusSet(state, action: PayloadAction<BlogPostStatusType | ''>) {
      state.status = action.payload
    },
  },
})

export const blogEditorListActions = blogEditorListSlice.actions
export const blogEditorListReducer = blogEditorListSlice.reducer
