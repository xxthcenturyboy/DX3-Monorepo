import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { BlogPostStatusType } from '@dx3/models-shared'

import { BLOG_EDITOR_ENTITY_NAME } from './blog-admin-web.consts'
import type { BlogEditorSettingsType, BlogEditorStateType } from './blog-admin-web.types'

const BLOG_EDITOR_DEFAULT_LIMIT = 25
const BLOG_EDITOR_DEFAULT_OFFSET = 0

const defaultSettings: BlogEditorSettingsType = {
  canonicalUrl: '',
  categories: [],
  excerpt: '',
  isAnonymous: false,
  seoDescription: '',
  seoTitle: '',
  slug: '',
  tags: [],
}

export const blogEditorInitialState: BlogEditorStateType = {
  content: '',
  filterValue: '',
  initialContent: '',
  initialSettings: defaultSettings,
  initialTitle: '',
  limit: BLOG_EDITOR_DEFAULT_LIMIT,
  offset: BLOG_EDITOR_DEFAULT_OFFSET,
  orderBy: 'createdAt',
  settings: defaultSettings,
  sortDir: 'DESC',
  status: '',
  title: '',
}

const blogEditorSlice = createSlice({
  initialState: blogEditorInitialState,
  name: BLOG_EDITOR_ENTITY_NAME,
  reducers: {
    contentSet(state, action: PayloadAction<string>) {
      state.content = action.payload
    },
    editorFormLoad(
      state,
      action: PayloadAction<{
        content: string
        settings?: Partial<BlogEditorSettingsType>
        title: string
      }>,
    ) {
      const { content, settings: settingsPayload, title } = action.payload
      state.content = content
      state.initialContent = content
      state.initialTitle = title
      state.title = title
      if (settingsPayload) {
        const s = { ...defaultSettings, ...settingsPayload }
        state.settings = s
        state.initialSettings = s
      } else {
        state.settings = defaultSettings
        state.initialSettings = defaultSettings
      }
    },
    settingsSet(state, action: PayloadAction<Partial<BlogEditorSettingsType>>) {
      state.settings = { ...state.settings, ...action.payload }
    },
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
    titleSet(state, action: PayloadAction<string>) {
      state.title = action.payload
    },
  },
})

export const blogEditorActions = blogEditorSlice.actions

export const blogEditorReducer = blogEditorSlice.reducer
