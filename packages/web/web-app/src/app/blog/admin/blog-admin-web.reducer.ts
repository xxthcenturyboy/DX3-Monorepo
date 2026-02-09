import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { BlogPostStatusType } from '@dx3/models-shared'

import { BLOG_EDITOR_ENTITY_NAME } from './blog-admin-web.consts'
import type { BlogEditorStateType } from './blog-admin-web.types'

const BLOG_EDITOR_DEFAULT_LIMIT = 20
const BLOG_EDITOR_DEFAULT_OFFSET = 0

export const blogEditorInitialState: BlogEditorStateType = {
  filterValue: '',
  limit: BLOG_EDITOR_DEFAULT_LIMIT,
  offset: BLOG_EDITOR_DEFAULT_OFFSET,
  orderBy: 'createdAt',
  sortDir: 'DESC',
  status: '',
}

const blogEditorSlice = createSlice({
  initialState: blogEditorInitialState,
  name: BLOG_EDITOR_ENTITY_NAME,
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

export const blogEditorActions = blogEditorSlice.actions

export const blogEditorReducer = blogEditorSlice.reducer
