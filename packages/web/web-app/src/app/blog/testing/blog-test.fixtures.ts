/**
 * Shared test fixtures for blog specs.
 * Import from blog/testing/blog-test.fixtures to avoid duplication across specs.
 */

import { createTheme } from '@mui/material/styles'

import type { BlogCategoryType, BlogTagType } from '@dx3/models-shared'

import type { BlogEditorSettingsType } from '../admin/blog-admin-web.types'

/** Auth state for specs that render auth-gated components */
export const AUTH_PRELOADED_STATE = {
  auth: {
    logoutResponse: false,
    password: '',
    token: 'test-token',
    userId: 'u1',
    username: 'u@example.com',
  },
}

/** Categories with slug (BlogCategoryType requirement) */
export const BLOG_TEST_CATEGORIES: BlogCategoryType[] = [
  { id: 'cat-1', name: 'Category A', slug: 'category-a' },
  { id: 'cat-2', name: 'Category B', slug: 'category-b' },
]

/** Tags with slug (BlogTagType requirement) */
export const BLOG_TEST_TAGS: BlogTagType[] = [
  { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
  { id: 'tag-2', name: 'Tag Y', slug: 'tag-y' },
]

/** Minimal category/tag set for drawer spec */
export const BLOG_TEST_CATEGORIES_MINIMAL: BlogCategoryType[] = [
  { id: 'cat-1', name: 'Category A', slug: 'category-a' },
]
export const BLOG_TEST_TAGS_MINIMAL: BlogTagType[] = [{ id: 'tag-1', name: 'Tag X', slug: 'tag-x' }]

/** Default blog editor settings shape */
export const DEFAULT_BLOG_EDITOR_SETTINGS: BlogEditorSettingsType = {
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

/** Blog editor body state for footer dirty check test */
export const BLOG_EDITOR_BODY_DIRTY_STATE = {
  blogEditorBody: {
    content: 'x',
    initialContent: '',
    initialTitle: '',
    title: 'Has Title',
  },
}

/** MUI theme for blog component specs */
export const BLOG_TEST_THEME = createTheme()
