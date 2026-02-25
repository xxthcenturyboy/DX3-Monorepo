import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { BlogEditorSettingsType } from './blog-admin-web.types'

const BLOG_EDITOR_SETTINGS_ENTITY_NAME = 'blogEditorSettings'

const defaultSettings: BlogEditorSettingsType = {
  canonicalUrl: '',
  categories: [],
  excerpt: '',
  featuredImageId: '',
  isAnonymous: false,
  seoDescription: '',
  seoTitle: '',
  slug: '',
  tags: [],
}

export type BlogEditorSettingsStateType = BlogEditorSettingsType

export const blogEditorSettingsInitialState: BlogEditorSettingsStateType = defaultSettings

const blogEditorSettingsSlice = createSlice({
  initialState: blogEditorSettingsInitialState,
  name: BLOG_EDITOR_SETTINGS_ENTITY_NAME,
  reducers: {
    settingsFormLoad(state, action: PayloadAction<Partial<BlogEditorSettingsType> | undefined>) {
      const s = action.payload ? { ...defaultSettings, ...action.payload } : defaultSettings
      return s
    },
    settingsSet(state, action: PayloadAction<Partial<BlogEditorSettingsType>>) {
      Object.assign(state, action.payload)
    },
  },
})

export const blogEditorSettingsActions = blogEditorSettingsSlice.actions
export const blogEditorSettingsReducer = blogEditorSettingsSlice.reducer
