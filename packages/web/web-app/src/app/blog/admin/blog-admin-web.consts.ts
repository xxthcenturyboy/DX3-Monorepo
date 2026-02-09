/**
 * Redux state key for blog editor module
 */
export const BLOG_EDITOR_ENTITY_NAME = 'blogEditor'

/**
 * Blog Editor routes (EDITOR role) - standalone from Admin menu
 */
export const BLOG_EDITOR_ROUTES = {
  EDIT: '/blog-editor/edit',
  LIST: '/blog-editor',
  MAIN: '/blog-editor',
  NEW: '/blog-editor/new',
  PREVIEW: '/blog-editor/preview',
} as const
